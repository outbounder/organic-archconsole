var runtime = require("models/server/runtime");

module.exports = function(config){
  return {
    "GET": function(data, callback){
      callback(runtime.user);
    }
  }
}