SYN = %w[synthetic mouse browsers key drag/drag] unless defined? SYN

Gem::Specification.new do |s|
  s.name              = "terminus"
  s.version           = "0.4.0"
  s.summary           = "Capybara driver for cross-browser and remote scripting"
  s.author            = "James Coglan"
  s.email             = "jcoglan@gmail.com"
  s.homepage          = "http://terminus.jcoglan.com"

  s.extra_rdoc_files  = %w[README.rdoc]
  s.rdoc_options      = %w[--main README.rdoc]

  s.files             = %w[README.rdoc] +
                        Dir.glob("{bin,lib,spec}/**/*") +
                        SYN.map { |f| "lib/terminus/public/syn/#{f}.js" }

  s.executables       = Dir.glob("bin/**").map { |f| File.basename(f) }
  s.require_paths     = ["lib"]

  s.add_dependency "capybara", ">= 0.4.0", "< 2.0.0"
  s.add_dependency "childprocess", ">= 0.3.0"
  s.add_dependency "cookiejar", ">= 0.3.0"
  s.add_dependency "faye", ">= 0.8.2"
  s.add_dependency "oyster", ">= 0.9.0"
  s.add_dependency "packr", ">= 3.1.0"
  s.add_dependency "rack", ">= 1.0.0"
  s.add_dependency "rack-proxy", ">= 0.3.0"
  s.add_dependency "sinatra", ">= 1.0.0"
  s.add_dependency "thin", ">= 1.2.0"
  s.add_dependency "useragent", ">= 0.3.0"

  s.add_development_dependency "rake"
  s.add_development_dependency "rspec"
end
