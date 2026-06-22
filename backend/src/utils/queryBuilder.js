const { getPagination } = require('./pagination');

const buildListQuery = (query, options = {}) => {
  const {
    searchFields = [],
    filterFields = [],
    defaultSort = '-createdAt',
  } = options;

  const { page, limit, skip } = getPagination(query.page, query.limit);
  const filter = {};

  filterFields.forEach((field) => {
    if (query[field] !== undefined && query[field] !== '') {
      filter[field] = query[field];
    }
  });

  if (query.search && searchFields.length > 0) {
    filter.$or = searchFields.map((field) => ({
      [field]: { $regex: query.search, $options: 'i' },
    }));
  }

  let sort = defaultSort;
  if (query.sort) {
    sort = query.sort;
  }

  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  return { filter, sort: sortObj, page, limit, skip };
};

module.exports = { buildListQuery };
