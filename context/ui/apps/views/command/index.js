module.exports = Backbone.View.extend({
  template: require("./index.jade"),

  initialize: function(){
    this.model.on("start", this.start, this)
    this.model.on("output", this.output, this)
    this.model.on("terminated", this.terminated, this)
  },
  start: function(data){
    var self = this
    if(!data.uuid) return self.terminated(data);
    self.model.set(data);
    this.$el.find(".input").html(self.model.get("value"))
  },
  output : function(chunk){
    this.$el.find(".result").append(chunk);
  },
  terminated: function(code){
    this.model.set("running", false);
    if(this.fullScreenMode) { // still from the experiment
      this.$el.find("iframe").remove(); 
      this.$el.html(this.commandOutput({
        input: this.model.get("value"),
        output: this.outputBuffer
      }));
    }

    if(code == 0)
      this.$(".status").addClass("alert-success");
    else
      this.$(".status").addClass("alert-error");
    
    this.unbind();
  },
  render: function(){
    this.$el.html(this.template())
    return this
  }
})