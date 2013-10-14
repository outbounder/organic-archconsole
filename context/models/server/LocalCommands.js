var glob = require("glob")
var path = require("path")
var platform = require("platform")

module.exports = function(){
  this.commands_cache = {}
}

module.exports.prototype.load = function(c, next) {
  var self = this;
  glob(path.join(c.root, "**", "*.js"), function(err, files){
    if(err) return next && next(err)
    files.forEach(function(file){
	    if(platform.os.family.toLowerCase().indexOf("win") !== -1 && platform.os.family.toLowerCase() != "darwin")
		    file = file.replace(/\//g, "\\")
      var name = file.replace(".js", "").replace(c.root+path.sep, "")
      console.log(name)
      self.commands_cache[name] = require(file)
    })
  })
}

module.exports.prototype.findByName = function(name){
  return this.commands_cache[name]
}

module.exports.prototype.executeByName = function(name, c, next) {
  this.commands_cache[name](c, next)
}
