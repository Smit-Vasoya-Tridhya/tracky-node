module.exports = (theAsyncErrorFunction) => {
  return (req, res, next) => {
    theAsyncErrorFunction(req, res, next).catch(next);
  };
};
