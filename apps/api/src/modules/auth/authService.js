// src/modules/auth/authService.js (ESM)

// ------------------------------------------------------------
// Auth Service
// ------------------------------------------------------------
// This simply re-exports the login and register functions
// from the Users module. Keeps a clean separation of concerns
// so that the Auth module depends on User business logic.
// ------------------------------------------------------------

import { login, register } from "#modules/users/userService.js";

export { login, register };
