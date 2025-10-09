module.exports = function errorHandler(err, req, res, next) { 
  console.error(`[${req.timestamp || new Date().toISOString()}] an error occurred: ${err.message}`);
  if (res.headersSent) return; 
  res.status(500).json({ message: err.message });
};


