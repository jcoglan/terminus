require File.expand_path('../spec_helper', __FILE__)

RSpec.configure do |config|
  config.before do
    Terminus.browser = case ENV['USER_AGENT']
                       when 'iPhone' then {:os => /iPhone/}
                       when 'iPad'   then {:os => /like Mac OS X/}
                       when 'auto'   then Terminus.browser
                       when String   then {:name => ENV['USER_AGENT']}
                       else               :docked
                       end
  end
  
  config.after do
    Terminus.browser.return_to_dock unless ENV['USER_AGENT']
  end
end

session = Capybara::Session.new(:terminus, TestApp)

Capybara::SpecHelper.run_specs session, 'terminus', :skip => [
#  :drag,
#  :frames,
#  :js,
#  :response_headers,
  :screenshot,
#  :source,
#  :status_code,
#  :trigger,
  :windows
]

