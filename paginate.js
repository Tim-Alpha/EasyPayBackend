function paginate(data, page = 1, pageSize = 5) {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedData = data.slice(startIndex, endIndex);

  return paginatedData;
}