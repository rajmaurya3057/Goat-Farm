const successResponse = (res, data, message = 'Operation successful', statusCode = 200, meta = undefined) => {
  const body = { success: true, message, data };
  if (meta !== undefined) {
    body.meta = meta;
  }
  return res.status(statusCode).json(body);
};

const errorResponse = (res, message, statusCode = 400, errors = undefined) => {
  const body = { success: false, message };
  if (errors !== undefined) {
    body.errors = errors;
  }
  return res.status(statusCode).json(body);
};

module.exports = { successResponse, errorResponse };
