// api/src/modules/auth/authService.js
// ESM
// Thin service that re-exports from users service to keep concerns clean.

import { login, register } from "#modules/users/userService.js";

export { login, register };
