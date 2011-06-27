require 'rubygems'
require 'bundler/setup'

root = File.dirname(__FILE__) + '/../'

require root + 'vendor/capybara/spec/spec_helper'
require root + 'lib/terminus'

def select_browser
  if ua = ENV['USER_AGENT']
    Terminus.browser = {:name => ua}
  else
    Terminus.browser = :docked
  end
end
