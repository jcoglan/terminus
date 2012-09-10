require 'rubygems'
require 'bundler/setup'

root = File.expand_path('../..', __FILE__)

require root + '/vendor/capybara/spec/spec_helper'
require root + '/lib/terminus'

def select_browser
  Terminus.browser = case ENV['USER_AGENT']
                     when 'iPhone' then {:os => /iPhone/}
                     when 'iPad'   then {:os => /like Mac OS X/}
                     when String   then {:name => ENV['USER_AGENT']}
                     else               :docked
                     end
end

# We use WEBrick to boot the test app, because if we use Thin (the default) the
# slow response used to test Ajax resynchronization blocks the event loop. This
# stops Terminus receiving messages and causes false positives: the client is
# not really waiting for Ajax to complete, it's just having its messages blocked
# because EventMachine is frozen.

Capybara.server do |app, port|
  handler = Rack::Handler.get('webrick')
  handler.run(app, :Port => port, :AccessLog => [], :Logger => WEBrick::Log::new(nil, 0))
end
