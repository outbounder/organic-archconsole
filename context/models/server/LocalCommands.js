var glob = require("glob")
var path = require("path")

module.exports = function(){
  this.commands_cache = {}
}

module.exports.prototype.load = function(c, next) {
  var self = this;
  glob(path.join(c.root, "*.js"), function(err, files){
    if(err) return next && next(err)
    files.forEach(function(file){
      var name = path.basename(file, ".js")
      self.commands_cache[name] = require(file)
    })
  })
}

module.exports.prototype.findByName = function(name){
  return this.commands_cache[name]
}

module.exports.prototype.executeByName = function(name, c) {
  this.commands_cache[name](c)
}