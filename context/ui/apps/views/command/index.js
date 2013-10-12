var Terminal = require("term.js/src/term")

module.exports = Backbone.View.extend({
  template: require("./index.jade"),

  events: {
    "click .btnRemove": "terminateCommand",
    "click .btnRestart": "restartCommand",
    "click .output": "focusResult",
  },

  initialize: function(){
    this.model.on("start", this.start, this)
    this.model.on("output", this.output, this)
    this.model.on("terminated", this.terminated, this)
    this.model.on("bindkeyonce", this.bindkeyonce, this)
    this.model.on("bindkey", this.bindkey, this)
  },
  focusResult: function(){
    if(this.model.get("isPTY"))
      this.terminal.focus()
    else
      this.$el.find(".result").focus()
  },
  bindkey: function(keySequence, cmd_id) {
    var handler = function(){
      archconsole.emit("/commands/trigger/"+cmd_id)
    }
    var keyCombo = KeyboardJS.on(keySequence, handler)
  },
  bindkeyonce: function(keySequence, cmd_id) {
    var handler = function(){
      archconsole.emit("/commands/trigger/"+cmd_id)
      keyCombo.clear()
    }
    var keyCombo = KeyboardJS.on(keySequence, handler)
  },
  restartCommand: function(){
    archconsole.emit("/commands", {name: "/restart", uuid: this.model.get("uuid")})
  },
  start: function(data){
    var self = this
    if(!data.uuid) return self.terminated(data);
    self.model.set(data);
    self.model.set("running", true)
    this.$el.find(".input").html(self.model.get("value"))
    this.$el.find(".sticky").waypoint('sticky')


    if(this.model.get("isPTY")) {
      var $terminal = this.$el.find(".terminal").show()
      this.terminal = new Terminal({
        useStyle: false
      })
      this.terminal.open($terminal[0])
      this.terminal.element.style.backgroundColor = this.terminal.colors[257];
      this.terminal.element.style.color = this.terminal.colors[256];
      this.terminal.on("data", function(data){
        archconsole.emit("/commands/"+self.model.get("uuid")+"/input", data)
      })
    } else {
      this.$el.find(".result").keypress(function(e) {
        var data = String.fromCharCode(e.charCode)
        archconsole.emit("/commands/"+self.model.get("uuid")+"/input", data)
      })
    }
  },
  output : function(chunk){
    if(!this.model.get("isPTY")) {
      this.$el.find(".result").show()
      this.$el.find(".result").append(chunk);
    } else
      this.terminal.write(chunk)
  },
  terminateCommand: function(){
    archconsole.emit("/commands", {name: "/terminate", uuid: this.model.get("uuid")})
  },
  terminated: function(code){
    this.model.set("running", false);
    this.$el.find(".sticky").waypoint('unsticky')

    if(code == 0)
      this.$el.find(".status").addClass("alert-success").removeClass("alert-info");
    else
      this.$el.find(".status").addClass("alert-error").removeClass("alert-info");

    this.$el.find(".status").empty()
    this.$el.find(".btnRemove").hide()
    this.$el.find(".btnRestart").hide()
    if(this.terminateCombo)
      this.terminateCombo.clear()
    if(this.restartCombo)
      this.restartCombo.clear()

    this.unbind();
  },
  render: function(){
    this.$el.html(this.template({
      model: this.model
    }))
    return this
  },
  updateStickyOffset: function(index) {
    var self = this

    this.$el.find(".sticky").css({
      top: (index*30)+"px"
    })

    this.$el.find(".status").html(index+1)

    if(this.terminateCombo)
      this.terminateCombo.clear()
    this.terminateCombo = KeyboardJS.on("alt+shift+"+(index+1), function(){
      self.terminateCommand()
    })

    if(this.restartCombo)
      this.restartCombo.clear()
    this.restartCombo = KeyboardJS.on("ctrl+shift+"+(index+1), function(){
      self.restartCommand()
    })
  }
})
