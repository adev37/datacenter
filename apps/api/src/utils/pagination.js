function toPageQuery({ page = 1, pageSize = 20 } = {}) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
  const limit = Math.max(1, Number(pageSize));
  return { skip, limit };
}
module.exports = { toPageQuery };
