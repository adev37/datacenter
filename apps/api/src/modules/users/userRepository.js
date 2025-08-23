const { User } = require("./userModel");

function findByEmail(email) {
  return User.findOne({ email });
}
function createUser(data) {
  return User.create(data);
}
function assignRoles(userId, roles) {
  return User.updateOne({ _id: userId }, { $set: { roles } });
}
module.exports = { findByEmail, createUser, assignRoles };
