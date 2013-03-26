Terminus = {
  isIE: /\bMSIE\b/.test(navigator.userAgent),

  connect: function(host, port) {
    if (this._bayeux) return;

    this._host = host;
    this._pageId = Faye.random();
    this._id = window.name = window.name || document.name || Faye.random();
    this._id = this._id.split('|')[0];

    var iframes = document.getElementsByTagName('iframe'), i = iframes.length;
    while (i--)
      iframes[i].contentDocument.name = iframes[i].id;

    this.Registry.initialize();
    this.Worker.initialize();
    this.AjaxMonitor.initialize();

    Faye.Event.on(window, 'beforeunload', function() { Terminus.disabled = true });

    var endpoint = 'http://' + host + ':' + port + '/messaging',
        bayeux   = this._bayeux = new Faye.Client(endpoint),
        self     = this;

    bayeux.addExtension({
      outgoing: function(message, callback) {
        message.href = window.location.href;
        if (message.connectionType === 'websocket') self._socketCapable = true;
        callback(message);
      }
    });

    this.getId(function(id) {
      var url = window.name.split('|')[1];

      if (!url)
        bayeux.subscribe('/terminus/sockets/' + id, function(message) {
          window.name += '|' + message.url;
          this.openSocket(message.url);
        }, this);

      var sub = bayeux.subscribe('/terminus/clients/' + id, this.handleMessage, this);
      sub.callback(function() {
        this.ping();
        if (url) this.openSocket(url);
      }, this);
    }, this);
  },

  browserDetails: function(callback, context) {
    this.getId(function(id) {
      callback.call(context, {
        host:     this._host,
        id:       id,
        infinite: !!window.TERMINUS_INFINITE_REDIRECT,
        page:     this._pageId,
        sockets:  this._socketCapable,
        ua:       navigator.userAgent,
        url:      window.location.href
      });
    }, this);
  },

  getId: function(callback, context) {
    var id = this._id;
    if (this.isIE) return callback.call(context, id);

    if (opener && opener.Terminus) {
      opener.Terminus.getId(function(prefix) {
        callback.call(context, prefix + '/' + id);
      });
    } else if (parent && parent !== window) {
      var getParentId = function() {
        if (!parent.Terminus) return setTimeout(getParentId, 100);
        parent.Terminus.getId(function(prefix) {
          callback.call(context, prefix + '/' + id);
        });
      };
      getParentId();
    } else {
      callback.call(context, id);
    }
  },

  openSocket: function(endpoint) {
    if (this.disabled || this._socket) return;

    var self = this,
        WS   = window.MozWebSocket || window.WebSocket,
        ws   = new WS(endpoint);

    ws.onopen = function() {
      self._socket = ws;
      up = true;
    };
    ws.onclose = function() {
      var up = !!self._socket;
      self._socket = null;
      if (up)
        self.openSocket(endpoint);
      else
        window.name = window.name.split('|')[0];
    };
    ws.onmessage = function(event) {
      self.handleMessage(JSON.parse(event.data));
    };
  },

  ping: function() {
    if (this.disabled) return;

    this.browserDetails(function(details) {
      this._bayeux.publish('/terminus/ping', details);
      var self = this;
      setTimeout(function() { self.ping() }, 3000);
    }, this);
  },

  handleMessage: function(message) {
    var command = message.command,
        method  = command.shift(),
        driver  = this.Driver,
        worker  = this.Worker,
        posted  = false,
        self    = this;

    command.push(function(result) {
      if (posted) return;
      self.postResult(message.commandId, result);
      posted = true;
    });

    worker.monitor = true;
    driver[method].apply(driver, command);
    worker.monitor = false;
  },

  postResult: function(commandId, result) {
    if (this.disabled || !commandId) return;

    if (this._socket)
      return this._socket.send(JSON.stringify({value: result}));

    this.getId(function(id) {
      this._bayeux.publish('/terminus/results', {
        id:         id,
        commandId:  commandId,
        result:     result
      });
    }, this);
  },

  getAttribute: function(node, name) {
    return Terminus.isIE ? (node.getAttributeNode(name) || {}).nodeValue || false
                         : node.getAttribute(name) || false;
  },

  hideNodes: function(root, hide, list) {
    if (!root) return list;
    list = list || [];

    var isScript = (root.tagName || '').toLowerCase() === 'script',
        isHidden = (root.style || {}).display === 'none';

    if (isScript || (hide && isHidden)) {
      var parent = root.parentNode, next = root.nextSibling;
      if (!isScript) list.push([root, parent, next]);
      if (parent) parent.removeChild(root);
    } else {
      var children = root.childNodes || [];
      for (var i = 0, n = children.length; i < n; i++) {
        this.hideNodes(children[i], hide, list);
      }
    }
    return list;
  },

  showNodes: function(hidden) {
    var hide, node, parent, next;
    for (var i = 0, n = hidden.length; i < n; i++) {
      hide   = hidden[i];
      node   = hide[0];
      parent = hide[1];
      next   = hide[2];

      if (!parent) continue;
      if (next) parent.insertBefore(node, next);
      else parent.appendChild(node);
    }
  },

  Driver: {
    _node: function(id) {
      return Terminus.Registry.get(id);
    },

    attribute: function(nodeId, name, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);

      if (!Terminus.isIE && (name === 'checked' || name === 'selected')) {
        callback(!!node[name]);
      } else if (node.tagName.toLowerCase() === 'textarea' && name === 'type') {
        callback('textarea');
      } else {
        callback(Terminus.getAttribute(node, name));
      }
    },

    set_attribute: function(nodeId, name, value, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);
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
      callback(true);
    },

    click: function(nodeId, options, callback) {
      var element = this._node(nodeId),
          timeout = options.resynchronization_timeout;

      if (!element) return callback(true);

      Syn.trigger('click', {}, element);

      if (!options.resynchronize) return callback(true);

      if (timeout)
        Terminus.Worker._setTimeout.call(window, function() {
          callback('failed to resynchronize, ajax request timed out');
        }, 1000 * timeout);

      Terminus.Worker.callback(function() {
        callback(true);
      });
    },

    current_url: function(callback) {
      Terminus.browserDetails(function(details) {
        callback(details.url);
      });
    },

    drag: function(options, callback) {
      var draggable = this._node(options.from),
          droppable = this._node(options.to);

      if (!draggable || !droppable) return callback(null);

      Syn.drag({to: droppable}, draggable, function() {
        callback(true);
      });
    },

    evaluate: function(expression, callback) {
      callback(eval(expression));
    },

    execute: function(expression, callback) {
      eval(expression);
      callback(true);
    },

    find_css: function(css, nodeId, callback) {
      var root = nodeId ? this._node(nodeId) : document;
      if (!root || !root.querySelectorAll) return callback([]);

      var result = root.querySelectorAll(css),
          list   = [];

      for (var i = 0, n = result.length; i < n; i++) {
        list[i] = Terminus.Registry.put(result[i]);
      }

      callback(list);
    },

    find_xpath: function(xpath, nodeId, callback) {
      var root = nodeId ? this._node(nodeId) : document;
      if (!root) return callback([]);

      var result = document.evaluate(xpath, root, null, XPathResult.ANY_TYPE, null),
          list   = [],
          element;

      while (element = result.iterateNext())
        list.push(Terminus.Registry.put(element));

      callback(list);
    },

    is_disabled: function(nodeId, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);

      while (node.tagName && node.tagName.toLowerCase() !== 'body') {
        if (Terminus.getAttribute(node, 'disabled')) return callback(true);
        node = node.parentNode;
      }
      callback(false);
    },

    is_visible: function(nodeId, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);

      while (node.tagName && node.tagName.toLowerCase() !== 'body') {
        if (node.style.display === 'none' || node.type === 'hidden')
          return callback(false);
        node = node.parentNode;
      }
      callback(true);
    },

    select: function(nodeId, callback) {
      var option = this._node(nodeId);
      if (!option) return callback(null);
      option.selected = true;
      Syn.trigger('change', {}, option.parentNode);
      callback(true);
    },

    set: function(nodeId, value, callback) {
      var field = this._node(nodeId),
          max   = Terminus.getAttribute(field, 'maxlength');

      if (!field) return callback(null);
      if (field.type === 'file') return callback('not_allowed');
      if (Terminus.getAttribute(field, 'readonly')) return callback(true);

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
      Syn.trigger('change', {}, field);
      callback(true);
    },

    tag_name: function(nodeId, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);
      callback(node.tagName.toLowerCase());
    },

    text: function(nodeId, hide, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);

      var hidden = Terminus.hideNodes(node, hide),
          title  = document.title;

      document.title = '';

      var text = node.textContent || node.innerText || '';

      document.title = title;
      Terminus.showNodes(hidden);

      text = text.replace(/^\s*|\s*$/g, '').replace(/\s+/g, ' ');
      callback(text);
    },

    title: function(callback) {
      callback(document.title);
    },

    trigger: function(nodeId, eventType, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);
      Syn.trigger(eventType, {}, node);
      callback(true);
    },

    unselect: function(nodeId, callback) {
      var option = this._node(nodeId);
      if (!option) return callback(null);
      if (!option.parentNode.multiple) return callback(false);
      option.selected = false;
      Syn.trigger('change', {}, option.parentNode);
      callback(true);
    },

    value: function(nodeId, callback) {
      var node = this._node(nodeId);
      if (!node) return callback(null);

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
      callback(url);
    }
  },

  Registry: {
    initialize: function() {
      this._namespace = new Faye.Namespace();
      this._elements  = {};
    },

    get: function(id) {
      var node = this._elements[id], root = node;
      while (root && root.tagName !== 'BODY' && root.tagName !== 'HTML')
        root = root.parentNode;
      if (!root) return null;
      return node;
    },

    put: function(element) {
      var id = element['data-terminus-id'];
      if (!id) {
        id = this._namespace.generate();
        element['data-terminus-id'] = id;
      }
      this._elements[id] = element;
      return id;
    }
  },

  Worker: {
    initialize: function() {
      this._callbacks = [];
      this._pending   = 0;

      if (!Terminus.isIE) this._wrapTimeouts();
    },

    callback: function(callback, scope) {
      if (this._pending === 0) {
        if (this._setTimeout)
          this._setTimeout.call(window, function() { callback.call(scope) }, 0);
        else
          setTimeout(function() { callback.call(scope) }, 0);
      } else {
        this._callbacks.push([callback, scope]);
      }
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
        var id = timeout.call(window, function() {
          try {
            switch (typeof callback) {
              case 'function':  callback();     break;
              case 'string':    eval(callback); break;
            }
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

      this._setTimeout = timeout;
    }
  },

  AjaxMonitor: {
    initialize: function() {
      if (window.jQuery) this._patchJquery();
    },

    _patchJquery: function() {
      var ajax = jQuery.ajax;
      jQuery.ajax = function(url, settings) {
        var options  = ((typeof url === 'string') ? settings : url) || {},
            complete = options.complete,
            monitor  = Terminus.Worker.monitor;

        options.complete = function() {
          var result;
          try {
            result = complete.apply(this, arguments);
          } finally {
            if (monitor) Terminus.Worker.resume();
          }
          return result;
        };

        if (monitor) Terminus.Worker.suspend();

        if (typeof url === 'string')
          return ajax.call(jQuery, url, options);
        else
          return ajax.call(jQuery, options);
      };
    }
  }
};

