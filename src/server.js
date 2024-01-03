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

app.use(express.json());
app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));
app.use(
  "/email-template",
  express.static(path.join(__dirname, "public/email_template"))
);
app.use(rootRoutes);

// handling error from all of the route
app.use(errorHandler);

const swaggerDoc = require("./swagger/swagger.index");

app.use("/swagger-doc", swagger.serve);
app.use("/swagger-doc", swagger.setup(swaggerDoc));
server.listen(port, async () => {
  logger.info(`Server started at port:${port}`);
  try {
    const stripe = require("stripe")(
      "sk_test_51OOesWChuAbH8fImWDZwTtUqlvWaQL7sRnoX5JzSpq6ufoa0PV9ylyGjtb5GStm8n7f8Umzk7akLFNxT9GXYj77I00F8AFkShp"
    );
    // const subscription = await stripe.subscriptions.retrieve(
    //   "sub_1OU3vxChuAbH8fImMZ9mh66i"
    // );
    // const newTime = 30 * 24 * 60 * 60;

    // const extendedSubscription = await stripe.subscriptions.update(
    //   "sub_1OU3vxChuAbH8fImMZ9mh66i",
    //   {
    //     trial_end: subscription.current_period_end + 30 * 24 * 60 * 60, // Extend by 30 days (adjust as needed)
    //   }
    // );

    // const subscription2 = await stripe.subscriptions.retrieve(
    //   "sub_1OU3vxChuAbH8fImMZ9mh66i"
    // );
    // console.log(subscription2);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: "plan_PD7e6zAHuSJ2QB",
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: "https://www.facebook.com/",
      cancel_url: "https://www.google.com/",
      subscription_data: { billing_cycle_anchor:  },

      metadata: {
        user_id: "6593e9ea653912b914413dd0",
        plan_id: "plan_PD7e6zAHuSJ2QB",
      },
    });
    console.log(session);
  } catch (err) {
    console.log(err.message, 55);
  }
});
