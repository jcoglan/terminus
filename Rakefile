USER_AGENTS = %w[PhantomJS Chrome Firefox Safari Opera]
require 'fileutils'

def run_specs(ua)
  out = "spec/reports/#{ua.downcase}.txt"
  system "USER_AGENT=#{ua} bundle exec rspec -f nested spec/ > #{out}"
end

task :spec, :ua do |t, args|
  if args[:ua]
    run_specs(args[:ua])
  else
    USER_AGENTS.each { |ua| run_specs(ua) }
  end
end

task :compile do
  files = %w[pathology syn/synthetic syn/mouse syn/browsers syn/drag/drag terminus]
  dir   = File.expand_path('../lib/terminus/public', __FILE__)
  code  = files.map { |f| File.read("#{dir}/#{f}.js") }.join("\n\n")
  
  code.gsub!(/\}\)\(\)$/, '})();')
  target = File.join(dir, 'compiled', 'terminus.js')
  FileUtils.mkdir_p(File.dirname(target))
  File.open(target, 'w') { |f| f.write(code) }
  
  min = target.gsub(/\.js$/, '-min.js')
  system "./node_modules/.bin/uglifyjs -o '#{min}' '#{target}'"
end

