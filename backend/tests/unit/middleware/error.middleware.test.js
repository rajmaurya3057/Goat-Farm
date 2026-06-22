const errorHandler = require('../../../src/middleware/error.middleware');
const { errorResponse } = require('../../../src/utils/apiResponse');

jest.mock('../../../src/config/logger', () => ({
  error: jest.fn(),
}));

jest.mock('../../../src/utils/apiResponse', () => ({
  errorResponse: jest.fn(),
}));

describe('errorHandler', () => {
  const req = { path: '/test', method: 'GET' };
  const res = {};
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test';
  });

  it('handles ValidationError', () => {
    const err = {
      name: 'ValidationError',
      message: 'Validation failed',
      errors: { email: { message: 'Invalid email' } },
    };
    errorHandler(err, req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(res, 'Validation failed', 400, [
      { field: 'email', message: 'Invalid email' },
    ]);
  });

  it('handles duplicate key error', () => {
    const err = { code: 11000, keyPattern: { email: 1 } };
    errorHandler(err, req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(
      res,
      'email already exists',
      409,
      expect.any(Array)
    );
  });

  it('handles custom statusCode errors', () => {
    const err = new Error('Not found');
    err.statusCode = 404;
    errorHandler(err, req, res, next);
    expect(errorResponse).toHaveBeenCalledWith(res, 'Not found', 404);
  });
});
