const Role = require("../models/roleSchema");
const Track = require("../models/trackRecordSchema");
const logger = require("../logger");
const { format } = require("fast-csv");
const moment = require("moment");
const createReadStream = require("fast-csv");
const User = require("../models/userSchema");
const { default: mongoose } = require("mongoose");

class TrackRecordService {
  getTrack = async (payload) => {
    try {
      const _id = payload.id;
      let trackData = await Role.findById(_id).lean();
      if (!trackData) return returnMessage("trackNotExist");
      return trackData;
    } catch (error) {
      logger.error("Error while fetch role", error);
      return error.message;
    }
  };

  updateTrackRecord = async (payload, user) => {
    try {
      const parsedDate = moment(payload.date);
      const date = parsedDate.utc().startOf("day");
      const formattedDate = date.format();
      const existingData = await Track.findOne({
        date: formattedDate,
        user_id: user._id,
      });

      if (existingData) {
        return await Track.findByIdAndUpdate(
          existingData._id,
          { ...payload, date: formattedDate },
          { new: true }
        );
      } else {
        const createTrack = await Track.create({
          ...payload,
          date: date,
          user_id: user._id,
        });
        return createTrack;
      }
    } catch (error) {
      logger.error("Error while update track record", error);
      return error.message;
    }
  };

