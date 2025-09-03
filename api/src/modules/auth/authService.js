// src/modules/auth/authService.js (ESM)

// ------------------------------------------------------------
// Auth Service
// ------------------------------------------------------------
// This simply re-exports the login and register functions
// from the Users module. Keeps a clean separation of concerns.
// ------------------------------------------------------------

import { login, register } from "#modules/users/userService.js";

export { login, register };
