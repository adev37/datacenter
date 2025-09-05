// ESM
import Patient from "./patientModel.js";

const baseFind = (branchId) => ({
  ...(branchId ? { branchId } : {}), // branch filter only when provided
  isDeleted: { $ne: true },
});

export const create = (doc) => Patient.create(doc);
export const byId = (id, branchId = null) =>
  Patient.findOne({ _id: id, ...baseFind(branchId) });

export const updateById = (id, branchId = null, update) =>
  Patient.findOneAndUpdate({ _id: id, ...baseFind(branchId) }, update, {
    new: true,
  });

export const markDeleted = (id, branchId = null, by = null) =>
  Patient.updateOne(
    { _id: id, ...baseFind(branchId) },
    {
      $set: {
        isDeleted: true,
        status: "inactive",
        deletedAt: new Date(),
        deletedBy: by,
      },
    }
  );

export const search = async ({
  branchId = null,
  search,
  gender,
  status,
  sort,
  page,
  limit,
}) => {
  const filter = baseFind(branchId);
  if (gender) filter.gender = gender;
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { $text: { $search: search } },
      { mrn: new RegExp(search, "i") },
      { phone: new RegExp(search, "i") },
      { firstName: new RegExp(search, "i") },
      { lastName: new RegExp(search, "i") },
    ];
  }
  const sortSpec =
    sort === "mrn"
      ? { mrn: 1 }
      : sort === "lastVisit"
      ? { updatedAt: -1 }
      : { lastName: 1, firstName: 1 };

  const total = await Patient.countDocuments(filter);
  const items = await Patient.find(filter)
    .collation({ locale: "en", strength: 2 })
    .sort(sortSpec)
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
  return { total, items };
};
