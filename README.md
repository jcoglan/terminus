# Terminus

[Terminus](http://terminus.jcoglan.com) is an experimental
[Capybara](https://github.com/jnicklas/capybara) driver for real browsers. It
lets you control your application in any browser on any device (including
[PhantomJS](http://phantomjs.org/)), without needing browser plugins. This
allows several types of testing to be automated:
    
* Cross-browser testing
* Headless testing
* Multi-browser interaction e.g. messaging apps
* Testing on remote machines, phones, iPads etc

_Since it is experimental, this project is sporadically maintained. Usage is
entirely at your own risk._


## Installation

```
$ gem install terminus
```


## Running the example

Install the dependencies and boot the Terminus server, then open
http://localhost:70004/ in your browser.

```
$ bundle install
$ bundle exec bin/terminus
```

With your browser open, start an IRB session and begin controlling the app:

```
$ irb -r ./example/app
>> extend Capybara::DSL
>> visit '/'
>> click_link 'Sign up!'
>> fill_in 'Username', :with => 'jcoglan'
>> fill_in 'Password', :with => 'hello'
>> choose 'Web scale'
>> click_button 'Go!'
```


## License

(The MIT License)

Copyright (c) 2010-2013 James Coglan

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the 'Software'), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

