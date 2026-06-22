const { getPagination, buildPaginationMeta } = require('../../../src/utils/pagination');

describe('pagination utils', () => {
  it('getPagination returns correct skip and limits', () => {
    expect(getPagination(1, 10)).toEqual({ page: 1, limit: 10, skip: 0 });
    expect(getPagination(3, 10)).toEqual({ page: 3, limit: 10, skip: 20 });
  });

  it('caps limit at 100', () => {
    expect(getPagination(1, 500).limit).toBe(100);
  });

  it('buildPaginationMeta calculates total pages', () => {
    expect(buildPaginationMeta(50, 1, 10)).toEqual({
      page: 1,
      limit: 10,
      totalRecords: 50,
      totalPages: 5,
    });
  });
});
