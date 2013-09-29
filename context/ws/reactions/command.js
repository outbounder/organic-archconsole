var path = require("path");
var fs = require("fs");
var switchByEventname = require("organic-alchemy").ws.switchByEventname
var chain = require("organic-alchemy").ws.chain
var async = require('async')

var createCommandContext = require("models/server/ArchConsoleCommandContext")
var Command = require("models/server/Command");
var OutputFormat = require("models/server/OutputFormat");
var format = new OutputFormat()

var LocalCommands = require("models/server/LocalCommands");
var localCommands = new LocalCommands()
localCommands.load({ root: path.join(process.cwd(), "bin") })

var runtime = require("models/server/runtime");

var id = 0;
var uuid = function () {
  return String(id++);
}

var splitByCommand = function(execCmd){
  return function(c, parent) {
    async.eachSeries(c.data.value.split("&&"), function(cmd, next){
      c.data.value = cmd
      execCmd(c, next)
    }, parent)
  }
}

var prepareAsCommand = function(c, next) {
  var shell = runtime.shells.findByUUID(c.data.shelluuid);
  if(!shell || !c.data.value)
    return next && next(new Error("can not start without shell or without value"))

  var command = new Command(c.data);
  command.shell = shell;
  command.uuid = uuid();
  command.cwd = shell.cwd;
  c.command = command
  shell.runningCommand = command;
  runtime.commands.push(command);

  next && next()
}


var executeCommand = function(c, next) {
  var shell = c.command.shell
  c.socket.emit("/shells/commandstart", {uuid: shell.uuid, value: c.command.toJSON()})
  if(localCommands.findByName(c.command.value))
    localCommands.executeByName(c.command.value, createCommandContext(c))
  else
    c.command.start()
  next && next()
}

var pipeOutputToClients = function(c, next){
  var command = c.command
  if(command.stdout && command.stderr) {
    var emit = function(data) {
      if(data.toString().indexOf("<iframe") !== -1)
        c.socket.emit("/commands/output", {uuid: c.command.uuid, value: data.toString()})
      else
        c.socket.emit("/comamnds/output", {uuid: c.command.uuid, value: format.escapeUnixText(data)})
    }
    command.stdout.on("data", emit);
    command.stderr.on("data", emit);
  }
  next && next()
}

var pipeTerminatedToClients = function(c, next){
  if(c.command.childProcess)
    c.command.childProcess.on("close", function(code, signal){
      c.command.code = code
      c.command.signal = signal
      c.socket.emit("/commands/terminated", { uuid: c.command.uuid, code: c.command.code })
    });
  next && next()
}

var execute = module.exports.execute = splitByCommand( 
  chain(
    prepareAsCommand,
    executeCommand,
    pipeOutputToClients,
    pipeTerminatedToClients
  )
)