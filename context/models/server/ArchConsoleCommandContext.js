var _ = require("underscore")

var counter = 0
var generator = {
  v1: function(){
    return counter++;
  }
}

module.exports = function(c){
  var commandReaction = require("../../ws/reactions/command")
  var socket = c.socket
  var command = c.command
  var trigger_cache = {}

  command.on("terminate", function(){
    for(var uuid in trigger_cache)
      socket.removeListener("/commands/trigger/"+uuid, trigger_cache[uuid])
    socket.emit("/commands/terminated", {uuid: command.uuid, code: 1});
  })
  
  return _.extend({
    output: function(value){
      socket.emit("/commands/output",{uuid: command.uuid, value: value});    
    },
    terminate: function(){
      socket.emit("/commands/terminated", {uuid: command.uuid, code: 0});     
    },
    execute: function(cmdValue, handler) {
      var extendedC = _.extend({}, c, {
        data: {
          value: cmdValue,
          shelluuid: command.shelluuid
        }
      })
      commandReaction.execute(extendedC, handler)
    },
    bindKey: function(keySequence, cmd, handler) {
      var uuid = generator.v1()
      var handlerTrigger = function(){
        if(typeof cmd == "string") {
          var extendedC = _.extend({}, c, {
            data: {
              value: cmd,
              shelluuid: command.shelluuid
            }
          })
          commandReaction.execute(extendedC, handler)
        } else
        if(typeof cmd == "function") {
          cmd(c)
        }
      }
      socket.on("/commands/trigger/"+uuid, handlerTrigger)
      trigger_cache[uuid] = handlerTrigger
      socket.emit("/commands/bindkey", {
        uuid: command.uuid, 
        keySequence: keySequence, 
        cmd_id: uuid
      });
    },
    bindKeyOnce: function(keySequence, cmd, handler) {
      var uuid = generator.v1()
      var handlerTrigger = function(){
        if(typeof cmd == "string") {
          var extendedC = _.extend({}, c, {
            data: {
              value: cmd,
              shelluuid: command.shelluuid
            }
          })
          commandReaction.execute(extendedC, handler)
        } else
        if(typeof cmd == "function") {
          cmd(c)
        }
        socket.removeListener("/commands/trigger/"+uuid, handlerTrigger)
        delete trigger_cache[uuid]
      }
      socket.on("/commands/trigger/"+uuid, handlerTrigger)
      trigger_cache[uuid] = handlerTrigger
      socket.emit("/commands/bindkeyonce", {
        uuid: command.uuid, 
        keySequence: keySequence, 
        cmd_id: uuid
      });
    }
  }, c)
}