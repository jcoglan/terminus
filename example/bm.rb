require 'benchmark'
require File.expand_path('../../lib/terminus', __FILE__)
Terminus.browser = {:name => 'Chrome'}

page = <<-HTML
<!doctype html>
<html>
  <head>
    <meta http-equiv="Content-Type" content="text/html">
  </head>
  <body>
    <h1>Hello</h1>
    
    <script type="text/javascript">
      function connect(port) {
        var url = 'ws://localhost:' + port + '/',
            ws  = new WebSocket(url);
        
        ws.onopen = function() {
          console.log('Connected to ' + url);
        };
        
        ws.onmessage = function(event) {
          var payload = JSON.parse(event.data);
          var result = eval(payload.expression);
          
          ws.send(JSON.stringify({result: result}));
        };
        
        return true;
      }
    </script>
  </body>
</html>
HTML

app = lambda do |env|
  [200, {'Content-Type' => 'text/html'}, [page]]
end

session = Capybara::Session.new(:terminus, app)

Benchmark.bm do |bm|
  bm.report { session.visit '/' }
  
  bm.report do
    20.times { session.evaluate_script('3 + 4') }
  end

  server = Terminus::Connector::Server.new
  session.evaluate_script("connect(#{server.port})")
  
  bm.report do
    20.times {
      message = Yajl::Encoder.encode('expression' => '3 + 4')
      Yajl::Parser.parse(server.send(message))['result']
    }
  end
end

Terminus.return_to_dock

