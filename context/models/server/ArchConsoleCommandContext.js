module.exports = function(socket, command){
  var eventListeners = []
  var registerEventListener = function(eventName, handler) {
    eventListeners.push({eventName: eventName, handler: handler})
    socket.on(eventName, handler)
  }
  var removeAllListeners = function(){
    eventListeners.forEach(function(listener){
      socket.removeListener(listener.eventName, listener.handler)
    })
    eventListeners = []
  }
  return {
    command: command,
    socket: socket,
    output: function(value){
      socket.emit(command.shelluuid+"/"+command.uuid+"/output", value);    
    },
    terminate: function(){
      socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", {uuid: command.uuid, code: 0});     
    },
    bindKeyOnce: function(keySequence, cmd, handler) {
      var eventName = command.shelluuid+"/"+command.uuid+"/trigger/"+keySequence
      registerEventListener(eventName, function(){
        removeAllListeners()
        if(typeof cmd == "string") {
          executeCommand(new Command({value: cmd, cwd: command.cwd, shelluuid: command.shelluuid}))
        }
        if(typeof cmd == "function") {
          cmd()
        }
      })
      socket.emit(command.shelluuid+"/"+command.uuid+"/bindkeyonce", {keySequence: keySequence});     
    }
  }
}