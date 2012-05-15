var page = new WebPage()
page.onConsoleMessage = function(m) { console.log(m) }
page.open('http://localhost:7004/')
