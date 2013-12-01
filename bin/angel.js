var Angel = require("organic-angel")
var OutputFormat = require("models/server/OutputFormat");
var format = new OutputFormat()
var util = require('util')

var uid = 0

var plotObject = function(obj) {
  var obj_as_str = JSON.stringify(obj, null, 2)
  return jadefy(__dirname+"/angel.jade")({
    obj: obj,
    uid: uid++,
    obj_as_str: obj_as_str
  })
}

var OutpuStream = function(c){
  require("stream").Writable.call(this)
  this.c = c
}
util.inherits(OutpuStream, require("stream").Writable)
OutpuStream.prototype._write = function(chunk, encoding, callback){
  this.c.output(chunk.toString())
  callback()
}

module.exports = function(c, next) {
  var oldCwd = process.cwd()
  process.chdir(c.command.shell.cwd)
  for(var key in require.cache)
    delete require.cache[key]
  
  var instance = new Angel()
  instance.output = new OutpuStream(c)

  instance.plasma.on("ready", function(e){
    if(e instanceof Error) {
      c.output(e.toString())
      c.terminate()
      return
    }
    instance.do(c.command.value.replace("angel ",""), function(err, result){
      if(err) { 
        c.output(err.toString()); 
        c.terminate()
        return
      }
      if(typeof result == "string")
        c.output(format.escapeUnixText(result))
      if(typeof result == "object")
        c.output(plotObject(result))
      process.chdir(oldCwd)
      c.terminate()
    })
  })
  
}