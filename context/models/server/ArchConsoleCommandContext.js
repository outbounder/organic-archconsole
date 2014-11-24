var _ = require("underscore")

var counter = 0
var generator = {
  v1: function(){
    return counter++;
  }
}

module.exports = function(c, commandReaction){
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
      return this
    },
    terminate: function(code){
      socket.emit("/commands/terminated", {uuid: command.uuid, code: code || 0});
      return this
    },
    execute: function(cmdValue, handler) {
      var extendedC = _.extend({}, c, {
        data: {
          value: cmdValue,
          shelluuid: command.shelluuid
        }
      })
      commandReaction.execute(extendedC, handler)
      return this
    },
    bindKey: function(keySequence, cmd, handler) {
      var uuid = generator.v1()
      var handlerTrigger = function(triggerCtx){
        if(typeof cmd == "string") {
          var extendedC = _.extend({}, c, {
            data: {
              value: cmd,
              shelluuid: command.shelluuid
            }
          }, triggerCtx)
          commandReaction.execute(extendedC, handler)
        } else
        if(typeof cmd == "function") {
          cmd(_.extend({}, c, triggerCtx))
        }
      }
      socket.on("/commands/trigger/"+uuid, handlerTrigger)
      trigger_cache[uuid] = handlerTrigger
      socket.emit("/commands/bindkey", {
        uuid: command.uuid,
        keySequence: keySequence,
        cmd_id: uuid
      });
      return this
    },
    bindKeyOnce: function(keySequence, cmd, handler) {
      var uuid = generator.v1()
      var handlerTrigger = function(triggerCtx){
        if(typeof cmd == "string") {
          var extendedC = _.extend({}, c, {
            data: {
              value: cmd,
              shelluuid: command.shelluuid
            }
          }, triggerCtx)
          commandReaction.execute(extendedC, handler)
        } else
        if(typeof cmd == "function") {
          cmd(_.extend({},c,triggerCtx))
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
      return this
    }
  }, c)
}
