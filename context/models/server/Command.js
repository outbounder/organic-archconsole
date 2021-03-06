var _ = require("underscore");
var spawn = require("child_process").spawn;
var exec = require("child_process").exec;
var fs = require("fs");
var path = require("path");
var util = require("util")
var EventEmitter = require("events").EventEmitter
var kill = require("killprocess")

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
  EventEmitter.call(this)
  _.extend(this, data);
  this.finished = false;
  if(!this.env)
    this.env = {}
}

util.inherits(module.exports, EventEmitter)

module.exports.prototype.toJSON = function(){
  return {
    cid: this.cid,
    uuid: this.uuid,
    shelluuid: this.shelluuid,
    value: this.value,
    finished: this.finished,
    cwd: this.cwd,
    isPTY: this.isPTY,
    startedAt: this.startedAt
  }
}

module.exports.prototype.start = function(){
  this.startedAt = new Date()
  if(this.isPTY)
    this.startWithPTY()
  else
    this.startChild()
}

module.exports.prototype.startWithPTY = function(){
  var self = this
  var pty = require('pty.js')

  var options = {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: this.cwd || self.shell.cwd,
    env: _.extend({}, self.shell.env, this.env)
  };

  var args = _.compact(this.value.split(" "))
  var cmd = args.shift()
  joinQuotedArgs(args)
  self.childProcess = pty.spawn(cmd, args, options)

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
}

module.exports.prototype.startChild = function(){
  var self = this;

  var options = {
    cwd: this.cwd || self.shell.cwd,
    env: _.extend({}, self.shell.env, this.env)
  };
  
  self.childProcess = exec(this.value, options)

  self.childProcess.on("error", function(){
    console.log(self.value)
    console.log(arguments)
    self.terminate()
  })

  self.stdin = self.childProcess.stdin;
  self.stdout = self.childProcess.stdout;
  self.stderr = self.childProcess.stderr;
}

module.exports.prototype.terminate = function(omitEmit){
  var self = this
  if(this.childProcess) {
    try {
      kill(this.childProcess.pid, "SIGINT");
    } catch(err){
      // silently do nothing if pid is not found
    }
  }
  self.terminated = true;
  if(!omitEmit)
    self.emit("terminate")
}

module.exports.joinQuotedArgs = joinQuotedArgs
