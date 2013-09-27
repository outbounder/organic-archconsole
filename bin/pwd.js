socket.emit(command.shelluuid+"/"+command.uuid+"/output", shell.cwd);
socket.emit(command.shelluuid+"/"+command.uuid+"/terminated", {uuid:
command.uuid, code: 0}); 