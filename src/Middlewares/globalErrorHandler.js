export const globalErrorHandler = (error, req, res, next) => {
    const statusCode = error.statusCode  || 500;
    return res
      .status(statusCode)
      .json({ success: false, message: error.message, stack: error.stack });
  }