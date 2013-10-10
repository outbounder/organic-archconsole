var switchByEventname = require("organic-alchemy").ws.switchByEventname
var runtime = require("models/server/runtime");
var _ = require("underscore")

module.exports.init = function(plasma, dna){
  return switchByEventname({
    "/execute": require("./command").execute,
    "/terminate": function(c, next){
      var command = runtime.commands.findByUUID(c.data.uuid);
      if(!command) return;
      command.terminate();
      runtime.commands.removeByUUID(command.uuid);
      next && next()
    },
    "/restart": function(c, next){
      var command = runtime.commands.findByUUID(c.data.uuid);
      if(!command) return;
      command.terminate();
      runtime.commands.removeByUUID(command.uuid);
      require("./command").execute({
        data: {
          shelluuid: command.shelluuid,
          value: command.value,
          cwd: command.cwd
        },
        socket: c.socket
      })
      next && next()
    }
  })
}
