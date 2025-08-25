import Patient from "./patientModel.js";

export async function create(doc) {
  const created = await Patient.create(doc);
  return created.toObject();
}

export async function findById(id, projection = {}) {
  const doc = await Patient.findById(id, projection).lean();
  return doc;
}

export async function updateById(id, update) {
  const doc = await Patient.findByIdAndUpdate(id, update, {
    new: true,
    lean: true,
  });
  return doc;
}

export async function search({
  filter,
  q,
  mrn,
  phone,
  dob,
  page = 1,
  limit = 20,
}) {
  const query = { ...filter };

  if (mrn) query.mrn = mrn;
  if (phone)
    query.phones = {
      $elemMatch: { $regex: escapeRegex(phone), $options: "i" },
    };
  if (dob) {
    // accept YYYY-MM-DD or ISO; compare on date-only
    const start = new Date(dob);
    const end = new Date(start);
    end.setDate(start.getDate() + 1);
    query.dob = { $gte: start, $lt: end };
  }
  if (q) {
    const like = { $regex: escapeRegex(q), $options: "i" };
    query.$or = [
      { "name.full": like },
      { "name.first": like },
      { "name.last": like },
      { mrn: like },
      { phones: like },
    ];
  }

  const cursor = Patient.find(query, {
    mrn: 1,
    "name.full": 1,
    dob: 1,
    sex: 1,
    phones: 1,
    createdAt: 1,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const [items, total] = await Promise.all([
    cursor,
    Patient.countDocuments(query),
  ]);
  return {
    items,
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
