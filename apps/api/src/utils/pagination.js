// src/utils/pagination.js (ESM)

// ------------------------------------------------------------
// Pagination utility
// ------------------------------------------------------------
// Converts query parameters { page, pageSize } into MongoDB-style
// skip & limit values for pagination.
// Ensures values are >= 1.
// ------------------------------------------------------------

export function toPageQuery({ page = 1, pageSize = 20 } = {}) {
  const skip = (Math.max(1, Number(page)) - 1) * Math.max(1, Number(pageSize));
  const limit = Math.max(1, Number(pageSize));
  return { skip, limit };
}
