var _ = require("underscore");
var exec = require("child_process").exec;
var CommandResult = require("./CommandResult");
var path = require("path");

module.exports = function(data){
  _.extend(this, data);
  this.finished = false;
}

module.exports.prototype.toJSON = function(){
  return {
    uuid: this.uuid,
    shelluuid: this.shelluuid,
    value: this.value,
    finished: this.finished
  }
}

module.exports.prototype.start = function(socket, runtime){
  var self = this;

  var options = {
    cwd: self.shell.cwd,
    env: self.shell.env,
    encoding: "binary"
  };
  var realtimeOutput = true;

  self.childProcess = exec(self.value, options);

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
  self.stderr = self.childProcess.stderr;
  self.commandResult = new CommandResult();
  
  self.stdout.on("data", function(data){
    self.commandResult.append(data);

    var attempt = data.toString('utf-8').replace(/�$/, ''), error = attempt.indexOf('�');
    if (error != -1) {
      utf8 = false;
    }
    if (/[\u0000]/.test(attempt)) {
      realtimeOutput = false;
    } else
      socket.emit(self.shelluuid+"/"+self.uuid+"/output", data);
  });

  self.stderr.on("data", function(chunk){
    socket.emit(self.shelluuid+"/"+self.uuid+"/output", chunk);
  });

  self.childProcess.on("close", function(code, signal){
    if(!realtimeOutput) {
      var data = self.commandResult.outputData();
      socket.emit(self.shelluuid+"/"+self.uuid+"/output", data);
    }
    socket.emit(self.shelluuid+"/"+self.uuid+"/terminated", self.uuid);
  });

}

module.exports.prototype.terminate = function(){
  if(this.childProcess)
    this.childProcess.kill();
  this.childProcess = null;
  this.stdin = this.stderr = this.stdout = null;
}