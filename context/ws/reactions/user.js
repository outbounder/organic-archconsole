var runtime = require("models/server/runtime")
module.exports = function(c, next) {
  next && next(runtime.user)
}