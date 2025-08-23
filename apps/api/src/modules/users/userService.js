const jwt = require("jsonwebtoken");
const { hashPassword, verifyPassword } = require("utils/crypto");
const { findByEmail, createUser } = require("./userRepository");

async function register({ email, name, password, roles = [], branches = [] }) {
  const exists = await findByEmail(email);
  if (exists)
    throw Object.assign(new Error("Email already registered"), { status: 400 });
  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, name, passwordHash, roles, branches });
  return toAuthToken(user);
}

async function login({ email, password }) {
  const user = await findByEmail(email);
  if (!user)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  const ok = await verifyPassword(password, user.passwordHash || "");
  if (!ok)
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  return toAuthToken(user);
}

function toAuthToken(user) {
  const payload = {
    sub: String(user._id),
    email: user.email,
    roles: user.roles || [],
    branches: user.branches || [],
  };
  const accessToken = jwt.sign(payload, process.env.API_JWT_SECRET, {
    expiresIn: "12h",
  });
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

module.exports = { register, login };
