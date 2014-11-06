(function() {
  window.frame = nwrequire("nw.gui").Window.get();
  window.frame.isFocused = true;
 
  var windowFocusHandler = function() {
      console.log("FOCUS")
      window.frame.isFocused = true;
    }
    , windowBlurHandler = function() {
      setTimeout(function(){
        window.frame.isFocused = false;  
      }, 10)
    }
  ;
 
  window.frame.on("focus", windowFocusHandler);
  window.frame.on("blur", windowBlurHandler);
})();