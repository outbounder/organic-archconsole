var _ = require("underscore");
var glob = require("glob");
var path = require('path');
var fs = require('fs');
var async = require('async');

module.exports = function(data){
  _.extend(this, data);
}

module.exports.prototype.toJSON = function(){
  return {
    uuid: this.uuid,
    runningCommand: this.runningCommand?this.runningCommand.uuid:null,
    user: this.user,
    cwd: this.cwd,
    name: this.name,
    version: this.version
  }
}

module.exports.prototype.terminate = function(archconsole){
  if(this.runningCommand)
    this.runningCommand.terminate(archconsole);
  this.runningCommand = null;
}

var searchPath = function(target, match, callback){
  var entries = [];
  fs.readdir(target, function(err, files){
    if(err) return callback(err);
    files.forEach(function(f){
      if(f.indexOf(match) === 0)
        entries.push({match: f.replace(match,""), value: f});
    })
    callback(null, entries);
  });  
}

module.exports.prototype.autocomplete = function(term, callback){
  var target = term.split(" ").pop();
  if(target.indexOf("~") === 0)
    target = path.normalize(target.replace("~", this.user.home));
  if(target.indexOf(".") === 0 || target.indexOf("/") !== 0)
    target = path.normalize(this.cwd+"/"+target);
  var parts = target.split("/");
  var match = parts.pop();
  target = parts.join("/");
  var entries = [];
  var paths = [target].concat(process.env.PATH.split(':'));
  async.map(paths, function(p, callback){
    searchPath(p, match, callback);
  }, function(err, results){
    results.forEach(function(r){
      entries = entries.concat(r)  
    });
    callback(entries);
  })
  
}