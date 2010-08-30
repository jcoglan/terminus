Terminus = {
  isIE: /\bMSIE\b/.test(navigator.userAgent),
  
  connect: function(endpoint) {
    if (this._client) return;
    
    this._pageId = Faye.random();
    
    this._id = window.name = /^[0-9a-z]+$/i.test(window.name)
                           ? window.name
                           : Faye.random();
    
    this.Registry.initialize();
    this.Worker.initialize();
    
    var client = this._client = new Faye.Client(endpoint);
    
    this._client.subscribe('/terminus/commands', function(message) {
      this.execute(message.command);
    }, this);
    
    this._client.subscribe('/terminus/clients/' + this._id, function(message) {
      var command = message.command,
          method  = command.shift(),
          driver  = this.Driver,
          worker  = this.Worker,
          self    = this;
      
      command.push(function(result) {
        self.postResult(message.commandId, result);
      });
      
      worker.monitor = true;
      driver[method].apply(driver, command);
      worker.monitor = false;
    }, this);
    
    var self = this;
    setTimeout(function() { self.ping() }, 100);
  },
  
  browserDetails: function() {
    return {
      id:   this._id,
      page: this._pageId,
      ua:   navigator.userAgent,
      url:  window.location.href
    };
  },
  
  ping: function() {
    this._client.publish('/terminus/ping', this.browserDetails());
    var self = this;
    setTimeout(function() { self.ping() }, 3000);
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
    
    attribute: function(nodeId, name, callback) {
      var node = this._node(nodeId);
      
      if (Terminus.isIE)
        return callback(node.getAttributeNode(name).nodeValue);
      
      if (name === 'checked' || name === 'selected')
        return callback(node[name]);
      
      else callback(node.getAttribute(name));
    },
    
    body: function(callback) {
      var html = document.getElementsByTagName('html')[0];
      callback(html.outerHTML ||
               '<html>\n' + html.innerHTML + '\n</html>\n');
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
      Syn.trigger('click', {}, element);
      Terminus.Worker.callback(callback);
    },
    
    drag: function(options, callback) {
      var draggable = this._node(options.from),
          droppable = this._node(options.to);
      Syn.drag({to: droppable}, draggable, callback);
    },
    
    evaluate: function(expression, callback) {
      callback(eval(expression));
    },
    
    execute: function(expression, callback) {
      eval(expression);
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
    
    is_visible: function(nodeId, callback) {
      var node = this._node(nodeId);
      
      while (node.tagName.toLowerCase() !== 'body') {
        if (node.style.display === 'none' || node.type === 'hidden')
          return callback(false);
        node = node.parentNode;
      }
      callback(true);
    },
    
    select: function(nodeId, callback) {
      var option = this._node(nodeId);
      option.selected = true;
      Syn.trigger('change', {}, option.parentNode);
      callback(true);
    },
    
    set: function(nodeId, value, callback) {
      var field = this._node(nodeId);
      if (field.type === 'file') return callback('not_allowed');
      
      Syn.trigger('focus', {}, field);
      Syn.trigger('click', {}, field);
      
      switch (typeof value) {
        case 'string':  field.value = value;    break;
        case 'boolean': field.checked = value;  break;
      }
      callback();
    },
    
    tag_name: function(nodeId, callback) {
      callback(this._node(nodeId).tagName.toLowerCase());
    },
    
    text: function(nodeId, callback) {
      var node = this._node(nodeId);
      callback(node.textContent || node.innerText || '');
    },
    
    trigger: function(nodeId, eventType, callback) {
      var node = this._node(nodeId);
      Syn.trigger(eventType, {}, node);
      callback();
    },
    
    unselect: function(nodeId, callback) {
      var option = this._node(nodeId);
      if (!option.parentNode.multiple) return callback(false);
      option.selected = false;
      Syn.trigger('change', {}, option.parentNode);
      callback(true);
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
    
    visit: function(url, callback) {
      window.location.href = url;
      callback();
    }
  },
  
  Registry: {
    initialize: function() {
      this._namespace = new Faye.Namespace();
      this._elements  = {};
    },
    
    get: function(id) {
      return this._elements[id];
    },
    
    put: function(element) {
      var id = this._namespace.generate();
      this._elements[id] = element;
      return id;
    }
  },
  
  Worker: {
    initialize: function() {
      this._callbacks = [];
      this._pending   = 0;
      
      this._wrapTimeouts();
    },
    
    callback: function(callback, scope) {
      if (this._pending === 0) return callback.call(scope);
      else this._callbacks.push([callback, scope]);
    },
    
    suspend: function() {
      this._pending += 1;
    },
    
    resume: function() {
      if (this._pending === 0) return;
      this._pending -= 1;
      if (this._pending !== 0) return;
      
      var callback;
      for (var i = 0, n = this._callbacks.length; i < n; i++) {
        callback = this._callbacks[i];
        callback[0].call(callback[1]);
      }
      this._callbacks = [];
    },
    
    _wrapTimeouts: function() {
      var timeout  = window.setTimeout,
          clear    = window.clearTimeout,
          timeouts = {},
          self     = this;
      
      var finish = function(id) {
        if (!timeouts.hasOwnProperty(id)) return;
        delete timeouts[id];
        self.resume();
      };
      
      window.setTimeout = function(callback, delay) {
        var monitor = self.monitor;
        
        if (monitor) self.suspend();
        
        var id = timeout.call(window, function() {
          try {
            switch (typeof callback) {
              case 'function':  callback();     break;
              case 'string':    eval(callback); break;
            }
          } catch (e) {
            throw e;
          } finally {
            finish(id);
          }
        }, delay);
        
        if (monitor) timeouts[id] = true;
        return id;
      };
      
      window.clearTimeout = function(id) {
        finish(id);
        return clear.call(window, id);
      };
    }
  }
};

