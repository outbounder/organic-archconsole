var _ = require("underscore");
var spawn = require("child_process").spawn;
var path = require("path");

var joinQuotedArgs = function(args) {
  var wholeArgumentBuffer = []
  for(var i = 0; i<args.length; i++) {
    if(args[i].indexOf('"') === 0) {
      wholeArgumentBuffer.push(args[i].replace('"',""))
      args.splice(i, 1)
      i -= 1
      continue
    }
    if(args[i].indexOf('"') != -1) {
      wholeArgumentBuffer.push(args[i].replace('"',""))
      args.splice(i, 1, wholeArgumentBuffer.join(" "))
      wholeArgumentBuffer = []
      continue
    }
    if(wholeArgumentBuffer.length != 0) {
      wholeArgumentBuffer.push(args[i])
      args.splice(i, 1)
      i -= 1
    }
  }
}

module.exports = function(data){
  _.extend(this, data);
  this.finished = false;
  if(!this.env)
    this.env = {}
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
    env: _.extend({}, self.shell.env, this.env),
    encoding: "binary"
  };

  var args = _.compact(this.value.split(" "))
  var cmd = args.shift()
  joinQuotedArgs(args)
  self.childProcess = spawn(cmd, args, options);

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
  self.stderr = self.childProcess.stderr;

  // node.js core ftw?
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
    self.stderr.removeListener("data", handler)
}

module.exports.prototype.terminate = function(){
  if(this.childProcess)
    this.childProcess.kill();
  this.childProcess = null;
  this.stdin = this.stderr = this.stdout = null;
  this.finished = true;
}

module.exports.joinQuotedArgs = joinQuotedArgs
