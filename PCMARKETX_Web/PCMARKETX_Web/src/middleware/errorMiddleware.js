// Bulunamayan rotalar için hata işleyici
const notFound = (req, res, next) => {
  const error = new Error(`Sayfa bulunamadı - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Genel hata işleyici
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = { notFound, errorHandler }; 