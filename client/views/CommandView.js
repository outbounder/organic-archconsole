module.exports = Backbone.View.extend({
  events: {
    "keydown :input": "keypress"
  },
  keypress: function(e){
    if(e.keyCode == 13) {

      var commandData = {
        shelluuid: this.model.get('shelluuid'),
        value: this.$("input").val()
      }

      this.$("input").attr("readonly", true);
      archconsole.emit("archconsole::ui::"+this.model.get("shelluuid")+"::command::execute", commandData);

      var self = this;

      var commandExecuteResult = "archconsole::ui::"+this.model.get("shelluuid")+"::command::execute::result";
      var handleCommandExecuteResult = function(data){
        archconsole.off(commandExecuteResult, handleCommandExecuteResult);
        self.model.set(data);
        self.$(".result").addClass(self.model.get("uuid"));
        var commandExecuteData = "archconsole::ui::"+self.model.get("shelluuid")+"::"+self.model.get("uuid")+"::execute::data";
        var handleCommandDataResult = function(data){
          archconsole.off(commandExecuteData, handleCommandDataResult);
          self.$("."+self.model.get("uuid")).html(data);
          self.trigger("finished");
          self.unbind();
        }
        archconsole.on(commandExecuteData, handleCommandDataResult);
      }
      archconsole.on(commandExecuteResult, handleCommandExecuteResult);
    }
  },
  render: function(){
    this.$el.html(require("../templates/command.jade")); 
    this.$("input").focus();
  }
});