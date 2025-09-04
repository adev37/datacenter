// api/src/modules/users/userService.js
// ESM

import jwt from "jsonwebtoken";
import { z } from "zod";
import { hashPassword, verifyPassword } from "#utils/crypto.js";
import {
  findByEmail,
  createUser,
  normalizeEmail,
} from "#modules/users/userRepository.js";

// ─────────────────────────────────────────────────────────────
// Validation schemas
// ─────────────────────────────────────────────────────────────
const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Email format is invalid");

const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(6, "Password must be at least 6 characters");

const registerSchema = z.object({
  email: emailSchema,
  name: z.string().optional(),
  password: passwordSchema,
  roles: z.array(z.string()).optional(),
  branches: z.array(z.string()).optional(),
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "Password is required" }),
});

// ─────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────
export async function register(input) {
  const {
    email,
    name,
    password,
    roles = [],
    branches = [],
  } = registerSchema.parse(input);

  const exists = await findByEmail(email);
  if (exists) {
    throw Object.assign(new Error("Email already registered"), { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  const user = await createUser({
    email: normalizeEmail(email),
    name,
    passwordHash,
    roles,
    branches,
  });

  return toAuthToken(user);
}

export async function login(input) {
  const { email, password } = loginSchema.parse(input);

  const user = await findByEmail(email);
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash || "");
  if (!ok) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  return toAuthToken(user);
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function toAuthToken(user) {
  const payload = {
    sub: String(user._id),
    email: user.email,
    roles: user.roles || [],
    branches: user.branches || [],
  };

  const secret = process.env.API_JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error("API_JWT_SECRET is not configured"), {
      status: 500,
    });
  }

  const accessToken = jwt.sign(payload, secret, { expiresIn: "12h" });
  return {
    accessToken,
    user: {
      id: payload.sub,
      email: payload.email,
      roles: payload.roles,
      branches: payload.branches,
    },
  };
}
