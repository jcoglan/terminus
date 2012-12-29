var page   = new WebPage(),
    host   = phantom.args[0],
    port   = phantom.args[1],
    socket = phantom.args[2];

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

page.open('http://' + host + ':' + port + '/');


