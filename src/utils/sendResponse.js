module.exports = (
  response,
  success = true,
  message = "Fetched Successfully!",
  data,
  statusCode = 200
) => {
  response
    .status(statusCode)
    .json({ success, message, data, status: statusCode });
};