  getTrackRecord = async (user) => {
    try {
      let profileData = await User.findById(user._id)
        .select("-password -last_session")
        .populate("role")
        .lean();
      if (!profileData) return returnMessage("profileNotExist");

      let trackData = await Track.find({ user_id: user._id }).lean();
      const sumData = {};

      if (profileData?.role?.key === "setter") {
        sumData.total_chat = trackData.reduce(
          (sum, entry) => sum + entry.total_chat,
          0
        );
      } else if (profileData?.role?.key === "closer") {
        sumData.total_calls = trackData.reduce(
          (sum, entry) => sum + entry.total_calls,
          0
        );
      }

      sumData.total_client = trackData.reduce(
        (sum, entry) => sum + entry.total_client,
        0
      );
      sumData.total_closed = trackData.reduce(
        (sum, entry) => sum + entry.total_closed,
        0
      );
      sumData.total_lost = trackData.reduce(
        (sum, entry) => sum + entry.total_lost,
        0
      );

      const totalDealSize = trackData.reduce(
        (sum, entry) => sum + entry.average_deal_size,
        0
      );
      sumData.average_deal_size =
        trackData.length > 0 ? totalDealSize / trackData.length : 0;

      const lastMonthTrackData = await Track.find({
        user_id: user._id,
        date: {
          $gte: moment().subtract(1, "months").startOf("month").toDate(),
          $lt: moment().startOf("month").toDate(),
        },
      }).lean();

      const totalDealSizeLastMonth = lastMonthTrackData.reduce(
        (sum, entry) => sum + entry.average_deal_size,
        0
      );
      const yearProfit = trackData.reduce(
        (sum, entry) => sum + entry.average_deal_size,
        0
      );
      const monthlyData = await Track.aggregate([
        {
          $match: {
            user_id: profileData._id,
            date: {
              $gte: moment().startOf("year").toDate(),
              $lt: moment().toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              month: { $month: "$date" },
              year: { $year: "$date" },
            },
            totalDealSize: { $sum: "$average_deal_size" },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                ],
                default: "Unknown",
              },
            },
            year: "$_id.year",
            avgDealSize: { $divide: ["$totalDealSize", "$count"] },
          },
        },
        {
          $sort: { year: 1, month: 1 },
        },
      ]);

      const generateEmptyMonthlyData = (monthsCount) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];

        const currentYear = moment().year();
        const currentMonthIndex = moment().month();
        const currentDate = moment();

        return Array.from({ length: monthsCount }, (_, index) => {
          const pastDate = moment().subtract(index, "months");
          const year = pastDate.year();
          const month = months[pastDate.month()];

          return {
            month,
            year,
            avgDealSize: 0,
          };
        });
      };

      const monthsCount = 12;
      const emptyMonthlyData = generateEmptyMonthlyData(monthsCount);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const mergedData = emptyMonthlyData.map((emptyMonth) => ({
        ...emptyMonth,
        ...monthlyData.find(
          (data) =>
            data.month === emptyMonth.month && data.year === emptyMonth.year
        ),
      }));
      mergedData.sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year;
        }
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
      const currentsYears = moment().year();

      const graphData = {
        totalDealSizeLastMonth,
        yearProfit,
        mergedData,
        currentsYears,
      };

      return { sumData, profileData, graphData };
    } catch (error) {
      logger.error("Error while fetch track record", error);
      return error.message;
    }
  };

  getMonthlyData = async (query, user) => {
    try {
      let profileData = await User.findById(user._id)
        .select("-password -last_session")
        .populate("role")
        .lean();
      if (!profileData) return returnMessage("profileNotExist");
      const daysAgo = query.days;
      const monthsAgo = query.months;

      let startDate;
      if (daysAgo) {
        startDate = moment().subtract(daysAgo, "days").startOf("day");
      } else if (monthsAgo) {
        startDate = moment().subtract(monthsAgo, "months").startOf("month");
      } else {
        startDate = moment().startOf("year"); // Default to the beginning of the year if neither days nor months are specified
      }

      const matchStage = {
        $match: {
          user_id: user._id,
          date: {
            $gte: startDate.toDate(),
            $lt: moment().toDate(),
          },
          $or: [{ total_closed: { $gt: 0 } }, { total_calls: { $gt: 0 } }],
        },
      };

      const groupStage = daysAgo
        ? {
            $group: {
              _id: {
                day: { $dayOfMonth: "$date" },
                month: { $month: "$date" },
                year: { $year: "$date" },
              },
              totalClose: { $sum: "$total_closed" },
              totalCalls: { $sum: "$total_calls" },
            },
          }
        : {
            $group: {
              _id: { month: { $month: "$date" }, year: { $year: "$date" } },
              totalClose: { $sum: "$total_closed" },
              totalCalls: { $sum: "$total_calls" },
            },
          };

      const monthlyData = await Track.aggregate([
        matchStage,
        groupStage,
        {
          $project: {
            _id: 0,
            day: "$_id.day",
            month: {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                ],
                default: "Unknown",
              },
            },
            year: "$_id.year",
            totalClose: 1,
            totalCalls: 1,
          },
        },
        {
          $sort: { year: 1, month: 1, day: 1 },
        },
      ]);
      if (monthsAgo) {
        const generateEmptyMonthlyData = (monthsCount) => {
          const months = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];

          const currentDate = moment();
          const currentYear = currentDate.year();
          const currentMonthIndex = currentDate.month();

          return Array.from({ length: monthsCount }, (_, index) => {
            const pastDate = moment().subtract(index, "months");
            const year = pastDate.year();
            const month = months[pastDate.month()];

            return {
              month,
              year,
              totalClose: 0,
              totalCalls: 0,
            };
          });
        };
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const monthsCount = monthsAgo || 12; // Default to the last 6 months if monthsAgo is not specified
        const emptyMonthlyData = generateEmptyMonthlyData(monthsCount);

        const mergedData = emptyMonthlyData.map((emptyMonth) => ({
          ...emptyMonth,
          ...monthlyData.find((data) => data.month === emptyMonth.month),
        }));
        mergedData.sort((a, b) => {
          if (a.year !== b.year) {
            return a.year - b.year;
          }
          return months.indexOf(a.month) - months.indexOf(b.month);
        });
        const currentsYears = moment().year();
        return { mergedData, currentsYears };
      }

      if (daysAgo) {
        const generateEmptyDailyData = (daysCount) => {
          const currentDay = moment().date();
          const currentMonth = moment().month() + 1;
          const currentYear = moment().year();

          return Array.from({ length: daysCount }, (_, index) => {
            const date = moment().subtract(index, "days").startOf("day");

            return {
              day: date.date(),
              month: date.month() + 1,
              year: date.year(),
              totalClose: 0,
              totalCalls: 0,
            };
          });
        };

        const daysCount = daysAgo || 30; // Default to the last 30 days if daysAgo is not specified
        const emptyDailyData = generateEmptyDailyData(daysCount);

        const mergedData = emptyDailyData.map((emptyDay) => ({
          ...emptyDay,
          ...monthlyData.find(
            (data) =>
              data.day === emptyDay.day &&
              // data.month === emptyDay.month &&
              data.year === emptyDay.year
          ),
        }));
        const currentsYears = moment().year();
        return { mergedData, currentsYears };
      }
    } catch (error) {
      logger.error("Error while fetching track record monthly data", error);
      return error.message;
    }
  };

  getRecordByDate = async (params, user) => {
    try {
      const parsedDate = moment(params.date);
      const date = parsedDate.utc().startOf("day");
      const formattedDate = date.format();
      // const user_id = new mongoose.Types.ObjectId(user._id);
      return await Track.findOne({
        date: formattedDate,
        user_id: user._id,
      }).lean();
    } catch (error) {
      logger.error("Error while fetch track record", error);
      return error.message;
    }
  };
}

module.exports = TrackRecordService;
