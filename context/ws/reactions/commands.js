var switchByEventname = require("organic-alchemy").ws.switchByEventname
var runtime = require("models/server/runtime");

module.exports.init = function(plasma, dna){
  return switchByEventname({
    "/execute": require("./command").execute,
    "/terminate": function(c, next){
      var command = runtime.commands.findByUUID(c.data.uuid);
      if(!command) return;
      command.terminate();
      runtime.commands.removeByUUID(command.uuid);
      next && next(command)
    }
  })
}