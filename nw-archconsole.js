module.exports.packagejson = require("./package.json")
module.exports.getPort = function(callback) {
  if(process.env.CELL_MODE == "staging")
    callback(null, 3333)
  else
    callback(null, 3000)
}