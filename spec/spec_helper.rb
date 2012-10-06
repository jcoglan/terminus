require 'rubygems'
require 'bundler/setup'

root = File.expand_path('../..', __FILE__)

require root + '/vendor/capybara/spec/spec_helper'
require root + '/lib/terminus'

Terminus.debug = ENV.has_key?('DEBUG')

case ENV['USER_AGENT']
  when 'auto'      then Terminus.start_browser
  when 'PhantomJS' then Terminus.start_phantomjs
end

def select_browser
  Terminus.browser = case ENV['USER_AGENT']
                     when 'iPhone' then {:os => /iPhone/}
                     when 'iPad'   then {:os => /like Mac OS X/}
                     when 'auto'   then :docked
                     when String   then {:name => ENV['USER_AGENT']}
                     else               :docked
                     end
end

at_exit { Terminus.browser.return_to_dock }

