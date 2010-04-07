Terminus = {
  connect: function(endpoint) {
    if (this._client) return;
    
    this._id = Faye.random();
    var client = this._client = new Faye.Client(endpoint);
    
    this._client.subscribe('/terminus/commands', function(message) {
      this.execute(message.command);
    }, this);
    
    this._client.subscribe('/terminus/clients/' + this._id, function(message) {
      var command = message.command,
          method  = command.shift();
      
      var result = Terminus.DSL[method].apply(Terminus.DSL, command);
      this.postResult(message.commandId, result);
    }, this);
    
    this.ping();
  },
  
  browserDetails: function() {
    return {
      id:   this._id,
      ua:   navigator.userAgent,
      url:  window.location.href
    };
  },
  
  ping: function() {
    this._client.publish('/terminus/ping', this.browserDetails());
    var self = this;
    setTimeout(function() { self.ping() }, 5000);
  },
  
  postResult: function(commandId, result) {
    if (!commandId) return;
    
    this._client.publish('/terminus/results', {
      id:         this._id,
      commandId:  commandId,
      result:     result
    });
  },
  
  execute: function(command) {
    eval(command);
  },
  
  DSL: {
    visit: function(url) {
      window.location.href = url;
    },
    
    find: function(xpath) {
      var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
      return result.iterateNext() ? true : false;
    }
  }
};

