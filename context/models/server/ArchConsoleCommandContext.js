var _ = require("underscore")

module.exports = function(c){
  var commands = require("../../ws/reactions/commands")
  var socket = c.socket
  var command = c.command
  
  return _.extend({
    output: function(value){
      socket.emit("/commands/output",{uuid: command.uuid, value: value});    
    },
    terminate: function(){
      socket.emit("/commands/terminated", {uuid: command.uuid, code: 0});     
    },
    bindKeyOnce: function(keySequence, cmd, handler) {
      socket.on("/commands/trigger", function(c){
        if(c.data != keySequence) return
        if(typeof cmd == "string") {
          c.command.value = cmd
          commands.execute(c, handler)
        }
        if(typeof cmd == "function") {
          cmd(c, handler)
        }
      })
      socket.emit("/commands/bindkeyonce", {keySequence: keySequence});
    }
  }, c)
}