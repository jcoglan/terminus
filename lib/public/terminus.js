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
          driver  = this.Driver,
          self    = this;
      
      command.push(function(result) {
        self.postResult(message.commandId, result);
      });
      
      driver[method].apply(driver, command);
      
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
    
    visit: function(url, callback) {
      window.location.href = url;
      callback();
    },
    
    find: function(xpath, nodeId, callback) {
      var root = this._node(nodeId) || document;
      
      var result = document.evaluate(xpath, root, null, XPathResult.ANY_TYPE, null),
          list   = [],
          element;
      
      while (element = result.iterateNext())
        list.push(Terminus.Registry.put(element));
      
      return callback(list);
    },
    
    body: function(callback) {
      var html = document.getElementsByTagName('html')[0];
      callback(html.outerHTML ||
               '<html>\n' + html.innerHTML + '\n</html>\n');
    },
    
    evaluate: function(expression, callback) {
      callback(eval(expression));
    },
    
    cleanup: function(callback) {
      var cookies = document.cookie.split(';'), name;
      
      var expiry = new Date();
      expiry.setTime(expiry.getTime() - 24*60*60*1000);
      
      for (var i = 0, n = cookies.length; i < n; i++) {
        name = cookies[i].split('=')[0];
        document.cookie = name + '=; expires=' + expiry.toGMTString() + '; path=/';
      }
      callback();
    },
    
    click: function(nodeId, callback) {
      var element = this._node(nodeId);
      Syn.click({}, element);
      callback();
    },
    
    set: function(nodeId, value, callback) {
      var field = this._node(nodeId);
      if (field.type === 'file') return callback('not_allowed');
      
      switch (typeof value) {
        case 'string':  field.value = value;    break;
        case 'boolean': field.checked = value;  break;
      }
      callback();
    },
    
    select: function(nodeId, value, callback) {
      var select  = this._node(nodeId),
          options = select.children,
          found   = false,
          option;
      
      for (var i = 0, n = options.length; i < n; i++) {
        option = options[i];
        if (option.value === value || option.text === value) {
          found = true;
          option.selected = true;
        }
        else if (!select.multiple)
          option.selected = false;
      }
      callback(found);
    },
    
    unselect: function(nodeId, value, callback) {
      var select  = this._node(nodeId),
          options = select.children,
          found   = false,
          option;
      
      if (!select.multiple) return callback('not_allowed');
      
      for (var i = 0, n = options.length; i < n; i++) {
        option = options[i];
        if (option.value === value || option.text === value) {
          found = true;
          option.selected = false;
        }
      }
      callback(found ? true : 'not_found');
    },
    
    value: function(nodeId, callback) {
      var node = this._node(nodeId);
      if (node.tagName.toLowerCase() !== 'select' || !node.multiple)
        return callback(node.value);
      
      var options = node.children,
          values  = [];
      
      for (var i = 0, n = options.length; i < n; i++) {
        if (options[i].selected) values.push(options[i].value);
      }
      callback(values);
    },
    
    drag: function(options, callback) {
      var draggable = this._node(options.from),
          droppable = this._node(options.to);
      Syn.drag({to: droppable}, draggable, callback);
    },
    
    attribute: function(nodeId, name, callback) {
      var node = this._node(nodeId);
      
      if (name === 'checked' || name === 'selected')
        return callback(node[name]);
      
      if (Terminus.isIE)
        return callback(node.getAttributeNode(name).nodeValue);
      
      else callback(node.getAttribute(name));
    },
    
    tag_name: function(nodeId, callback) {
      callback(this._node(nodeId).tagName.toLowerCase());
    },
    
    text: function(nodeId, callback) {
      var node = this._node(nodeId);
      callback(node.textContent || node.innerText || '');
    },
    
    is_visible: function(nodeId, callback) {
      var node = this._node(nodeId);
      
      while (node.tagName.toLowerCase() !== 'body') {
        if (node.style.display === 'none' || node.type === 'hidden')
          return callback(false);
        node = node.parentNode;
      }
      callback(true);
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

