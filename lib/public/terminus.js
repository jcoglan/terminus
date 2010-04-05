Terminus = {
  connect: function(endpoint) {
    if (this._client) return;
    
    this._client = new Faye.Client(endpoint);
    this._client.subscribe('/terminus/commands', function(message) {
      this.execute(message.command);
    }, this);
  },
  
  execute: function(command) {
    eval(command);
  }
};

