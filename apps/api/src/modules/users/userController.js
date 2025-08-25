// src/modules/users/userController.js (ESM)

import { register, login } from "#modules/users/userService.js";

// ------------------------------------------------------------
// Controller functions for User authentication
// ------------------------------------------------------------
// - handleRegister: Creates a new user with hashed password
// - handleLogin: Authenticates a user and issues a JWT
// ------------------------------------------------------------

export async function handleRegister(req, res, next) {
  try {
    const out = await register(req.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}

export async function handleLogin(req, res, next) {
  try {
    const out = await login(req.body);
    res.json(out);
  } catch (e) {
    next(e);
  }
}
