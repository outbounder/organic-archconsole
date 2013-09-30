var _ = require("underscore");
var spawn = require("child_process").spawn;
var path = require("path");

module.exports = function(data){
  _.extend(this, data);
  this.finished = false;
}

module.exports.prototype.toJSON = function(){
  return {
    cid: this.cid,
    uuid: this.uuid,
    shelluuid: this.shelluuid,
    value: this.value,
    finished: this.finished,
    cwd: this.cwd
  }
}

module.exports.prototype.start = function(){
  var self = this;

  var options = {
    cwd: this.cwd || self.shell.cwd,
    env: self.shell.env,
    encoding: "binary"
  };

  var args = _.compact(this.value.split(" "))
  var cmd = args.shift()

  self.childProcess = spawn(cmd, args, options);

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
  self.stderr = self.childProcess.stderr;
  self.errorBuffer = ""
  var handler = function(d){ self.monitorSpawnStart(d, handler) }
  self.stderr.on("data", handler)
}

module.exports.prototype.monitorSpawnStart = function(data, handler){
  var self = this
  self.errorBuffer += data.toString()
  if(self.errorBuffer.indexOf("execvp") !== -1) {
    self.childProcess.emit("exit", 1, 0)
    self.terminate()
  }
  if(self.errorBuffer.length > 100)
    self.stderr.removeEventListener("data", handler)
}

module.exports.prototype.terminate = function(){
  if(this.childProcess)
    this.childProcess.kill();
  this.childProcess = null;
  this.stdin = this.stderr = this.stdout = null;
  this.finished = true;
}