require 'rubygems'
require 'bundler/setup'

root = File.expand_path('../../..', __FILE__)
xpath_path = Dir.glob(File.expand_path('bundler/gems/xpath-*/lib', ENV['GEM_HOME']))

$LOAD_PATH.unshift(xpath_path.first)
$LOAD_PATH.unshift(root + '/vendor/capybara/2.1/lib')

require root + '/vendor/capybara/2.1/spec/spec_helper'
require root + '/lib/terminus'

Terminus.debug = ENV.has_key?('DEBUG')
Terminus.sockets = false if ENV.has_key?('NOSOCKET')

case ENV['USER_AGENT']
  when 'auto'      then Terminus.start_browser
  when 'PhantomJS' then Terminus.start_phantomjs
  when 'Firefox'   then Terminus.sockets = false
end

at_exit { Terminus.browser.return_to_dock }

