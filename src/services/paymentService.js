const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const StripePlan = require("../models/stripePlanSchema");
const { returnMessage, paginationObject } = require("../utils/utils");
const User = require("../models/userSchema");
const PaymentHistory = require("../models/paymentHistorySchema");
const logger = require("../logger");
const { eventEmitter } = require("../socket");
const moment = require("moment");
const Invoice = require("../models/invoiceSchema");
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
      const thirtyMinutesInDays = Math.ceil(30 / (24 * 60)); // Convert 30 minutes to days and round up

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
        subscription_data: {
          trial_settings: {
            end_behavior: {
              missing_payment_method: "cancel",
            },
          },
          trial_period_days: 1,
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
      logger.info("Events..", event.type);

      if (event.type === "checkout.session.completed") {
        console.log("checkout event start............");
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

        if (user?.subscription_id)
          await stripe.subscriptions.cancel(user?.subscription_id);
        await Promise.all([
          PaymentHistory.updateMany(
            { user_id: data?.metadata?.user_id },
            { active: false }
          ),
          PaymentHistory.create(paymentObj),
          User.findByIdAndUpdate(data?.metadata?.user_id, {
            subscription_id: data?.subscription,
            plan_purchased_type: plan?.interval,
            plan_purchased: true,
            on_board: true,
          }),
        ]);

        const invoicetObj = {
          session_id: data?.id,
          invoice_id: data?.invoice,
          plan_id: data?.metadata?.plan_id,
          user_id: data?.metadata?.user_id,
          interval: plan?.interval,
          subscription_id: data?.subscription,
          amount: data?.amount_total / 100,
        };

        const createdInvoice = await Invoice.create(invoicetObj);
        console.log("createdInvoice.......", createdInvoice);
        console.log("checkout session event end..........");
        eventEmitter(
          "PAYMENT_SUCCESS",
          { data: "Payment done successFully" },
          data?.metadata?.user_id
        );
      }
      if (event.type === "invoice.created") {
        console.log("invoice.created event start.....", event.type);

        const data = payload?.data?.object;
        console.log("data.................", data);

        const fetchedInvoice = await Invoice.findOne({
          subscription_id: data.subscription,
        }).lean();
        console.log("fetchedInvoice.......", fetchedInvoice);

        if (!fetchedInvoice || fetchedInvoice === null) {
          return true;
        } else {
          const fetchSubcription = await stripe.subscriptions.retrieve(
            fetchedInvoice.subscription_id
          );
          console.log("fetchSubcription........", fetchSubcription);
          const invoicetObj = {
            session_id: fetchedInvoice?.session_id,
            invoice_id: data?.id,
            plan_id: fetchSubcription?.plan?.id,
            user_id: fetchedInvoice?.user_id,
            interval: fetchSubcription.plan?.interval,
            subscription_id: data?.subscription,
            amount: data?.total / 100,
          };
          const createdInvoice = await Invoice.create(invoicetObj);
          console.log("createdInvoice.......", createdInvoice);

          return true;
        }
      }
      return true;
    } catch (error) {
      logger.error("error while handling webhook", error);
      return false;
    }
  };

  paymentHistory = async (payload) => {
    try {
      const pagination = paginationObject(payload);
      const queryObj = {};
      if (payload.search && payload.search !== "") {
        queryObj["$or"] = [
          {
            "user_id.email": { $regex: payload.search, $options: "i" },
          },
        ];
      }

      if (payload?.startDate && payload?.endDate) {
        const startDate = moment(payload?.startDate, "YYYY-MM-DD")
          .startOf("day")
          .format();
        const endDate = moment(payload?.endDate, "YYYY-MM-DD")
          .endOf("day")
          .format();
        queryObj["$and"] = [
          { createdAt: { $gte: new Date(startDate) } },
          { createdAt: { $lte: new Date(endDate) } },
        ];
      }
      const aggregate_arr = [
        {
          $lookup: {
            from: "users",
            localField: "user_id",
            foreignField: "_id",
            as: "user_id",
            pipeline: [{ $project: { email: 1, plan_purchased_type: 1 } }],
          },
        },
        { $unwind: "$user_id" },
        { $match: queryObj },
      ];
      console.log(pagination);
      const [payments, totalPayments, monthly_plan, yearly_plan] =
        await Promise.all([
          PaymentHistory.aggregate(aggregate_arr)
            .sort(pagination.sort)
            .skip(pagination.skip)
            .limit(pagination.resultPerPage),
          PaymentHistory.aggregate(aggregate_arr),
          StripePlan.findOne({ interval: "month" }).lean(),
          StripePlan.findOne({ interval: "year" }).lean(),
        ]);

      payments.forEach((payment) => {
        if (payment?.interval == "month") payment.plan = monthly_plan;
        else if (payment?.interval == "year") payment.plan = yearly_plan;
      });
      return {
        payments,
        page_count:
          Math.ceil(totalPayments.length / pagination.resultPerPage) || 0,
      };
    } catch (error) {
      logger.error(`Error While feching payment history: ${error}`);
      return error.message;
    }
  };
}

module.exports = PaymentService;
