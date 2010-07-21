Terminus = {
  connect: function(endpoint) {
    if (this._client) return;
    
    this._id = window.name = /^[0-9a-z]+$/i.test(window.name)
                           ? window.name
                           : Faye.random();
    
    var client = this._client = new Faye.Client(endpoint);
    
    this._client.subscribe('/terminus/commands', function(message) {
      this.execute(message.command);
    }, this);
    
    this._client.subscribe('/terminus/clients/' + this._id, function(message) {
      var command = message.command,
          method  = command.shift(),
          driver  = this.Driver;
      
      var result = driver[method].apply(driver, command);
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
  
  Driver: {
    visit: function(url) {
      window.location.href = url;
    },
    
    find: function(xpath) {
      var result = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null),
          list   = [],
          element;
      
      while (element = result.iterateNext())
        list.push(Terminus.Registry.put(element));
      
      return list;
    },
    
    click: function(nodeId) {
      var element = Terminus.Registry.get(nodeId),
          href    = element.href,
          event   = document.createEvent('MouseEvents');
      
      event.initEvent('click', true, true, window,
                           0, 0, 0, 0, 0,
                           false, false, false, false,
                           0, null);
      
      if (element.dispatchEvent(event) && href)
        this.visit(href);
    },
    
    set: function(nodeId, value) {
      var field = Terminus.Registry.get(nodeId);
      switch (typeof value) {
        case 'string':  field.value = value;    break;
        case 'boolean': field.checked = value;  break;
      }
    },
    
    select: function(nodeId, value) {
      var select  = Terminus.Registry.get(nodeId),
          options = select.children,
          option;
      
      for (var i = 0, n = options.length; i < n; i++) {
        option = options[i];
        if (option.value === value || option.text === value)
          option.selected = true;
        else
          option.selected = false;
      }
    },
    
    unselect: function(nodeId, value) {
      var select  = Terminus.Registry.get(nodeId),
          options = select.children,
          option;
      
      for (var i = 0, n = options.length; i < n; i++) {
        option = options[i];
        if (option.value === value || option.text === value)
          option.selected = false;
      }
    }
  },
  
  Registry: {
    _namespace: new Faye.Namespace(),
    _elements: {},
    
    put: function(element) {
      var id = this._namespace.generate();
      this._elements[id] = element;
      return id;
    },
    
    get: function(id) {
      return this._elements[id];
    }
  }
};

