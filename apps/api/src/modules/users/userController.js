const { register, login } = require("./userService");

async function handleRegister(req, res, next) {
  try {
    const out = await register(req.body);
    res.status(201).json(out);
  } catch (e) {
    next(e);
  }
}
async function handleLogin(req, res, next) {
  try {
    const out = await login(req.body);
    res.json(out);
  } catch (e) {
    next(e);
  }
}

module.exports = { handleRegister, handleLogin };
