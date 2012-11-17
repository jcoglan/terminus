require 'rubygems'
require 'bundler/setup'

root = File.expand_path('../..', __FILE__)

require root + '/vendor/capybara/spec/spec_helper'
require root + '/lib/terminus'

Terminus.debug = ENV.has_key?('DEBUG')
Terminus.sockets = false if ENV.has_key?('NOSOCKET')

case ENV['USER_AGENT']
  when 'auto'      then Terminus.start_browser
  when 'PhantomJS' then Terminus.start_phantomjs
end

at_exit { Terminus.browser.return_to_dock }

