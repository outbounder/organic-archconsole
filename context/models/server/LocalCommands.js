var glob = require("glob")
var path = require("path")
var platform = require("./Platform")

module.exports = function(){
  this.commands_cache = {}
}

module.exports.prototype.load = function(c, next) {
  var self = this;
  glob(path.join(c.root, "**", "*.js"), function(err, files){
    if(err) return next && next(err)
    files.forEach(function(file){
	    if(platform.os.match("win"))
		    file = file.replace(/\//g, "\\")
      var name = file.replace(".js", "").replace(c.root+path.sep, "")
      console.log("found command ", name)
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
