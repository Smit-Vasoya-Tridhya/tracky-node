const ErrorHandler = require("../helpers/errorHandler");
const catchAsyncErrors = require("../helpers/catchAsyncError");
const jwt = require("jsonwebtoken");
const Admin = require("../models/adminSchema");
const { permissionArrayToObj } = require("../utils/utils");
const Staff = require("../models/staffSchema");

exports.Adminprotect = catchAsyncErrors(async (req, res, next) => {
  const token = req.headers.authorization || req.headers.token;

  if (token) {
    var Authorization = token.split(" ")[1];
    const decodedUserData = jwt.verify(
      Authorization,
      process.env.JWT_SECRET_KEY
    );

    const user = await Admin.findById(decodedUserData.id)
      .populate("admin_role")
      .where("is_deleted")
      .equals(false)
      .select("-password")
      .lean();

    const staff = await Staff.findById(decodedUserData.id)
      .where("is_deleted")
      .equals(false)
      .select("-password")
      .lean();
    //

    if (user) {
      if (!user) return next(new ErrorHandler("User Not Found!", 401));
      if (user.admin_role)
        user.permission = permissionArrayToObj(user?.admin_role?.permissions);

      req.user = user;
    } else if (staff) {
      if (!staff) return next(new ErrorHandler("User Not Found!", 401));
      req.user = staff;
    }

    next();
  } else {
    return next(new ErrorHandler("You are not Authorised!", 401));
  }
});
