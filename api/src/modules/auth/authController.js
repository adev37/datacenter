// src/modules/auth/authController.js (ESM)

import { ZodError } from "zod";
import { login, register } from "#modules/auth/authService.js";

export async function postLogin(req, res, next) {
  try {
    const result = await login(req.body);
    res.json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return res
        .status(400)
        .json({ message: e.errors[0]?.message || "Bad request" });
    }
    next(e);
  }
}

export async function postRegister(req, res, next) {
  try {
    const result = await register(req.body);
    res.status(201).json(result);
  } catch (e) {
    if (e instanceof ZodError) {
      return res
        .status(400)
        .json({ message: e.errors[0]?.message || "Bad request" });
    }
    next(e);
  }
}
