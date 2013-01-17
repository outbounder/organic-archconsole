module.exports = Backbone.Model.extend({
  defaults: {
    cwd: "no shell",
    time: ""
  },
  initialize: function(){
    var self = this;
    self.timeIntervalID = setInterval(function(){
      self.updateTime();
    }, 1000);  
  },
  updateTime : function(){
    this.set('time', "");
  }
});