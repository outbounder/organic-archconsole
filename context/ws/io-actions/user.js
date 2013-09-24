var runtime = require("../models/runtime");

module.exports = function(config){
  return {
    "GET": function(data, callback){
      callback(runtime.user);
    }
  }
}