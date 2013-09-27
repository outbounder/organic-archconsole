var path = require("path");
var fs = require("fs");

var runtime = require("models/server/runtime");

var CommandResult = require("models/server/CommandResult");
var Command = require("models/server/Command");
var Format = require("models/server/OutputFormat");
var LocalCommands = require("models/server/LocalCommands");

var id = 0;
var uuid = function () {
  return String(id++);
}

function getUserHome() {
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
}

var splitByCommand = function(execCmd){
  return function(c, parent) {
    async.seriesEach(c.data.value.split("&&"), function(cmd, next){
      c.data.value = cmd
      execCmd(c, next)
    }, parent)
  }
}

var terminateCommand = function(c, next){
  var command = runtime.commands.findByUUID(data.uuid);
  if(!command) return;
  command.terminate();
  runtime.commands.removeByUUID(command.uuid);
  next && next()
}

var executeArchConsoleCommand = function(c, next) {
  if(localCommands.findByName(command.value))
    return localCommands.executeByName(command.value, commandContext(socket, command), next)
  next && next()
}

var executeCommand = function(c, next) {
  var shell = runtime.shells.findByUUID(c.shelluuid);
  if(!shell || !c.value || c.value.length == 0) {
    next && next(new Error("could start"));
    return;
  }

  var command = new Command(c.data);
  command.shell = shell;
  command.uuid = c.uuid || uuid();
  command.cwd = command.cwd || shell.cwd;

  c.command = command
  shell.runningCommand = command;
  runtime.commands.push(command);

  if(command.start())
    c.socket.emit(command.shelluuid+"/commandstart", command.toJSON())
  next && next()
}

var pipeOutputToClients = function(c, next){
  var emit = function(data) {
    if(data.toString().indexOf("<iframe") !== -1)
      c.socket.emit(command.shelluuid+"/"+command.uuid+"/output", data.toString());
    else
      c.socket.emit(command.shelluuid+"/"+command.uuid+"/output", format.escapeUnixText(data));
  }
  command.stdout.on("data", emit);
  command.stderr.on("data", emit);
  next && next()
}

var pipeTerminatedToClients = function(c, next){
  command.childProcess.on("close", function(code, signal){
    c.command.code = code
    c.command.signal = signal
    c.socket.emit(c.command.shelluuid+"/"+c.command.uuid+"/terminated", {
      uuid: c.command.uuid,
      code: c.command.code
    });
  });
  next && next()
}

module.exports.init = function(plasma, dna){
  var format = new Format();
  var localCommands = new LocalCommands()
  localCommands.load({ root: path.join(process.cwd(), "bin") })

  return switchByEventname({
    "/execute": splitByCommand( chain(
        prepareAsCommand,
        switchByCommandType(
          executeArchConsoleCommand, 
          executeCommand
        ),
        pipeOutputToClients,
        pipeTerminatedToClients
      )
    ),
    "/terminate": terminateCommand
  })
}