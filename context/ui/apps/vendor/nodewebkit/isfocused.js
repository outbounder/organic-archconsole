(function() {
  if(!window.frame) return console.warn("window.frame is not found")
  window.frame.isFocused = true;
 
  var windowFocusHandler = function() {
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