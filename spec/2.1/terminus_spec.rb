require File.expand_path('../spec_helper', __FILE__)

RSpec.configure do |config|
  config.before do
    Terminus.browser = case ENV['USER_AGENT']
                       when 'Android' then {:os => /Android/}
                       when 'iPhone'  then {:os => /iPhone/}
                       when 'iPad'    then {:os => /like Mac OS X/}
                       when 'auto'    then Terminus.browser
                       when String    then {:name => ENV['USER_AGENT']}
                       else                :docked
                       end
  end

  config.after do
    Terminus.browser.return_to_dock unless ENV['USER_AGENT']
  end
end

skip  = [:frames, :hover]
skip << :screenshot unless ENV['USER_AGENT'] == 'PhantomJS'
skip << :windows if %w[Android iPad iPhone PhantomJS].include?(ENV['USER_AGENT'])

session = Capybara::Session.new(:terminus, TestApp)
Capybara::SpecHelper.run_specs(session, 'terminus', :skip => skip)

