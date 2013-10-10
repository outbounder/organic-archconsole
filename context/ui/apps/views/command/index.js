module.exports = Backbone.View.extend({
  template: require("./index.jade"),

  events: {
    "click .btnRemove": "terminateCommand"
  },

  initialize: function(){
    this.model.on("start", this.start, this)
    this.model.on("output", this.output, this)
    this.model.on("terminated", this.terminated, this)
    this.model.on("bindkeyonce", this.bindkeyonce, this)
    this.model.on("bindkey", this.bindkey, this)
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
  start: function(data){
    var self = this
    if(!data.uuid) return self.terminated(data);
    self.model.set(data);
    self.model.set("running", true)
    this.$el.find(".input").html(self.model.get("value"))
    this.$el.find(".sticky").waypoint('sticky')
  },
  output : function(chunk){
    this.$el.find(".result").show()
    this.$el.find(".result").append(chunk);
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

    this.$el.find(".btnRemove").hide()
    this.$el.find(".btnFocusOutput").hide()
    this.unbind();
  },
  render: function(){
    this.$el.html(this.template({
      model: this.model
    }))
    return this
  },
  updateStickyOffset: function(index) {
    this.$el.find(".sticky").css({
      top: (index*30)+"px"
    })
  }
})
