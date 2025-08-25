// src/modules/users/userRepository.js (ESM)

import { User } from "#modules/users/userModel.js";

export function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

export function findByEmail(email) {
  return User.findOne({ email: normalizeEmail(email) });
}

export function createUser(data) {
  const doc = { ...data, email: normalizeEmail(data.email) };
  return User.create(doc);
}

export function assignRoles(userId, roles) {
  return User.updateOne({ _id: userId }, { $set: { roles } });
}
