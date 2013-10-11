var util = require("util")
var _ = require("underscore");
var glob = require("glob");
var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(data){
  _.extend(this, data);
}

util.inherits(module.exports, require("events").EventEmitter)


module.exports.prototype.toJSON = function(){
  return {
    uuid: this.uuid,
    runningCommand: this.runningCommand?this.runningCommand.uuid:null,
    user: this.user,
    cwd: this.cwd,
    name: this.name,
    version: this.version,
    git_status: this.git_status
  }
}

module.exports.prototype.setCwdAndNotify = function(value) {
  this.cwd = value
  this.emit("cwd:changed", value)
}

module.exports.prototype.terminate = function(){
  if(this.runningCommand)
    this.runningCommand.terminate(true);
  this.runningCommand = null;
}

var searchPath = function(target, match, callback){
  var entries = [];
  fs.readdir(target, function(err, files){
    if(err) {
      console.log(err);
      return callback(null, []);
    }
    files.forEach(function(f){
      if(f.indexOf(match) === 0)
        entries.push({match: f.replace(match,""), value: f});
    })
    callback(null, entries);
  });
}

module.exports.prototype.autocomplete = function(term, callback){

  var paths = [];
  var match;

  if(term.indexOf(" ") !== -1) {
    var target = term.split(" ").pop(); // last word is the target

    // assuming it is a file or directory
    if(target.indexOf("~") === 0)
      target = path.normalize(target.replace("~", this.user.home));
    if(target.indexOf(".") === 0 || (target.indexOf("/") !== 0 && target.indexOf(":\\") !== 1))
      target = path.normalize(path.join(this.cwd,target));

    // get match
    var parts = target.split(path.sep);
    match = parts.pop();
    target = parts.join(path.sep)+path.sep; // target should be a directory to be read from

    paths = paths.concat([target]);
  } else {
    match = term;
    paths = paths.concat([this.cwd]);
    paths = paths.concat(process.env.PATH.split(process.platform == "win32"?';':":"));
  }

  async.map(paths, function(p, callback){
    searchPath(p, match, callback);
  }, function(err, results){
    var entries = [];
    results.forEach(function(r){
      entries = entries.concat(r)
    });
    callback(entries);
  });

}
