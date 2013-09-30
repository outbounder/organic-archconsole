var _ = require("underscore");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
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
    finished: this.finished,
    cwd: this.cwd
  }
}

module.exports.prototype.start = function(){
  var self = this;

  var options = {
    cwd: this.cwd || self.shell.cwd,
    env: process.env,
    encoding: "binary"
  };
  options.env.CELL_MODE = ""

  var realtimeOutput = true;
  var shellCmd = self.value.indexOf("|") !== -1 ||
    self.value.indexOf("=") !== -1 ||
    self.value.indexOf("&") !== -1 || 
    self.value.indexOf(";") !== -1 ||
    self.value.indexOf('"') !== -1 ||
    self.value.indexOf('>') !== -1;

  self.childProcess = exec(self.value, options);

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
  self.stderr = self.childProcess.stderr;
}

module.exports.prototype.terminate = function(silent){
  this.childTerminateSiled = silent;
  if(this.childProcess)
    this.childProcess.kill();
  this.childProcess = null;
  this.stdin = this.stderr = this.stdout = null;
}