const { login, register } = require("./authService");
async function postLogin(req, res, next) {
  try {
    res.json(await login(req.body));
  } catch (e) {
    next(e);
  }
}
async function postRegister(req, res, next) {
  try {
    res.status(201).json(await register(req.body));
  } catch (e) {
    next(e);
  }
}
module.exports = { postLogin, postRegister };
