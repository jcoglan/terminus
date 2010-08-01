root = File.dirname(__FILE__) + '/../'

require root + 'vendor/capybara/spec/spec_helper'
require root + 'lib/terminus'

class TestApp
  template :layout do
    <<-HTML
      <html>
        <head>
          <meta http-equiv="Content-type" content="text/html; charset=utf-8">
          <title>Capybara Driver Test</title>
        </head>
        <body>
          <%= yield %>
          <%= Terminus.driver_script request.host %>
        </body>
      </html>
    HTML
  end
end

