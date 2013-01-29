module.exports = Backbone.View.extend({
  template: jadeCompile(require("../templates/CommandAutocomplete.jade.raw")),
  autocompleteItem: jadeCompile(require("../templates/CommandAutocompleteItem.jade.raw")),
  selectFirst: function(){
    this.currentAutocompleteItemIndex = 0;
    this.$("li").removeClass("active");
    this.$("li[data-id="+this.currentAutocompleteItemIndex+"]").addClass("active");
  },
  selectCurrent: function(){
    this.trigger("selected", this.model[this.currentAutocompleteItemIndex], this.currentAutocompleteItemIndex);
  },
  keydown: function(e){
    if(e.keyCode == 27){
      this.trigger("canceled");
      return true;
    } else
    if(e.keyCode == 13) {
      e.preventDefault();
      this.trigger("selected", this.model[this.currentAutocompleteItemIndex], this.currentAutocompleteItemIndex);
      return true;
    } else
    if(e.keyCode == 38){ // up
      e.preventDefault();
      this.currentAutocompleteItemIndex -= 1;
      if(this.currentAutocompleteItemIndex < 0)
        this.currentAutocompleteItemIndex = this.model.length-1;
      this.$("li").removeClass("active");
      this.$("li[data-id="+this.currentAutocompleteItemIndex+"]").addClass("active");
      return true;
    } else
    if(e.keyCode == 40){ // down
      e.preventDefault();
      this.currentAutocompleteItemIndex += 1;
      if(this.currentAutocompleteItemIndex >= this.model.length)
        this.currentAutocompleteItemIndex = 0;
      this.$("li").removeClass("active");
      this.$("li[data-id="+this.currentAutocompleteItemIndex+"]").addClass("active");
      return true;
    }
  },
  render: function(){
    this.$el.html(this.template());
    for(var i = 0; i<this.model.length; i++)
      this.$(".autocomplete").append(this.autocompleteItem({value: this.model[i].value, id: i}));
    this.currentAutocompleteItemIndex = -1;
    return this;
  }
})