const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const StripePlan = require("../models/stripePlanSchema");
const { returnMessage } = require("../utils/utils");
const User = require("../models/userSchema");
const PaymentHistory = require("../models/paymentHistorySchema");
const logger = require("../logger");
class PaymentService {
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
      logger.error("Error while creating the plan", error);
      return error.message;
    }
  };

  getPlans = async () => {
    try {
      return await StripePlan.find().sort({ sort_value: 1 }).lean();
    } catch (error) {
      logger.error("error while get all of the products", error);
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
      logger.error("error while creating the checkout link", error);
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
      if (event.type === "checkout.session.completed") {
        const data = payload?.data?.object;
        const user = await User.findById(data?.metadata?.user_id).lean();

        const plan = await StripePlan.findOne({
          plan_id: data?.metadata?.plan_id,
        }).lean();

        const paymentObj = {
          session_id: data?.id,
          invoice_id: data?.invoice,
          plan_id: data?.metadata?.plan_id,
          user_id: data?.metadata?.user_id,
          interval: plan?.interval,
          subscription_id: data?.subscription,
          active: true,
        };
        await Promise.all([
          stripe.subscription.cancel(user?.subscription_id),
          PaymentHistory.updateMany(
            { user_id: data?.metadata?.user_id },
            { active: false }
          ),
          PaymentHistory.create(paymentObj),
          User.findByIdAndUpdate(data?.metadata?.user_id, {
            plan_purchased_type: plan?.interval,
            plan_purchased: true,
            on_board: true,
          }),
        ]);
      }
      return true;
    } catch (error) {
      logger.error("error while handling webhook", error);
      return false;
    }
  };
}

module.exports = PaymentService;
