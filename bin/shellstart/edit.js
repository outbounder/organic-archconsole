module.exports = function(c, next) {
  var shell = c.command.shell
  c.output("<p>press 'alt+shift+e' to run atom editor at current directory</p>")
  c.output("<p>press 'ctrl+alt+shift+e' to run atom editor appending current directory</p>")

  c.bindKey("ctrl+alt+shift+e", "edit")
  c.terminate()
}
