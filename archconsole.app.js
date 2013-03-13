var WebCell = require("organic-webcell/WebCell");
var instance = new WebCell(null, function(){
  var appjs = require("appjs");

  var window = appjs.createWindow('http://localhost:3333/',
   {
    width : 800,
    height: 600
  });

  // show the window after initialization
  window.on('create', function(){
    window.frame.show();
    window.frame.center();
  });

  // add require/process/module to the window global object for debugging from the DevTools
  window.on('ready', function(){
    window.require = require;
    window.process = process;
    window.module = module;
    window.addEventListener('keydown', function(e){
      if (e.keyIdentifier === 'F12') {
        window.frame.openDevTools();
      }
    });
  });  
});
