const { successResponse, errorResponse } = require('../../../src/utils/apiResponse');

describe('apiResponse', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  it('successResponse returns correct shape', () => {
    successResponse(res, { id: 1 }, 'Created', 201, { page: 1 });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Created',
      data: { id: 1 },
      meta: { page: 1 },
    });
  });

  it('errorResponse returns correct shape', () => {
    errorResponse(res, 'Validation failed', 400, [{ field: 'email', message: 'Invalid' }]);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Validation failed',
      errors: [{ field: 'email', message: 'Invalid' }],
    });
  });
});
