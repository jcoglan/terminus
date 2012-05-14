USER_AGENTS = %w[PhantomJS Chrome Firefox Opera Safari]

def run_specs(ua)
  out = "spec/reports/#{ua.downcase}.txt"
  system "USER_AGENT=#{ua} bundle exec rspec -f nested spec/ > #{out}"
end

task :spec, :ua do |t, args|
  if args[:ua]
    run_specs(args[:ua])
  else
    USER_AGENTS.each do |ua|
      run_specs(ua)
    end
  end
end
