// thanks to Termkit

module.exports = function(){

}

/**
 * Escape binary data for display as HTML.
 */
module.exports.prototype.escapeBinary = function (data) {
  if (typeof data != 'string') {
    data = data.toString('utf-8');
  }
  var binary = data, n = binary.length, i = 0;

  // Escape non-printables
  binary = binary.replace(/([\u0000-\u001F\u0080-\u009F])/g, function (x, char) {
    if (char.match(/[^\r\n\t]/)) {
      var num = char.charCodeAt(0).toString(16);
      while (num.length < 4) num = '0' + num;
      return '\\u' + num;
    }
    return char;
  });

  return binary;
}

/**
 * Escape textual Unix data for display as HTML.
 */
module.exports.prototype.escapeUnixText = function (data) {
  if (typeof data != 'string') {
    data = data.toString('utf-8');
  }
  var binary = data, n = binary.length, i = 0;

  // Escape HTML characters.
  binary = binary.replace(/[<&]/g, function (x) {
    return { '<': '&lt;', '&': '&amp;' }[x];
  });

  // ANSI state.
  var bold = false,
      italic = false,
      underline = false,
      blink = false,
      strike = false,
      invert = false,
      fg = 0,
      bg = 0;

  // Handle ANSI escapes.
  binary = binary.replace(/\u001b\[([0-9]+(?:;[0-9]+)*)?([A-Za-z])/g, function (x, codes, command) {
    // Remove non-color codes.
    if (command != 'm') return '';
    
    codes = codes.split(';');
    
    // Replace each code with a closing and opening span.
    function span() {
      var out = '</span>';
      var styles = [];
      
      if (bold) styles.push('font-weight: bold');
      if (italic) styles.push('font-variant: italic');
      
      var deco = [];
      if (blink) deco.push('blink');
      if (underline) deco.push('underline');
      if (strike) styles.push('line-through');
      if (deco.length) styles.push('text-decoration: ' + deco.join(' '));
      
      var color = invert ? bg : fg + (bold ? 'b' : ''),
          background = invert ? fg : bg;
      
      var klass = [ 'termkitAnsiFg' + color, 'termkitAnsiBg' + background ];
      
      out += '<span class="'+ klass.join(' ') +'" style="' + styles.join(';') + '">';

      return out;
    }
    
    // Supported codes.
    for (i in codes) {
//      process.stderr.write('code ' +  + "\n");
      switch (parseInt(codes[i], 10)) {
        case 0:
          bold = italic = underline = blink = strike = bright = invert = false;
          fg = bg = 0;
          break;
        
        case 1:
          bold = true;
          break;
        
        case 3:
          italic = true;
          break;
          
        case 4:
          underline = true;
          break;
        
        case 5:
          blink = true;
          break;
        
        case 7:
          invert = true;
          break;
        
        case 9:
          strike = true;
          break;
        
        case 21:
          bold = false;
          break;
        
        case 23:
          italic = false;
          break;
        
        case 24:
          underline = false;
          break;
        
        case 25:
          blink = false;
          break;
        
        case 27:
          invert = false;
          break;
        
        case 29:
          strike = false;
          break;
        
        case 30:
        case 31:
        case 32:
        case 33:
        case 34:
        case 35:
        case 36:
        case 37:
          fg = codes[i] - 30;
          break;

        case 40:
        case 41:
        case 42:
        case 43:
        case 44:
        case 45:
        case 46:
        case 47:
          bg = codes[i] - 40;
          break;

      }

      return span();
    }
  });
  binary = '<span>'+ binary +'</span>';

  // Handle antique bold/italic escapes used by grotty -c.
  binary = binary
    .replace(/_\u0008(.)\u0008\1/g, function (x, char) {
      return '<b><i>' + char + '</i></b>';
    })
    .replace(/(.)\u0008\1/g, function (x, char) {
      return '<b>' + char + '</b>';
    })
    .replace(/_\u0008(.)/g, function (x, char) {
      return '<i>' + char + '</i>';
    });

  return this.escapeBinary(binary);
}