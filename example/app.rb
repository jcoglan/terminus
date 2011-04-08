require 'rubygems'
require 'sinatra'

module Example
  class << self
    attr_accessor :driver
  end
  
  class App < Sinatra::Base
    set :views, File.dirname(__FILE__) + '/views'
    
    get '/' do
      erb(:index)
    end
  end
end

require File.dirname(__FILE__) + '/../lib/terminus'

def t(&block)
  Thread.new(&block)
end

t do
  Example.driver = Capybara::Driver::Terminus.new(Example::App)
  Terminus.ensure_docked_browser
  Terminus.browser = :docked
end
