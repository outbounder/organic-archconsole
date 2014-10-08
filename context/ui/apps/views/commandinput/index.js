var CommandAutocompleteView = require("./autocomplete");

module.exports = Backbone.View.extend({
  template: require("./index.jade"),

  events: {
    "keydown :input": "keydown",
    "focus :input": "emitFocus"
  },
  initialize: function(){
    this.input_history = []
    this.started = {}
  },
  emitFocus: function(){
    this.trigger("focus");
  },
  hasFocus: function(){
    return this.$el.find("input").is(":focus")
  },
  focus: function(){
    this.$el.find("input").focus()
  },
  blur: function(){
    this.$el.find("input").blur()
  },
  hasCommandStarted: function(){
    return !_.isEmpty(this.started)
  },
  indicateCommandChange: function(data){
    if(data.started)
      this.started[data.uuid] = true
    else
      delete this.started[data.uuid]
    if(this.hasCommandStarted())
      this.$el.find(".status").removeClass("alert-info").addClass("alert")
    else
      this.$el.find(".status").removeClass("alert").addClass("alert-info")
  },
  autocomplete: function(){
    var self = this;
    var inputData = {
      name: "/autocomplete",
      uuid: this.model.get("shelluuid"),
      value: this.$("input").val()
    };
    archconsole.emit("/shells", inputData, function(data){
      self.autocompleteView = new CommandAutocompleteView({model: data});
      self.autocompleteView.on("canceled", function(){
        self.autocompleteView.remove();
        self.autocompleteView = null;
      });
      self.autocompleteView.on("selected", function(entry, index){
        if(!entry.full)
          self.$("input").val(self.$("input").val()+entry.match);
        else
          self.$("input").val(entry.match);
        self.autocompleteView.remove();
        self.autocompleteView = null;
      });
      self.$(".autocompleteContainer").append(self.autocompleteView.render().el);
      self.autocompleteView.selectFirst();
      self.autocompleteView.$el.css("top", self.$el.position().top);
      self.autocompleteView.$el.css("left", self.$el.position().left+80+self.$("input").val().length*7);
      self.autocompleteView.baseTop = self.$el.position().top;
    });
  },
  executeCommand: function(options){
    if(this.$("input").val() == "exit") {
      if(!window.nwrequire) return alert("not executable")
      var gui = window.nwrequire('nw.gui');
      return gui.App.quit();
    }
    var commandData = {
      shelluuid: this.model.get('shelluuid'),
      value: this.$("input").val(),
      name: "/execute",
      isPTY: options.isPTY
    }
    archconsole.emit("/commands", commandData)
    this.input_history.push(this.$("input").val())
    this.input_history_cursor = this.input_history.length
    this.$("input").val("")
  },
  keydown: function(e){
    var self = this;
    if(e.keyCode == 229) return

    if(e.keyCode == 9) { // tab
      e.preventDefault();
      if(self.autocompleteView) {
        self.autocompleteView.selectCurrent();
        return;
      }
      self.autocomplete();
      return;
    }

    if(self.autocompleteView) {
      if(!self.autocompleteView.keydown(e)) {
        if(self.autocompleteView) {
          self.autocompleteView.remove();
          self.autocompleteView = null;
        }
        if(self.autocompleteTimeoutID)
          clearTimeout(self.autocompleteTimeoutID);
        self.autocompleteTimeoutID = setTimeout(function(){
          self.autocomplete();
        }, 50);
      }
      return;
    }

    if(e.keyCode == 38) { // up
      e.preventDefault();
      if(this.input_history.length > 0) {
        this.input_history_cursor -= 1
        this.$("input").val(this.input_history[this.input_history_cursor]);
      }
      return;
    }

    if(e.keyCode == 40) { // down
      e.preventDefault();
      if(this.input_history.length > this.input_history_cursor) {
        this.input_history_cursor += 1
        this.$("input").val(this.input_history[this.input_history_cursor]);
      }
      return;
    }

    if(e.keyCode == 13) {
      e.preventDefault();
      self.executeCommand({isPTY: e.shiftKey});
    }
  },
  render: function(){
    this.$el.html(this.template());
    return this;
  },
  postRender: function(){
    this.$el.find("input").focus();
  }
});
