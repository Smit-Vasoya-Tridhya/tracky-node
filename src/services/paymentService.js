const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const StripePlan = require("../models/stripePlanSchema");
const { returnMessage } = require("../utils/utils");
const User = require("../models/userSchema");
class Payment {
  createPlan = async (payload) => {
    try {
      const productObj = {
        name: payload?.name,
        description: payload?.description,
        price: payload?.price,
        interval: payload?.interval,
        currency: payload?.currency,
        sort_value: payload?.sort_value,
      };
      const product = await StripePlan.create(productObj);
      if (!product) return returnMessage("default");

      const stripeObject = {
        id: product?._id,
        name: product?.name,
        description: product?.description,
      };
      const stripeProduct = await stripe.products.create(stripeObject);
      if (!stripeProduct) return returnMessage("default");

      const stripePlan = await stripe.plans.create({
        currency: product?.currency,
        amount: product?.price * 100,
        interval: product?.interval,
        product: stripeProduct?.id,
      });
      if (!stripePlan) {
        await StripePlan.findByIdAndDelete(product._id);
        return returnMessage("default");
      }

      return await StripePlan.findByIdAndUpdate(
        product?._id,
        { plan_id: stripePlan?.id },
        { new: true }
      );
    } catch (error) {
      console.log("Error while creating the plan", error);
      return error.message;
    }
  };

  getPlans = async () => {
    try {
      return await StripePlan.find().sort({ sort_value: 1 }).lean();
    } catch (error) {
      console.log("error while get all of the products", error);
      return error.message;
    }
  };

  checkoutSession = async (payload, user) => {
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: payload.plan_id,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: payload?.success_url,
        cancel_url: payload?.cancel_url,
        metadata: {
          user_id: user?._id?.toString(),
          plan_id: payload?.plan_id,
        },
      });
      await User.findByIdAndUpdate(user._id, { last_session: session?.id });
      return { checkout_url: session?.url };
    } catch (error) {
      console.log("error while creating the checkout link", error);
      return error.message;
    }
  };

  webhookHandle = async (payload) => {
    try {
      const secret = process.env.STRIPE_WEBHOOK_SECRET;
      const payloadString = JSON.stringify(payload, null, 2);
      const header = stripe.webhooks.generateTestHeaderString({
        payload: payloadString,
        secret,
      });
      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(
        payloadString,
        header,
        secret
      );
      console.group(payloadString, 97);
      return true;
    } catch (error) {
      console.log("error while handling webhook", error.message);
      return false;
    }
  };
}

module.exports = Payment;
