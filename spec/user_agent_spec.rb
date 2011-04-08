require "spec_helper"

describe Terminus::UserAgent do
  def parse(string)
    Terminus::UserAgent.parse(string)
  end
  
  describe :chrome do
    it :osx do
      ua = parse("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-US) AppleWebKit/534.16 (KHTML, like Gecko) Chrome/10.0.648.204 Safari/534.16")
      ua.should == {
        :os      => "Mac OS X",
        :vendor  => "Google",
        :name    => "Chrome",
        :version => "10.0.648.204"
      }
    end
  end
  
  describe :firefox do
    it :osx do
      ua = parse("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0) Gecko/20100101 Firefox/4.0")
      ua.should == {
        :os      => "Mac OS X",
        :vendor  => "Mozilla",
        :name    => "Firefox",
        :version => "4.0"
      }
    end
  end
  
  describe :safari do
    it :osx do
      ua = parse("Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_6; en-us) AppleWebKit/533.19.4 (KHTML, like Gecko) Version/5.0.3 Safari/533.19.4")
      ua.should == {
        :os      => "Mac OS X",
        :vendor  => "Apple",
        :name    => "Safari",
        :version => "5.0.3"
      }
    end
  end
end
