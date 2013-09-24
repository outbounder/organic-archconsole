module.exports = function(){
  this.buffer = [];
}

module.exports.prototype.append = function(chunk){
  this.buffer.push(chunk);
}

module.exports.prototype.outputData = function(){
  var data = this.buffer[0];
  if(!data)
    return null;

  var utf8 = false;
  var binary = false;

  var attempt = data.toString('utf-8').replace(/�$/, ''), error = attempt.indexOf('�');
  if (error != -1) {
    utf8 = false;
  }

  // Detect binary data.
  if (/[\u0000]/.test(attempt)) {
    binary = true;
  }

  if(binary) {
    var data = "";
    for(var i = 0; i<this.buffer.length; i++)
      data += new Buffer(this.buffer[i], 'binary').toString('base64');
    return  '<img src="data:image/png;base64,'+data+'" />';
  }else {
    var data = "";
    for(var i = 0; i<this.buffer.length; i++)
      data += new Buffer(this.buffer[i], 'binary').toString('utf8');
    return this.buffer.join("\n");
  }
}