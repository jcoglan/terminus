var page   = new WebPage(),
    width  = phantom.args[0],
    height = phantom.args[1],
    host   = phantom.args[2],
    port   = phantom.args[3],
    socket = phantom.args[4];

var Commands = {
  save_screenshot: function(path, options, callback) {
    page.render(path);
    callback(true);
  }
};

var ws = new WebSocket('ws://' + host + ':' + socket + '/');
ws.onmessage = function(message) {
  var args   = JSON.parse(message.data),
      method = args.shift();

  args.push(function(result) {
    ws.send(JSON.stringify([result]));
  });
  Commands[method].apply(Commands, args);
};

page.viewportSize = {width: parseInt(width, 10), height: parseInt(height, 10)};
page.open('http://' + host + ':' + port + '/');

