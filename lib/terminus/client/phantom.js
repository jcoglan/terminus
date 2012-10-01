var page = new WebPage(),
    host = phantom.args[0],
    port = phantom.args[1];

page.open('http://' + host + ':' + port + '/');

