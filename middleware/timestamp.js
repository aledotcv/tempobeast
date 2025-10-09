module.exports = function timestamp(req, res, next) {
  req.timestamp = new Date().toISOString();
  next();
};


