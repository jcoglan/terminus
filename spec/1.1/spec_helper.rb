require 'rubygems'
require 'bundler/setup'

root = File.expand_path('../../..', __FILE__)
$LOAD_PATH.unshift(root + '/vendor/capybara/1.1/xpath/lib')
$LOAD_PATH.unshift(root + '/vendor/capybara/1.1/lib')

require root + '/vendor/capybara/1.1/spec/spec_helper'
require root + '/lib/terminus'

Terminus.debug = ENV.has_key?('DEBUG')
Terminus.sockets = false if ENV.has_key?('NOSOCKET')

case ENV['USER_AGENT']
  when 'auto'             then Terminus.start_browser
  when 'PhantomJS'        then Terminus.start_phantomjs
  when 'Firefox', 'Opera' then Terminus.sockets = false
end

def select_browser
  Terminus.browser = case ENV['USER_AGENT']
                     when 'iPhone' then {:os => /iPhone/}
                     when 'iPad'   then {:os => /like Mac OS X/}
                     when 'auto'   then Terminus.browser
                     when String   then {:name => ENV['USER_AGENT']}
                     else               :docked
                     end
end

at_exit { Terminus.browser.return_to_dock }

