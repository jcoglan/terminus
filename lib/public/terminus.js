Terminus = {
  isIE: /\bMSIE\b/.test(navigator.userAgent),
  
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
    _node: function(id) {
      return Terminus.Registry.get(id);
    },
    
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
    
    body: function() {
      var html = document.getElementsByTagName('html')[0];
      return html.outerText ||
             '<html>\n' + html.textContent + '\n</html>\n';
    },
    
    evaluate: function(expression) {
      return eval(expression);
    },
    
    cleanup: function() {
      var cookies = document.cookie.split(';'), name;
      
      var expiry = new Date();
      expiry.setTime(expiry.getTime() - 24*60*60*1000);
      
      for (var i = 0, n = cookies.length; i < n; i++) {
        name = cookies[i].split('=')[0];
        document.cookie = name + '=; expires=' + expiry.toGMTString() + '; path=/';
      }
    },
    
    click: function(nodeId) {
      var element = this._node(nodeId);
      Syn.click({}, element);
    },
    
    set: function(nodeId, value) {
      var field = this._node(nodeId);
      switch (typeof value) {
        case 'string':  field.value = value;    break;
        case 'boolean': field.checked = value;  break;
      }
    },
    
    select: function(nodeId, value) {
      var select  = this._node(nodeId),
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
      var select  = this._node(nodeId),
          options = select.children,
          option;
      
      for (var i = 0, n = options.length; i < n; i++) {
        option = options[i];
        if (option.value === value || option.text === value)
          option.selected = false;
      }
    },
    
    drag: function(options) {
      var draggable = this._node(options.from),
          droppable = this._node(options.to);
      Syn.drag({to: droppable}, draggable);
    },
    
    attribute: function(nodeId, name) {
      var node = this._node(nodeId);
      if (Terminus.isIE) return node.getAttributeNode(name).nodeValue;
      else return node.getAttribute(name);
    },
    
    tag_name: function(nodeId) {
      return this._node(nodeId).tagName;
    },
    
    text: function(nodeId) {
      var node = this._node(nodeId);
      return node.textContent || node.innerText;
    },
    
    value: function(nodeId) {
      return this._node(nodeId).value;
    },
    
    is_visible: function(nodeId) {
      var node = this._node(nodeId);
      
      while (node.tagName.toLowerCase() !== 'body') {
        if (node.style.display === 'none' || node.type === 'hidden') return false;
        node = node.parentNode;
      }
      return true;
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

