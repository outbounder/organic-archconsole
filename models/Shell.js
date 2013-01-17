var _ = require("underscore");
module.exports = function(data){
  _.extend(this, data);
}

module.exports.prototype.toJSON = function(){
  return {
    uuid: this.uuid,
    runningCommand: this.runningCommand?this.runningCommand.uuid:null,
    user: this.user,
    cwd: this.cwd
  }
}

module.exports.prototype.terminate = function(archconsole){
  if(this.runningCommand)
    this.runningCommand.terminate(archconsole);
  this.runningCommand = null;
}