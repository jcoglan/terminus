Terminus = {
  isIE: /\bMSIE\b/.test(navigator.userAgent),
  
  connect: function(endpoint) {
    if (this._client) return;
    
    this._pageId = Faye.random();
    
    this._id = window.name = window.name || Faye.random();
    
    this.Registry.initialize();
    this.Worker.initialize();
    
    var client = this._client = new Faye.Client(endpoint);
    
    this._client.subscribe('/terminus/commands', function(message) {
      this.execute(message.command);
    }, this);
    
    this._client.subscribe('/terminus/clients/' + this.getId(), function(message) {
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
  
  getId: function() {
    try { return window.opener.Terminus.getId() + '/' + this._id }
    catch (e) { return this._id }
  },
  
  browserDetails: function() {
    return {
      id:     this.getId(),
      parent: (parent && parent !== window) ? parent.name : null,
      page:   this._pageId,
      ua:     navigator.userAgent,
      url:    window.location.href
    };
  },
  
  getAttribute: function(node, name) {
    return Terminus.isIE ? node.getAttributeNode(name).nodeValue
                         : node.getAttribute(name);
  },
  
  ping: function() {
    this._client.publish('/terminus/ping', this.browserDetails());
    var self = this;
    setTimeout(function() { self.ping() }, 3000);
  },
  
  postResult: function(commandId, result) {
    if (!commandId) return;
    
    this._client.publish('/terminus/results', {
      id:         this.getId(),
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
      
      if (name === 'checked' || name === 'selected')
        return callback(!!node[name]);
      
      callback(Terminus.getAttribute(node, name));
    },
    
    set_attribute: function(nodeId, name, value, callback) {
      var node = this._node(nodeId);
      node.setAttribute(name, value);
      callback(true);
    },
    
    body: function(callback) {
      var html = document.getElementsByTagName('html')[0];
      callback(html.outerHTML ||
               '<html>\n' + html.innerHTML + '\n</html>\n');
    },
    
    clear_cookies: function(callback) {
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
    
    frame_src: function(name, callback) {
      var frame = document.getElementById(name);
      callback(frame.src);
    },
    
    is_visible: function(nodeId, callback) {
      var node = this._node(nodeId);
      
      while (node.tagName && node.tagName.toLowerCase() !== 'body') {
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
      var field = this._node(nodeId),
          max   = Terminus.getAttribute(field, 'maxlength');
      
      if (field.type === 'file') return callback('not_allowed');
      
      Syn.trigger('focus', {}, field);
      Syn.trigger('click', {}, field);
      
      switch (typeof value) {
        case 'string':
          if (max) value = value.substr(0, parseInt(max));
          field.value = value;
          break;
        case 'boolean':
          field.checked = value;
          break;
      }
      callback();
    },
    
    tag_name: function(nodeId, callback) {
      callback(this._node(nodeId).tagName.toLowerCase());
    },
    
    text: function(nodeId, callback) {
      var node    = this._node(nodeId),
          text    = node.textContent || node.innerText || '',
          scripts = node.getElementsByTagName('script'),
          i       = scripts.length;
      
      while (i--) text = text.replace(scripts[i].textContent || scripts[i].innerText, '');
      text = text.replace(/^\s*|\s*$/g, '');
      callback(text);
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
        var id = timeout(function() {
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
        
        if (self.monitor) {
          timeouts[id] = true;
          self.suspend();
        }
        return id;
      };
      
      window.clearTimeout = function(id) {
        finish(id);
        return clear(id);
      };
    }
  }
};

