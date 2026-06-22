const { buildListQuery } = require('../../../src/utils/queryBuilder');

describe('queryBuilder', () => {
  it('builds filter with search and pagination', () => {
    const result = buildListQuery(
      { page: '2', limit: '5', search: 'sheru', gender: 'Male', sort: '-createdAt' },
      { searchFields: ['name', 'uidTag'], filterFields: ['gender', 'status'] }
    );

    expect(result.page).toBe(2);
    expect(result.limit).toBe(5);
    expect(result.skip).toBe(5);
    expect(result.filter.gender).toBe('Male');
    expect(result.filter.$or).toHaveLength(2);
    expect(result.sort.createdAt).toBe(-1);
  });

  it('uses default sort when not provided', () => {
    const result = buildListQuery({}, { defaultSort: 'name' });
    expect(result.sort.name).toBe(1);
  });
});
