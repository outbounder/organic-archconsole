var _ = require("underscore");
module.exports = function(data){
  _.extend(this, data);
}


module.exports.prototype.toJSON = function(){
  return {
    username: this.username,
    home: this.home
  }
}
