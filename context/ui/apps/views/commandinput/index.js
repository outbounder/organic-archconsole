var CommandAutocompleteView = require("./autocomplete");

module.exports = Backbone.View.extend({
  template: require("./index.jade"),

  events: {
    "keydown :input": "keydown"
  },
  initialize: function(){
    this._keycomboListeners = []
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
        self.$("input").val(self.$("input").val()+entry.match);
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
  executeCommand: function(){
    var commandData = {
      cid: this.model.cid,
      shelluuid: this.model.get('shelluuid'),
      value: this.$("input").val(),
      name: "/execute"
    }
    archconsole.emit("/commands", commandData)
    this.$("input").val("")
  },
  keydown: function(e){
    var self = this;
    var notTypedSomething = (
      this.$("input").val().length == 0 || 
      (this.model && this.$("input").val() == this.model.get("value"))
    )

    if(e.keyCode == 38 && notTypedSomething) { // up
      e.preventDefault();
      if(this.model.previousCommand) {
        this.model = this.model.previousCommand;
        this.$("input").val(this.model.get("value"));
      } 
      return;
    }

    if(e.keyCode == 40 && notTypedSomething) { // down
      e.preventDefault();
      if(this.model.nextCommand) {
        this.model = this.model.nextCommand;
        this.$("input").val(this.model.get("value"));
      } 
      return;
    }

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

    if(e.keyCode == 13) {
      e.preventDefault();
      self.executeCommand();
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