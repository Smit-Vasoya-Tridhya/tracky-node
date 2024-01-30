const express = require("express");
require("./config/connection");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const port = process.env.PORT || 3000;
const errorHandler = require("./helpers/error");
const path = require("path");
const cors = require("cors");
const rootRoutes = require("./routes/index");
const logger = require("./logger");
const morgan = require("morgan");
const swagger = require("swagger-ui-express");
const http = require("http");
const { socket_connection } = require("./socket");
const server = http.createServer(app);
socket_connection(server);
const PaymentHistory = require("./models/paymentHistorySchema");
const ReferralHistory = require("./models/referralHistorySchema");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const moment = require("moment");
const cron = require("node-cron");
const { insertData } = require("../seeder");
app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(
  "/email-template",
  express.static(path.join(__dirname, "public/email_template"))
);
app.use(rootRoutes);

// Run the Cron Job to avail one month free of the referral
cron.schedule("5 0 */1 * *", async () => {
  try {
    logger.info("Cron Job Started");
    const referrals = await ReferralHistory.distinct("referred_by", {
      registered: true,
    });
    console.log(referrals, 41);
    referrals.forEach(async (referral) => {
      const total_referral = await ReferralHistory.countDocuments({
        referred_by: referral?.referred_by,
        registered: true,
      });
      if (total_referral !== 10) return;

      const payment_history = await PaymentHistory.findOne({
        user_id: referral?.referred_by,
      })
        .populate("user_id")
        .sort({ createdAt: 1 })
        .lean();
      if (!payment_history) return;
      if (
        !payment_history?.user_id ||
        (payment_history?.user_id &&
          payment_history?.user_id?.subscription_id !== "" &&
          payment_history?.user_id?.plan_purchased &&
          payment_history?.user_id?.plan_purchased_type !== null)
      )
        return;
      let years_difference = 0;
      if (payment_history?.user_id?.last_reward_date) {
        const start_date = moment(payment_history?.user_id?.last_reward_date);
        const end_date = moment();
        years_difference = end_date.diff(start_date, "years");
        if (years_difference <= 1) return;
      }
      if (
        !payment_history?.user_id?.last_reward_date ||
        years_difference >= 1
      ) {
        await stripe.subscriptions.update(
          payment_history?.user_id?.subscription_id,
          {
            trial_end: subscription.current_period_end + 30 * 24 * 60 * 60, // Extend by 30 days
          }
        );

        await User.findByIdAndUpdate(payment_history?.user_id?._id, {
          last_reward_date: moment().format(),
        });
        console.log(referral?._id);
      }
    });
  } catch (error) {
    logger.error(
      `Error while running cron job of the one month free referral: ${error}`
    );
  }
});

// handling error from all of the route
app.use(errorHandler);

const swaggerDoc = require("./swagger/swagger.index");

const User = require("./models/userSchema");

app.use("/swagger-doc", swagger.serve);
app.use("/swagger-doc", swagger.setup(swaggerDoc));
server.listen(port, async () => {
  // await insertData();
  logger.info(`Server started at port:${port}`);
});

// app.get("/", async (req, res) => {
//   try {
//     const mp3 = await ai_client.audio.speech.create({
//       model: "tts-1",
//       voice: "onyx",
//       input: "Today is a wonderful day to build something people love!",
//     });
//     console.log(speechFile);
//     const buffer = Buffer.from(await mp3.arrayBuffer());
//     res.writeHead(200, {
//       Connection: "keep-alive",
//       "Content-Type": "audio/mpeg",
//       "Cache-Control": "no-cache",
//     });
//     res.write(buffer);
//     res.end();
//   } catch (error) {
//     console.log(error);
//   }
// });
