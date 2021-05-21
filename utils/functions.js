exports.setFilters = (queries) => {
  const filters = { published: true };
  const {
    category, ingredient, author, search,
  } = queries;
  if (category) {
    filters.category = { $all: queries.category.split(',') };
  }
  if (ingredient) {
    filters.ingredient = { $all: queries.ingredient.split(',') };
  }
  if (author) filters.author = queries.author;
  if (search) {
    filters.title = { $regex: queries.search, $options: 'i' };
  }
  return filters;
};

exports.setSort = function(queries) {
  const { sort_by, order = 'desc' } = queries;
  let sort;
  switch (sort_by) {
    case 'date':
      sort = { timestamp: order };
      break;
    case 'alphabetical':
      sort = { title: order };
      break;
    case 'popularity':
      sort = { likes: order };
      break;
    default:
      sort = { timestamp: order };
  }
  return sort;
};