// src/utils/crypto.js (ESM)

import bcrypt from "bcrypt";

// ------------------------------------------------------------
// Crypto utilities for password hashing & verification
// ------------------------------------------------------------
// - hashPassword: securely hashes a plain password using bcrypt
// - verifyPassword: compares a plain password against a hash
// ------------------------------------------------------------

/**
 * Hash a plain password with bcrypt.
 * @param {string} plain - The raw user password.
 * @returns {Promise<string>} - The bcrypt hash.
 */
export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

/**
 * Verify a plain password against a stored hash.
 * @param {string} plain - Raw password input.
 * @param {string} hash - Stored bcrypt hash.
 * @returns {Promise<boolean>} - True if match, else false.
 */
export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}
