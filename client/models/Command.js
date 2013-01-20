module.exports = Backbone.Model.extend({
  initialize: function(){
    this.previousCommand = null;
    this.nextCommand = null;
  }
});