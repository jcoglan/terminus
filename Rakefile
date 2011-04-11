task :spec, :ua do |t, args|
  ua  = args[:ua]
  out = "spec/failures/#{ua.downcase}.txt"
  exec "USER_AGENT=#{ua} rspec -f nested spec/ > #{out}"
end
