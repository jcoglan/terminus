Given /^Terminus is connected to a browser$/ do
  Terminus.ensure_docked_browser!
  Terminus.browser = :docked
end

