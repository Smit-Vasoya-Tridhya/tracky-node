const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const StripePlan = require("../models/stripePlanSchema");
const { returnMessage } = require("../utils/utils");

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
      console.log("error while get all of the products");
    }
  };
}

module.exports = Payment;
