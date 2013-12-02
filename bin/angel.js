var Angel = require("organic-angel")
var OutputFormat = require("models/server/OutputFormat");
var format = new OutputFormat()
var util = require('util')

var uid = 0
var exec = require("child_process").exec

var plotObject = function(obj) {
  var obj_as_str = JSON.stringify(obj, null, 2)
  return jadefy(__dirname+"/angel.jade")({
    obj: obj,
    uid: uid++,
    obj_as_str: obj_as_str
  })
}

module.exports = function(c, next) {

  exec(c.command.value, function(err, stdout, stderr){
    if(err) {
      c.output(err.toString())
      c.output(stdout)
      c.output(stderr)
      c.terminate()
      return
    }

    var result;
    try {
      result = plotObject(JSON.parse(stdout))
      
    } catch(e){
      result = format.escapeUnixText(stdout)
    }

    c.output(result)
    c.terminate()
  })
}