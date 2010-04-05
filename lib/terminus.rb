require 'rubygems'
require 'rack'
require 'thin'
require 'eventmachine'
require 'faye'
require 'sinatra'
require 'packr'

%w[application server].each do |file|
  require File.join(File.dirname(__FILE__), 'terminus', file)
end

Thin::Logging.silent = true

module Terminus
  VERSION    = '0.1.0'
  FAYE_MOUNT = '/messaging'
  
  def self.create(options = {})
    Server.new(options)
  end
end

