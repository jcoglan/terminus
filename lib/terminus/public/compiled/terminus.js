var Pathology = {
  evaluate: function(xpathExpression, context, nsResolver, resultType, result) {
    result = result || new Pathology.XPathResult(resultType);
    var expression = Pathology.XPathParser.parse(xpathExpression);
    expression.evaluate(context, context, resultType, result);
    return result;
  },

  atomize: function(expression, context, root) {
    var result = expression.evaluate(context, root);
    if (result && result.atomize) result = result.atomize();
    return result;
  },

  array: function(list) {
    if (!list) return [];
    var array = [], i = list.length;
    while (i--) array[i] = list[i];
    return array;
  },

  indexOf: function(list, item) {
    if (list.indexOf) return list.indexOf(item);
    for (var i = 0, n = list.length; i < n; i++) {
      if (list[i] === item) return i;
    }
    return -1;
  }
};

if (typeof XPathResult === 'undefined') {
  XPathResult = {
    ANY_TYPE:                     0,
    NUMBER_TYPE:                  1,
    STRING_TYPE:                  2,
    BOOLEAN_TYPE:                 3,
    UNORDERED_NODE_ITERATOR_TYPE: 4,
    ORDERED_NODE_ITERATOR_TYPE:   5,
    UNORDERED_NODE_SNAPSHOT_TYPE: 6,
    ORDERED_NODE_SNAPSHOT_TYPE:   7,
    ANY_UNORDERED_NODE_TYPE:      8,
    FIRST_ORDERED_NODE_TYPE:      9
  };
}

if (typeof document.evaluate === 'undefined') {
  document.evaluate = function() {
    return Pathology.evaluate.apply(Pathology, arguments);
  };
}


Pathology.XPathResult = function(resultType) {
  this._type  = resultType;
  this._nodes = [];
  this._index = 0;
};

Pathology.XPathResult.prototype.push = function(node) {
  if (this._type !== 0 && node.nodeType !== this._type) return;
  if (Pathology.indexOf(this._nodes, node) >= 0) return;
  this._nodes.push(node);
};

Pathology.XPathResult.prototype.iterateNext = function() {
  var node = this._nodes[this._index];
  if (!node) return null;
  this._index += 1;
  return node;
};

Pathology.XPathResult.prototype.atomize = function() {
  if (this._nodes.length === 0) return null;
  if (this._nodes.length === 1) {
    var node = this._nodes[0];
    if (node.nodeValue === undefined || node.nodeValue === null) return node;
    return node.nodeValue;
  } else {
    var nodes = [];
    for (var i = 0, n = this._nodes.length; i < n; i++) nodes.push(this._nodes[i].nodeValue);
    return nodes;
  }
};

Pathology.XPathResult.prototype.makeString = function() {
  var first = this._nodes[0];
  if (!first) return '';

  switch (first.nodeType) {
    case XPathResult.STRING_TYPE:
      return this.atomize();

    case XPathResult.BOOLEAN_TYPE:
      var parts = [];
      for (var i = 0, n = this._nodes.length; i < n; i++)
        parts.push(this._nodes[i].nodeValue);
      return parts.join('');

    default:
      var result = document.evaluate('//text()', first, null, XPathResult.ANY_TYPE, null);
      return result.makeString();
  }
};


(function() {
  var extend = function (destination, source) {
    if (!destination || !source) return destination;
    for (var key in source) {
      if (destination[key] !== source[key])
        destination[key] = source[key];
    }
    return destination;
  };

  var find = function (root, objectName) {
    var parts = objectName.split('.'),
        part;

    while (part = parts.shift()) {
      root = root[part];
      if (root === undefined)
        throw new Error('Cannot find object named ' + objectName);
    }
    return root;
  };

  var formatError = function (error) {
    var lines  = error.input.split(/\n/g),
        lineNo = 0,
        offset = 0;

    while (offset < error.offset + 1) {
      offset += lines[lineNo].length + 1;
      lineNo += 1;
    }
    var message = 'Line ' + lineNo + ': expected ' + error.expected + '\n',
        line    = lines[lineNo - 1];

    message += line + '\n';
    offset  -= line.length + 1;

    while (offset < error.offset) {
      message += ' ';
      offset  += 1;
    }
    return message + '^';
  };

  var Grammar = {
    __consume__union_expression: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["union_expression"] = this._nodeCache["union_expression"] || {};
      var cached = this._nodeCache["union_expression"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__location_path();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.head = address1;
        var address2 = null;
        var remaining0 = 0, index2 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          var index3 = this._offset, elements2 = [], labelled1 = {}, text2 = "";
          var address4 = null;
          address4 = this.__consume__space();
          if (address4) {
            elements2.push(address4);
            text2 += address4.textValue;
            labelled1.space = address4;
            var address5 = null;
            var slice0 = null;
            if (this._input.length > this._offset) {
              slice0 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice0 = null;
            }
            if (slice0 === "|") {
              var klass0 = this.constructor.SyntaxNode;
              var type0 = null;
              address5 = new klass0("|", this._offset, []);
              if (typeof type0 === "object") {
                extend(address5, type0);
              }
              this._offset += 1;
            } else {
              address5 = null;
              var slice1 = null;
              if (this._input.length > this._offset) {
                slice1 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice1 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"|\""};
              }
            }
            if (address5) {
              elements2.push(address5);
              text2 += address5.textValue;
              var address6 = null;
              address6 = this.__consume__space();
              if (address6) {
                elements2.push(address6);
                text2 += address6.textValue;
                labelled1.space = address6;
                var address7 = null;
                address7 = this.__consume__location_path();
                if (address7) {
                  elements2.push(address7);
                  text2 += address7.textValue;
                  labelled1.location_path = address7;
                } else {
                  elements2 = null;
                  this._offset = index3;
                }
              } else {
                elements2 = null;
                this._offset = index3;
              }
            } else {
              elements2 = null;
              this._offset = index3;
            }
          } else {
            elements2 = null;
            this._offset = index3;
          }
          if (elements2) {
            this._offset = index3;
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address3 = new klass1(text2, this._offset, elements2, labelled1);
            if (typeof type1 === "object") {
              extend(address3, type1);
            }
            this._offset += text2.length;
          } else {
            address3 = null;
          }
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index2;
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address2 = new klass2(text1, this._offset, elements1);
          if (typeof type2 === "object") {
            extend(address2, type2);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.rest = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = find(this.constructor, "Union");
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["union_expression"][index0] = address0;
    },
    __consume__location_path: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["location_path"] = this._nodeCache["location_path"] || {};
      var cached = this._nodeCache["location_path"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__location_step();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.head = address1;
        var address2 = null;
        var remaining0 = 0, index2 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          address3 = this.__consume__location_step();
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index2;
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0(text1, this._offset, elements1);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.rest = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = find(this.constructor, "LocationPath");
        address0 = new klass1(text0, this._offset, elements0, labelled0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["location_path"][index0] = address0;
    },
    __consume__location_step: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["location_step"] = this._nodeCache["location_step"] || {};
      var cached = this._nodeCache["location_step"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var index2 = this._offset;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 === "/") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0("/", this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"/\""};
        }
      }
      if (address1) {
      } else {
        this._offset = index2;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address1 = new klass1("", this._offset, []);
        if (typeof type1 === "object") {
          extend(address1, type1);
        }
        this._offset += 0;
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        var index3 = this._offset;
        var index4 = this._offset, elements1 = [], labelled1 = {}, text1 = "";
        var address3 = null;
        address3 = this.__consume__axis();
        if (address3) {
          elements1.push(address3);
          text1 += address3.textValue;
          labelled1.axis = address3;
          var address4 = null;
          var index5 = this._offset;
          address4 = this.__consume__node_test();
          if (address4) {
          } else {
            this._offset = index5;
            var klass2 = this.constructor.SyntaxNode;
            var type2 = null;
            address4 = new klass2("", this._offset, []);
            if (typeof type2 === "object") {
              extend(address4, type2);
            }
            this._offset += 0;
          }
          if (address4) {
            elements1.push(address4);
            text1 += address4.textValue;
            labelled1.test = address4;
          } else {
            elements1 = null;
            this._offset = index4;
          }
        } else {
          elements1 = null;
          this._offset = index4;
        }
        if (elements1) {
          this._offset = index4;
          var klass3 = this.constructor.SyntaxNode;
          var type3 = null;
          address2 = new klass3(text1, this._offset, elements1, labelled1);
          if (typeof type3 === "object") {
            extend(address2, type3);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
        } else {
          this._offset = index3;
          var index6 = this._offset, elements2 = [], labelled2 = {}, text2 = "";
          var address5 = null;
          var index7 = this._offset;
          address5 = this.__consume__axis();
          if (address5) {
          } else {
            this._offset = index7;
            var klass4 = this.constructor.SyntaxNode;
            var type4 = null;
            address5 = new klass4("", this._offset, []);
            if (typeof type4 === "object") {
              extend(address5, type4);
            }
            this._offset += 0;
          }
          if (address5) {
            elements2.push(address5);
            text2 += address5.textValue;
            labelled2.axis = address5;
            var address6 = null;
            address6 = this.__consume__node_test();
            if (address6) {
              elements2.push(address6);
              text2 += address6.textValue;
              labelled2.test = address6;
            } else {
              elements2 = null;
              this._offset = index6;
            }
          } else {
            elements2 = null;
            this._offset = index6;
          }
          if (elements2) {
            this._offset = index6;
            var klass5 = this.constructor.SyntaxNode;
            var type5 = null;
            address2 = new klass5(text2, this._offset, elements2, labelled2);
            if (typeof type5 === "object") {
              extend(address2, type5);
            }
            this._offset += text2.length;
          } else {
            address2 = null;
          }
          if (address2) {
          } else {
            this._offset = index3;
          }
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.selector = address2;
          var address7 = null;
          var remaining0 = 0, index8 = this._offset, elements3 = [], text3 = "", address8 = true;
          while (address8) {
            address8 = this.__consume__node_predicate();
            if (address8) {
              elements3.push(address8);
              text3 += address8.textValue;
              remaining0 -= 1;
            }
          }
          if (remaining0 <= 0) {
            this._offset = index8;
            var klass6 = this.constructor.SyntaxNode;
            var type6 = null;
            address7 = new klass6(text3, this._offset, elements3);
            if (typeof type6 === "object") {
              extend(address7, type6);
            }
            this._offset += text3.length;
          } else {
            address7 = null;
          }
          if (address7) {
            elements0.push(address7);
            text0 += address7.textValue;
            labelled0.predicates = address7;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass7 = this.constructor.SyntaxNode;
        var type7 = find(this.constructor, "LocationStep");
        address0 = new klass7(text0, this._offset, elements0, labelled0);
        if (typeof type7 === "object") {
          extend(address0, type7);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["location_step"][index0] = address0;
    },
    __consume__axis: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["axis"] = this._nodeCache["axis"] || {};
      var cached = this._nodeCache["axis"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var remaining0 = 1, index3 = this._offset, elements1 = [], text1 = "", address2 = true;
      while (address2) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 && /^[a-z\-]/.test(slice0)) {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0(slice0, this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 1;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[a-z\\-]"};
          }
        }
        if (address2) {
          elements1.push(address2);
          text1 += address2.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index3;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address1 = new klass1(text1, this._offset, elements1);
        if (typeof type1 === "object") {
          extend(address1, type1);
        }
        this._offset += text1.length;
      } else {
        address1 = null;
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.axis_name = address1;
        var address3 = null;
        var slice2 = null;
        if (this._input.length > this._offset) {
          slice2 = this._input.substring(this._offset, this._offset + 2);
        } else {
          slice2 = null;
        }
        if (slice2 === "::") {
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address3 = new klass2("::", this._offset, []);
          if (typeof type2 === "object") {
            extend(address3, type2);
          }
          this._offset += 2;
        } else {
          address3 = null;
          var slice3 = null;
          if (this._input.length > this._offset) {
            slice3 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice3 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"::\""};
          }
        }
        if (address3) {
          elements0.push(address3);
          text0 += address3.textValue;
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = null;
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__axis_shorthand();
        if (address0) {
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["axis"][index0] = address0;
    },
    __consume__axis_shorthand: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["axis_shorthand"] = this._nodeCache["axis_shorthand"] || {};
      var cached = this._nodeCache["axis_shorthand"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 === "@") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address0 = new klass0("@", this._offset, []);
        if (typeof type0 === "object") {
          extend(address0, type0);
        }
        this._offset += 1;
      } else {
        address0 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"@\""};
        }
      }
      if (address0) {
      } else {
        this._offset = index1;
        var slice2 = null;
        if (this._input.length > this._offset) {
          slice2 = this._input.substring(this._offset, this._offset + 2);
        } else {
          slice2 = null;
        }
        if (slice2 === "..") {
          var klass1 = this.constructor.SyntaxNode;
          var type1 = null;
          address0 = new klass1("..", this._offset, []);
          if (typeof type1 === "object") {
            extend(address0, type1);
          }
          this._offset += 2;
        } else {
          address0 = null;
          var slice3 = null;
          if (this._input.length > this._offset) {
            slice3 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice3 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"..\""};
          }
        }
        if (address0) {
        } else {
          this._offset = index1;
          var slice4 = null;
          if (this._input.length > this._offset) {
            slice4 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice4 = null;
          }
          if (slice4 === ".") {
            var klass2 = this.constructor.SyntaxNode;
            var type2 = null;
            address0 = new klass2(".", this._offset, []);
            if (typeof type2 === "object") {
              extend(address0, type2);
            }
            this._offset += 1;
          } else {
            address0 = null;
            var slice5 = null;
            if (this._input.length > this._offset) {
              slice5 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice5 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\".\""};
            }
          }
          if (address0) {
          } else {
            this._offset = index1;
            var slice6 = null;
            if (this._input.length > this._offset) {
              slice6 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice6 = null;
            }
            if (slice6 === "/") {
              var klass3 = this.constructor.SyntaxNode;
              var type3 = null;
              address0 = new klass3("/", this._offset, []);
              if (typeof type3 === "object") {
                extend(address0, type3);
              }
              this._offset += 1;
            } else {
              address0 = null;
              var slice7 = null;
              if (this._input.length > this._offset) {
                slice7 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice7 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"/\""};
              }
            }
            if (address0) {
            } else {
              this._offset = index1;
            }
          }
        }
      }
      return this._nodeCache["axis_shorthand"][index0] = address0;
    },
    __consume__node_test: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["node_test"] = this._nodeCache["node_test"] || {};
      var cached = this._nodeCache["node_test"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var index2 = this._offset;
      address1 = this.__consume__node_condition();
      if (address1) {
      } else {
        this._offset = index2;
        address1 = this.__consume__node_name();
        if (address1) {
        } else {
          this._offset = index2;
          var slice0 = null;
          if (this._input.length > this._offset) {
            slice0 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice0 = null;
          }
          if (slice0 === "*") {
            var klass0 = this.constructor.SyntaxNode;
            var type0 = null;
            address1 = new klass0("*", this._offset, []);
            if (typeof type0 === "object") {
              extend(address1, type0);
            }
            this._offset += 1;
          } else {
            address1 = null;
            var slice1 = null;
            if (this._input.length > this._offset) {
              slice1 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice1 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"*\""};
            }
          }
          if (address1) {
          } else {
            this._offset = index2;
          }
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        var index3 = this._offset;
        address2 = this.__consume__subscript();
        if (address2) {
        } else {
          this._offset = index3;
          var klass1 = this.constructor.SyntaxNode;
          var type1 = null;
          address2 = new klass1("", this._offset, []);
          if (typeof type1 === "object") {
            extend(address2, type1);
          }
          this._offset += 0;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.subscript = address2;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass2 = this.constructor.SyntaxNode;
        var type2 = find(this.constructor, "NodeTest");
        address0 = new klass2(text0, this._offset, elements0, labelled0);
        if (typeof type2 === "object") {
          extend(address0, type2);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["node_test"][index0] = address0;
    },
    __consume__node_condition: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["node_condition"] = this._nodeCache["node_condition"] || {};
      var cached = this._nodeCache["node_condition"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var remaining0 = 1, index2 = this._offset, elements1 = [], text1 = "", address2 = true;
      while (address2) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 && /^[a-z\-]/.test(slice0)) {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0(slice0, this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 1;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[a-z\\-]"};
          }
        }
        if (address2) {
          elements1.push(address2);
          text1 += address2.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index2;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address1 = new klass1(text1, this._offset, elements1);
        if (typeof type1 === "object") {
          extend(address1, type1);
        }
        this._offset += text1.length;
      } else {
        address1 = null;
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.condition_name = address1;
        var address3 = null;
        var slice2 = null;
        if (this._input.length > this._offset) {
          slice2 = this._input.substring(this._offset, this._offset + 2);
        } else {
          slice2 = null;
        }
        if (slice2 === "()") {
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address3 = new klass2("()", this._offset, []);
          if (typeof type2 === "object") {
            extend(address3, type2);
          }
          this._offset += 2;
        } else {
          address3 = null;
          var slice3 = null;
          if (this._input.length > this._offset) {
            slice3 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice3 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"()\""};
          }
        }
        if (address3) {
          elements0.push(address3);
          text0 += address3.textValue;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = null;
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["node_condition"][index0] = address0;
    },
    __consume__node_name: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["node_name"] = this._nodeCache["node_name"] || {};
      var cached = this._nodeCache["node_name"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], text0 = "", address1 = true;
      while (address1) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 && /^[A-Za-z0-9\-]/.test(slice0)) {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address1 = new klass0(slice0, this._offset, []);
          if (typeof type0 === "object") {
            extend(address1, type0);
          }
          this._offset += 1;
        } else {
          address1 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[A-Za-z0-9\\-]"};
          }
        }
        if (address1) {
          elements0.push(address1);
          text0 += address1.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index1;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address0 = new klass1(text0, this._offset, elements0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["node_name"][index0] = address0;
    },
    __consume__subscript: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["subscript"] = this._nodeCache["subscript"] || {};
      var cached = this._nodeCache["subscript"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 === "[") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0("[", this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"[\""};
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        address2 = this.__consume__space();
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.space = address2;
          var address3 = null;
          address3 = this.__consume__integer();
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            labelled0.integer = address3;
            var address4 = null;
            address4 = this.__consume__space();
            if (address4) {
              elements0.push(address4);
              text0 += address4.textValue;
              labelled0.space = address4;
              var address5 = null;
              var slice2 = null;
              if (this._input.length > this._offset) {
                slice2 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice2 = null;
              }
              if (slice2 === "]") {
                var klass1 = this.constructor.SyntaxNode;
                var type1 = null;
                address5 = new klass1("]", this._offset, []);
                if (typeof type1 === "object") {
                  extend(address5, type1);
                }
                this._offset += 1;
              } else {
                address5 = null;
                var slice3 = null;
                if (this._input.length > this._offset) {
                  slice3 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice3 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"]\""};
                }
              }
              if (address5) {
                elements0.push(address5);
                text0 += address5.textValue;
              } else {
                elements0 = null;
                this._offset = index1;
              }
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass2 = this.constructor.SyntaxNode;
        var type2 = null;
        address0 = new klass2(text0, this._offset, elements0, labelled0);
        if (typeof type2 === "object") {
          extend(address0, type2);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["subscript"][index0] = address0;
    },
    __consume__node_predicate: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["node_predicate"] = this._nodeCache["node_predicate"] || {};
      var cached = this._nodeCache["node_predicate"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 === "[") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0("[", this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"[\""};
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        address2 = this.__consume__expression();
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.expression = address2;
          var address3 = null;
          var slice2 = null;
          if (this._input.length > this._offset) {
            slice2 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice2 = null;
          }
          if (slice2 === "]") {
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address3 = new klass1("]", this._offset, []);
            if (typeof type1 === "object") {
              extend(address3, type1);
            }
            this._offset += 1;
          } else {
            address3 = null;
            var slice3 = null;
            if (this._input.length > this._offset) {
              slice3 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice3 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"]\""};
            }
          }
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            var address4 = null;
            var index2 = this._offset;
            address4 = this.__consume__subscript();
            if (address4) {
            } else {
              this._offset = index2;
              var klass2 = this.constructor.SyntaxNode;
              var type2 = null;
              address4 = new klass2("", this._offset, []);
              if (typeof type2 === "object") {
                extend(address4, type2);
              }
              this._offset += 0;
            }
            if (address4) {
              elements0.push(address4);
              text0 += address4.textValue;
              labelled0.subscript = address4;
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = null;
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["node_predicate"][index0] = address0;
    },
    __consume__expression: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["expression"] = this._nodeCache["expression"] || {};
      var cached = this._nodeCache["expression"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      address0 = this.__consume__or_expression();
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__and_expression();
        if (address0) {
        } else {
          this._offset = index1;
          address0 = this.__consume__comparison();
          if (address0) {
          } else {
            this._offset = index1;
            address0 = this.__consume__atom();
            if (address0) {
            } else {
              this._offset = index1;
            }
          }
        }
      }
      return this._nodeCache["expression"][index0] = address0;
    },
    __consume__or_expression: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["or_expression"] = this._nodeCache["or_expression"] || {};
      var cached = this._nodeCache["or_expression"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__and_expression();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.left = address1;
        var address2 = null;
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 2);
        } else {
          slice0 = null;
        }
        if (slice0 === "or") {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0("or", this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 2;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"or\""};
          }
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          var address3 = null;
          address3 = this.__consume__or_expression();
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            labelled0.right = address3;
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = find(this.constructor, "Or");
        address0 = new klass1(text0, this._offset, elements0, labelled0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__and_expression();
        if (address0) {
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["or_expression"][index0] = address0;
    },
    __consume__and_expression: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["and_expression"] = this._nodeCache["and_expression"] || {};
      var cached = this._nodeCache["and_expression"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__comparison();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.left = address1;
        var address2 = null;
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 3);
        } else {
          slice0 = null;
        }
        if (slice0 === "and") {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0("and", this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 3;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"and\""};
          }
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          var address3 = null;
          address3 = this.__consume__and_expression();
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            labelled0.right = address3;
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = find(this.constructor, "And");
        address0 = new klass1(text0, this._offset, elements0, labelled0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__comparison();
        if (address0) {
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["and_expression"][index0] = address0;
    },
    __consume__comparison: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["comparison"] = this._nodeCache["comparison"] || {};
      var cached = this._nodeCache["comparison"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__atom();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.left = address1;
        var address2 = null;
        address2 = this.__consume__comparator();
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.comparator = address2;
          var address3 = null;
          address3 = this.__consume__comparison();
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            labelled0.right = address3;
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass0 = this.constructor.SyntaxNode;
        var type0 = find(this.constructor, "Comparison");
        address0 = new klass0(text0, this._offset, elements0, labelled0);
        if (typeof type0 === "object") {
          extend(address0, type0);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__atom();
        if (address0) {
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["comparison"][index0] = address0;
    },
    __consume__comparator: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["comparator"] = this._nodeCache["comparator"] || {};
      var cached = this._nodeCache["comparator"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 2);
      } else {
        slice0 = null;
      }
      if (slice0 === "!=") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address0 = new klass0("!=", this._offset, []);
        if (typeof type0 === "object") {
          extend(address0, type0);
        }
        this._offset += 2;
      } else {
        address0 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"!=\""};
        }
      }
      if (address0) {
      } else {
        this._offset = index1;
        var slice2 = null;
        if (this._input.length > this._offset) {
          slice2 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice2 = null;
        }
        if (slice2 === "=") {
          var klass1 = this.constructor.SyntaxNode;
          var type1 = null;
          address0 = new klass1("=", this._offset, []);
          if (typeof type1 === "object") {
            extend(address0, type1);
          }
          this._offset += 1;
        } else {
          address0 = null;
          var slice3 = null;
          if (this._input.length > this._offset) {
            slice3 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice3 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"=\""};
          }
        }
        if (address0) {
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["comparator"][index0] = address0;
    },
    __consume__atom: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["atom"] = this._nodeCache["atom"] || {};
      var cached = this._nodeCache["atom"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__space();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.space = address1;
        var address2 = null;
        var index2 = this._offset;
        var index3 = this._offset, elements1 = [], labelled1 = {}, text1 = "";
        var address3 = null;
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 === "(") {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address3 = new klass0("(", this._offset, []);
          if (typeof type0 === "object") {
            extend(address3, type0);
          }
          this._offset += 1;
        } else {
          address3 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"(\""};
          }
        }
        if (address3) {
          elements1.push(address3);
          text1 += address3.textValue;
          var address4 = null;
          address4 = this.__consume__expression();
          if (address4) {
            elements1.push(address4);
            text1 += address4.textValue;
            labelled1.in_parens = address4;
            var address5 = null;
            var slice2 = null;
            if (this._input.length > this._offset) {
              slice2 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice2 = null;
            }
            if (slice2 === ")") {
              var klass1 = this.constructor.SyntaxNode;
              var type1 = null;
              address5 = new klass1(")", this._offset, []);
              if (typeof type1 === "object") {
                extend(address5, type1);
              }
              this._offset += 1;
            } else {
              address5 = null;
              var slice3 = null;
              if (this._input.length > this._offset) {
                slice3 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice3 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\")\""};
              }
            }
            if (address5) {
              elements1.push(address5);
              text1 += address5.textValue;
            } else {
              elements1 = null;
              this._offset = index3;
            }
          } else {
            elements1 = null;
            this._offset = index3;
          }
        } else {
          elements1 = null;
          this._offset = index3;
        }
        if (elements1) {
          this._offset = index3;
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address2 = new klass2(text1, this._offset, elements1, labelled1);
          if (typeof type2 === "object") {
            extend(address2, type2);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
        } else {
          this._offset = index2;
          address2 = this.__consume__value();
          if (address2) {
          } else {
            this._offset = index2;
          }
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.expression = address2;
          var address6 = null;
          address6 = this.__consume__space();
          if (address6) {
            elements0.push(address6);
            text0 += address6.textValue;
            labelled0.space = address6;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = find(this.constructor, "Atom");
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["atom"][index0] = address0;
    },
    __consume__value: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["value"] = this._nodeCache["value"] || {};
      var cached = this._nodeCache["value"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      address0 = this.__consume__function_call();
      if (address0) {
      } else {
        this._offset = index1;
        address0 = this.__consume__string();
        if (address0) {
        } else {
          this._offset = index1;
          address0 = this.__consume__union_expression();
          if (address0) {
          } else {
            this._offset = index1;
          }
        }
      }
      return this._nodeCache["value"][index0] = address0;
    },
    __consume__function_call: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["function_call"] = this._nodeCache["function_call"] || {};
      var cached = this._nodeCache["function_call"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__function_name();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.function_name = address1;
        var address2 = null;
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 === "(") {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0("(", this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 1;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"(\""};
          }
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          var address3 = null;
          address3 = this.__consume__function_args();
          if (address3) {
            elements0.push(address3);
            text0 += address3.textValue;
            labelled0.function_args = address3;
            var address4 = null;
            var slice2 = null;
            if (this._input.length > this._offset) {
              slice2 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice2 = null;
            }
            if (slice2 === ")") {
              var klass1 = this.constructor.SyntaxNode;
              var type1 = null;
              address4 = new klass1(")", this._offset, []);
              if (typeof type1 === "object") {
                extend(address4, type1);
              }
              this._offset += 1;
            } else {
              address4 = null;
              var slice3 = null;
              if (this._input.length > this._offset) {
                slice3 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice3 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\")\""};
              }
            }
            if (address4) {
              elements0.push(address4);
              text0 += address4.textValue;
            } else {
              elements0 = null;
              this._offset = index1;
            }
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass2 = this.constructor.SyntaxNode;
        var type2 = find(this.constructor, "FunctionCall");
        address0 = new klass2(text0, this._offset, elements0, labelled0);
        if (typeof type2 === "object") {
          extend(address0, type2);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["function_call"][index0] = address0;
    },
    __consume__function_name: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["function_name"] = this._nodeCache["function_name"] || {};
      var cached = this._nodeCache["function_name"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var remaining0 = 1, index1 = this._offset, elements0 = [], text0 = "", address1 = true;
      while (address1) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 && /^[a-z\-]/.test(slice0)) {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address1 = new klass0(slice0, this._offset, []);
          if (typeof type0 === "object") {
            extend(address1, type0);
          }
          this._offset += 1;
        } else {
          address1 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[a-z\\-]"};
          }
        }
        if (address1) {
          elements0.push(address1);
          text0 += address1.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index1;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address0 = new klass1(text0, this._offset, elements0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["function_name"][index0] = address0;
    },
    __consume__function_args: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["function_args"] = this._nodeCache["function_args"] || {};
      var cached = this._nodeCache["function_args"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      address1 = this.__consume__expression();
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        labelled0.first = address1;
        var address2 = null;
        var remaining0 = 0, index3 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          var index4 = this._offset, elements2 = [], labelled1 = {}, text2 = "";
          var address4 = null;
          var slice0 = null;
          if (this._input.length > this._offset) {
            slice0 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice0 = null;
          }
          if (slice0 === ",") {
            var klass0 = this.constructor.SyntaxNode;
            var type0 = null;
            address4 = new klass0(",", this._offset, []);
            if (typeof type0 === "object") {
              extend(address4, type0);
            }
            this._offset += 1;
          } else {
            address4 = null;
            var slice1 = null;
            if (this._input.length > this._offset) {
              slice1 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice1 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\",\""};
            }
          }
          if (address4) {
            elements2.push(address4);
            text2 += address4.textValue;
            var address5 = null;
            address5 = this.__consume__expression();
            if (address5) {
              elements2.push(address5);
              text2 += address5.textValue;
              labelled1.expression = address5;
            } else {
              elements2 = null;
              this._offset = index4;
            }
          } else {
            elements2 = null;
            this._offset = index4;
          }
          if (elements2) {
            this._offset = index4;
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address3 = new klass1(text2, this._offset, elements2, labelled1);
            if (typeof type1 === "object") {
              extend(address3, type1);
            }
            this._offset += text2.length;
          } else {
            address3 = null;
          }
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index3;
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address2 = new klass2(text1, this._offset, elements1);
          if (typeof type2 === "object") {
            extend(address2, type2);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.rest = address2;
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = null;
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        var klass4 = this.constructor.SyntaxNode;
        var type4 = null;
        address0 = new klass4("", this._offset, []);
        if (typeof type4 === "object") {
          extend(address0, type4);
        }
        this._offset += 0;
      }
      return this._nodeCache["function_args"][index0] = address0;
    },
    __consume__integer: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["integer"] = this._nodeCache["integer"] || {};
      var cached = this._nodeCache["integer"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 && /^[1-9]/.test(slice0)) {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0(slice0, this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[1-9]"};
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        var remaining0 = 0, index2 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          var slice2 = null;
          if (this._input.length > this._offset) {
            slice2 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice2 = null;
          }
          if (slice2 && /^[0-9]/.test(slice2)) {
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address3 = new klass1(slice2, this._offset, []);
            if (typeof type1 === "object") {
              extend(address3, type1);
            }
            this._offset += 1;
          } else {
            address3 = null;
            var slice3 = null;
            if (this._input.length > this._offset) {
              slice3 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice3 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[0-9]"};
            }
          }
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index2;
          var klass2 = this.constructor.SyntaxNode;
          var type2 = null;
          address2 = new klass2(text1, this._offset, elements1);
          if (typeof type2 === "object") {
            extend(address2, type2);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass3 = this.constructor.SyntaxNode;
        var type3 = find(this.constructor, "Integer");
        address0 = new klass3(text0, this._offset, elements0, labelled0);
        if (typeof type3 === "object") {
          extend(address0, type3);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["integer"][index0] = address0;
    },
    __consume__string: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["string"] = this._nodeCache["string"] || {};
      var cached = this._nodeCache["string"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 === "'") {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0("'", this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"'\""};
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        var remaining0 = 0, index3 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          var index4 = this._offset;
          var index5 = this._offset, elements2 = [], labelled1 = {}, text2 = "";
          var address4 = null;
          var slice2 = null;
          if (this._input.length > this._offset) {
            slice2 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice2 = null;
          }
          if (slice2 === "\\") {
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address4 = new klass1("\\", this._offset, []);
            if (typeof type1 === "object") {
              extend(address4, type1);
            }
            this._offset += 1;
          } else {
            address4 = null;
            var slice3 = null;
            if (this._input.length > this._offset) {
              slice3 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice3 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"\\\\\""};
            }
          }
          if (address4) {
            elements2.push(address4);
            text2 += address4.textValue;
            var address5 = null;
            var slice4 = null;
            if (this._input.length > this._offset) {
              slice4 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice4 = null;
            }
            var temp0 = slice4;
            if (temp0 === null) {
              address5 = null;
              var slice5 = null;
              if (this._input.length > this._offset) {
                slice5 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice5 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "<any char>"};
              }
            } else {
              var klass2 = this.constructor.SyntaxNode;
              var type2 = null;
              address5 = new klass2(temp0, this._offset, []);
              if (typeof type2 === "object") {
                extend(address5, type2);
              }
              this._offset += 1;
            }
            if (address5) {
              elements2.push(address5);
              text2 += address5.textValue;
            } else {
              elements2 = null;
              this._offset = index5;
            }
          } else {
            elements2 = null;
            this._offset = index5;
          }
          if (elements2) {
            this._offset = index5;
            var klass3 = this.constructor.SyntaxNode;
            var type3 = null;
            address3 = new klass3(text2, this._offset, elements2, labelled1);
            if (typeof type3 === "object") {
              extend(address3, type3);
            }
            this._offset += text2.length;
          } else {
            address3 = null;
          }
          if (address3) {
          } else {
            this._offset = index4;
            var slice6 = null;
            if (this._input.length > this._offset) {
              slice6 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice6 = null;
            }
            if (slice6 && /^[^']/.test(slice6)) {
              var klass4 = this.constructor.SyntaxNode;
              var type4 = null;
              address3 = new klass4(slice6, this._offset, []);
              if (typeof type4 === "object") {
                extend(address3, type4);
              }
              this._offset += 1;
            } else {
              address3 = null;
              var slice7 = null;
              if (this._input.length > this._offset) {
                slice7 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice7 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[^']"};
              }
            }
            if (address3) {
            } else {
              this._offset = index4;
            }
          }
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index3;
          var klass5 = this.constructor.SyntaxNode;
          var type5 = null;
          address2 = new klass5(text1, this._offset, elements1);
          if (typeof type5 === "object") {
            extend(address2, type5);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          var address6 = null;
          var slice8 = null;
          if (this._input.length > this._offset) {
            slice8 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice8 = null;
          }
          if (slice8 === "'") {
            var klass6 = this.constructor.SyntaxNode;
            var type6 = null;
            address6 = new klass6("'", this._offset, []);
            if (typeof type6 === "object") {
              extend(address6, type6);
            }
            this._offset += 1;
          } else {
            address6 = null;
            var slice9 = null;
            if (this._input.length > this._offset) {
              slice9 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice9 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"'\""};
            }
          }
          if (address6) {
            elements0.push(address6);
            text0 += address6.textValue;
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass7 = this.constructor.SyntaxNode;
        var type7 = null;
        address0 = new klass7(text0, this._offset, elements0, labelled0);
        if (typeof type7 === "object") {
          extend(address0, type7);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
        var type8 = find(this.constructor, "String");
        if (typeof type8 === "object") {
          extend(address0, type8);
        }
      } else {
        this._offset = index1;
        var index6 = this._offset, elements3 = [], labelled2 = {}, text3 = "";
        var address7 = null;
        var slice10 = null;
        if (this._input.length > this._offset) {
          slice10 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice10 = null;
        }
        if (slice10 === "\"") {
          var klass8 = this.constructor.SyntaxNode;
          var type9 = null;
          address7 = new klass8("\"", this._offset, []);
          if (typeof type9 === "object") {
            extend(address7, type9);
          }
          this._offset += 1;
        } else {
          address7 = null;
          var slice11 = null;
          if (this._input.length > this._offset) {
            slice11 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice11 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"\\\"\""};
          }
        }
        if (address7) {
          elements3.push(address7);
          text3 += address7.textValue;
          var address8 = null;
          var remaining1 = 0, index7 = this._offset, elements4 = [], text4 = "", address9 = true;
          while (address9) {
            var index8 = this._offset;
            var index9 = this._offset, elements5 = [], labelled3 = {}, text5 = "";
            var address10 = null;
            var slice12 = null;
            if (this._input.length > this._offset) {
              slice12 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice12 = null;
            }
            if (slice12 === "\\") {
              var klass9 = this.constructor.SyntaxNode;
              var type10 = null;
              address10 = new klass9("\\", this._offset, []);
              if (typeof type10 === "object") {
                extend(address10, type10);
              }
              this._offset += 1;
            } else {
              address10 = null;
              var slice13 = null;
              if (this._input.length > this._offset) {
                slice13 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice13 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"\\\\\""};
              }
            }
            if (address10) {
              elements5.push(address10);
              text5 += address10.textValue;
              var address11 = null;
              var slice14 = null;
              if (this._input.length > this._offset) {
                slice14 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice14 = null;
              }
              var temp1 = slice14;
              if (temp1 === null) {
                address11 = null;
                var slice15 = null;
                if (this._input.length > this._offset) {
                  slice15 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice15 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "<any char>"};
                }
              } else {
                var klass10 = this.constructor.SyntaxNode;
                var type11 = null;
                address11 = new klass10(temp1, this._offset, []);
                if (typeof type11 === "object") {
                  extend(address11, type11);
                }
                this._offset += 1;
              }
              if (address11) {
                elements5.push(address11);
                text5 += address11.textValue;
              } else {
                elements5 = null;
                this._offset = index9;
              }
            } else {
              elements5 = null;
              this._offset = index9;
            }
            if (elements5) {
              this._offset = index9;
              var klass11 = this.constructor.SyntaxNode;
              var type12 = null;
              address9 = new klass11(text5, this._offset, elements5, labelled3);
              if (typeof type12 === "object") {
                extend(address9, type12);
              }
              this._offset += text5.length;
            } else {
              address9 = null;
            }
            if (address9) {
            } else {
              this._offset = index8;
              var slice16 = null;
              if (this._input.length > this._offset) {
                slice16 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice16 = null;
              }
              if (slice16 && /^[^"]/.test(slice16)) {
                var klass12 = this.constructor.SyntaxNode;
                var type13 = null;
                address9 = new klass12(slice16, this._offset, []);
                if (typeof type13 === "object") {
                  extend(address9, type13);
                }
                this._offset += 1;
              } else {
                address9 = null;
                var slice17 = null;
                if (this._input.length > this._offset) {
                  slice17 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice17 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[^\"]"};
                }
              }
              if (address9) {
              } else {
                this._offset = index8;
              }
            }
            if (address9) {
              elements4.push(address9);
              text4 += address9.textValue;
              remaining1 -= 1;
            }
          }
          if (remaining1 <= 0) {
            this._offset = index7;
            var klass13 = this.constructor.SyntaxNode;
            var type14 = null;
            address8 = new klass13(text4, this._offset, elements4);
            if (typeof type14 === "object") {
              extend(address8, type14);
            }
            this._offset += text4.length;
          } else {
            address8 = null;
          }
          if (address8) {
            elements3.push(address8);
            text3 += address8.textValue;
            var address12 = null;
            var slice18 = null;
            if (this._input.length > this._offset) {
              slice18 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice18 = null;
            }
            if (slice18 === "\"") {
              var klass14 = this.constructor.SyntaxNode;
              var type15 = null;
              address12 = new klass14("\"", this._offset, []);
              if (typeof type15 === "object") {
                extend(address12, type15);
              }
              this._offset += 1;
            } else {
              address12 = null;
              var slice19 = null;
              if (this._input.length > this._offset) {
                slice19 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice19 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"\\\"\""};
              }
            }
            if (address12) {
              elements3.push(address12);
              text3 += address12.textValue;
            } else {
              elements3 = null;
              this._offset = index6;
            }
          } else {
            elements3 = null;
            this._offset = index6;
          }
        } else {
          elements3 = null;
          this._offset = index6;
        }
        if (elements3) {
          this._offset = index6;
          var klass15 = this.constructor.SyntaxNode;
          var type16 = null;
          address0 = new klass15(text3, this._offset, elements3, labelled2);
          if (typeof type16 === "object") {
            extend(address0, type16);
          }
          this._offset += text3.length;
        } else {
          address0 = null;
        }
        if (address0) {
          var type17 = find(this.constructor, "String");
          if (typeof type17 === "object") {
            extend(address0, type17);
          }
        } else {
          this._offset = index1;
        }
      }
      return this._nodeCache["string"][index0] = address0;
    },
    __consume__space: function() {
      var address0 = null, index0 = this._offset;
      this._nodeCache["space"] = this._nodeCache["space"] || {};
      var cached = this._nodeCache["space"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var remaining0 = 0, index1 = this._offset, elements0 = [], text0 = "", address1 = true;
      while (address1) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 === " ") {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address1 = new klass0(" ", this._offset, []);
          if (typeof type0 === "object") {
            extend(address1, type0);
          }
          this._offset += 1;
        } else {
          address1 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\" \""};
          }
        }
        if (address1) {
          elements0.push(address1);
          text0 += address1.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index1;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address0 = new klass1(text0, this._offset, elements0);
        if (typeof type1 === "object") {
          extend(address0, type1);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["space"][index0] = address0;
    }
  };

  var Parser = function(input) {
    this._input = input;
    this._offset = 0;
    this._nodeCache = {};
  };

  Parser.prototype.parse = function() {
    var result = this.__consume__union_expression();
    if (result && this._offset === this._input.length) {
      return result;
    }
    if (!(this.error)) {
      this.error = {input: this._input, offset: this._offset, expected: "<EOF>"};
    }
    var message = formatError(this.error);
    var error = new Error(message);
    throw error;
  };

  Parser.parse = function(input) {
    var parser = new Parser(input);
    return parser.parse();
  };

  extend(Parser.prototype, Grammar);

  var SyntaxNode = function(textValue, offset, elements, properties) {
    this.textValue = textValue;
    this.offset    = offset;
    this.elements  = elements || [];
    if (!properties) return;
    for (var key in properties) this[key] = properties[key];
  };

  SyntaxNode.prototype.forEach = function(block, context) {
    for (var i = 0, n = this.elements.length; i < n; i++) {
      block.call(context, this.elements[i], i);
    }
  };

  Parser.SyntaxNode = SyntaxNode;

  if (typeof require === "function" && typeof exports === "object") {
    exports.Grammar = Grammar;
    exports.Parser  = Parser;
    exports.parse   = Parser.parse;

    if (typeof Pathology !== "undefined") {
      Pathology.XPath = Grammar;
      Pathology.XPathParser = Parser;
      Pathology.XPathParser.formatError = formatError;
    }
  } else {
    var namespace = this;
    namespace = namespace.Pathology = namespace.Pathology || {};
    Pathology.XPath = Grammar;
    Pathology.XPathParser = Parser;
    Pathology.XPathParser.formatError = formatError;
  }
})();


Pathology.XPathParser.And = {
  evaluate: function(context, root) {
    return Pathology.atomize(this.left, context, root) &&
           Pathology.atomize(this.right, context, root);
  }
};


Pathology.XPathParser.Atom = {
  evaluate: function(context, root) {
    var expression = this.expression.in_parens || this.expression;
    return expression.evaluate(context, root);
  }
};


Pathology.Axis = function(name) {
  this.name = name;
};

Pathology.Axis.prototype.walk = function(context, block, scope) {
  var children   = context.childNodes,
      attributes = Pathology.array(context.attributes),
      sibling;

  if (context.checked)
    attributes.push({ nodeName:   'checked',
                      nodeValue:  true,
                      nodeType:   XPathResult.STRING_TYPE
                   });

  if (context.selected)
    attributes.push({ nodeName:   'selected',
                      nodeValue:  true,
                      nodeType:   XPathResult.STRING_TYPE
                   });

  switch (this.name) {
    case 'attribute':
      for (var i = 0, n = attributes.length; i < n; i++) {
        block.call(scope, attributes[i]);
      }
      break;

    case 'child':
      for (var i = 0, n = children.length; i < n; i++) {
        block.call(scope, children[i]);
      }
      break;

    case 'descendant-or-self':
      block.call(scope, context);
      for (var i = 0, n = children.length; i < n; i++) {
        this.walk(children[i], block, scope);
      }
      break;

    case 'following-sibling':
      sibling = context.nextSibling;
      while (sibling) {
        block.call(scope, sibling);
        sibling = sibling.nextSibling;
      }
      break;

    case 'parent':
      block.call(scope, context.parentNode);
      break;

    case 'self':
      block.call(scope, context);
      break;
  }
};

Pathology.Axis.SHORTHANDS = {
  '@' : 'attribute',
  '..': 'parent',
  '.' : 'self',
  '/' : 'descendant-or-self',
  ''  : 'child'
};

Pathology.Axis.fromAST = function(node) {
  var name = node.axis_name
           ? node.axis_name.textValue
           : node.textValue;

  return new this(this.SHORTHANDS[name] || name);
};


Pathology.XPathParser.Comparison = {
  evaluate: function(context, root) {
    // TODO make this symmetric
    var comparator = this.comparator.textValue,
        left       = this.left.evaluate(context, root),
        right      = Pathology.atomize(this.right, context, root),
        viable     = false,
        array      = (right instanceof Array),
        node;

    if (left._nodes) {
      for (var i = 0, n = left._nodes.length; i < n; i++) {
        node = left._nodes[i];
        if (comparator === '=') {
          viable = viable || (array ? Pathology.indexOf(right, node.nodeValue) >= 0 : (node.nodeValue === right || node.innerHTML === right));
        } else if (comparator === '!=') {
          viable = viable || (array ? Pathology.indexOf(right, node.nodeValue) < 0 : (node.nodeValue !== right && node.innerHTML !== right));
        }
      }
      return viable;

    } else {
      switch (comparator) {
        case '=':   return array ? Pathology.indexOf(right, left.nodeValue) >= 0 : left == right;
        case '!=':  return array ? Pathology.indexOf(right, node.nodeValue) <  0 : left != right;
      }
    }
  }
};


Pathology.XPathParser.FunctionCall = {
  getArguments: function(context, root) {
    var args = [],
        rest = this.function_args.rest;

    if (this.function_args.first && this.function_args.first.evaluate) {
      args.push(this.function_args.first.evaluate(context, root));
    }
    if (rest) {
      for (var i = 0, n = rest.elements.length; i < n; i++)
        args.push(rest.elements[i].expression.evaluate(context, root));
    }
    return args;
  },

  evaluate: function(context, root) {
    var args = this.getArguments(context, root),
        proc = this.REGISTER[this.function_name.textValue];

    return proc.apply(context, args);
  },

  REGISTER: {
    'concat': function() {
      var string = '';
      for (var i = 0, n = arguments.length; i < n; i++)
        string += arguments[i].makeString ? arguments[i].makeString() : arguments[i];
      return string;
    },

    'contains': function(haystack, needle) {
      if (!haystack) return false;
      if (haystack.makeString) haystack = haystack.makeString();

      return haystack.toString().indexOf(needle) >= 0;
    },

    'normalize-space': function(string) {
      if (string.makeString) string = string.makeString();

      return string.toString().replace(/^\s*/g, '')
                              .replace(/\s*$/g, '')
                              .replace(/\s+/g, ' ');
    },

    'name': function() {
      return this.nodeName.toLowerCase();
    },

    'not': function(value) {
      if (value && value.atomize) value = value.atomize();
      if (typeof value === 'string') return false;
      return !value;
    },

    'string': function(value) {
      return value.atomize().innerText;
    },

    'text': function() {
      return document.evaluate('/text()', this, null, XPathResult.ANY_TYPE, null);
    }
  }
};


Pathology.XPathParser.LocationPath = {
  eachStep: function(block, scope) {
    var list = [this.head].concat(this.rest.elements);
    for (var i = 0, n = list.length; i < n; i++)
      block.call(scope, list[i]);
  },

  evaluate: function(context, root, resultType, result) {
    result = result || new Pathology.XPathResult(XPathResult.ANY_TYPE);
    resultType = resultType || XPathResult.ANY_TYPE;

    var intermediate = new Pathology.XPathResult(resultType),
        startNode    = this.head.isRelative() ? context : root,
        steps        = [this.head].concat(this.rest.elements),
        step,
        nextStage,
        i, j, n, m;

    intermediate.push(startNode);

    for (i = 0, n = steps.length; i < n; i++) {
      step = steps[i];
      nextStage = new Pathology.XPathResult(resultType);
      for (j = 0, m = intermediate._nodes.length; j < m; j++) {
        step.evaluate(intermediate._nodes[j], root, resultType, nextStage);
      }
      intermediate = nextStage;
    }

    for (i = 0, n = intermediate._nodes.length; i < n; i++)
      result.push(intermediate._nodes[i]);

    return result;
  }
};


Pathology.XPathParser.LocationStep = {
  isRelative: function() {
    return this.elements[0].textValue !== '/';
  },

  evaluate: function(context, root, resultType, result) {
    var axis   = this.selector.axis,
        test   = this.selector.test,
        levels = [[]];

    Pathology.Axis.fromAST(axis).walk(context, function(node) {
      if (!test || !test.evaluate) return result.push(node);
      test.evaluate(node, this.predicates, root, resultType, levels, result);
    }, this);
  }
};


Pathology.XPathParser.NodeTest = {
  evaluate: function(context, predicates, root, resultType, levels, result) {
    var name    = this.elements[0].condition_name,
        tagName = tagName = this.elements[0].textValue.toLowerCase();

    var first = {
      expression: {
        evaluate: function() {
          if (name && name.textValue === 'node') {
            return true;
          } else if (name && name.textValue === 'text') {
            if (context.nodeType !== XPathResult.BOOLEAN_TYPE) return false;
          } else {
            if (tagName === '*') {
              if (context.nodeType !== 1) return false;
            } else {
              if (!context.nodeName) return false;
              if (context.nodeName.toLowerCase() !== tagName) return false;
            }
          }
          return true;
        }
      },
      subscript: this.subscript
    };

    predicates = [first].concat(predicates.elements);
    var accepted, predicate;

    for (var i = 0, n = predicates.length; i < n; i++) {
      levels[i] = levels[i] || [];
      predicate = predicates[i];

      accepted = Pathology.atomize(predicate.expression, context, root);
      if (typeof accepted === 'string') accepted = true;
      if (!accepted) return;

      levels[i].push(context);

      if (predicate.subscript.integer) {
        if (predicate.subscript.integer.evaluate() !== levels[i].length) return;
      }
    }

    result.push(context);
  }
};


Pathology.XPathParser.Or = {
  evaluate: function(context, root) {
    return Pathology.atomize(this.left, context, root) ||
           Pathology.atomize(this.right, context, root);
  }
};


Pathology.XPathParser.Integer = {
  evaluate: function(context, root) {
    return parseInt(this.textValue, 10);
  }
};


Pathology.XPathParser.String = {
  evaluate: function(context, root) {
    return eval(this.textValue);
  }
};


Pathology.XPathParser.Union = {
  evaluate: function(context, root, resultType, result) {
    result = result || new Pathology.XPathResult(XPathResult.ANY_TYPE);
    resultType = resultType || XPathResult.ANY_TYPE;

    this.head.evaluate(context, root, resultType, result);

    var sections = this.rest.elements;
    for (var i = 0, n = sections.length; i < n; i++)
      sections[i].location_path.evaluate(context, root, resultType, result);

    return result;
  }
};



(function(){
	var extend = function( d, s ) {
		var p;
		for (p in s) {
			d[p] = s[p];
		}
		return d;
	},
		// only uses browser detection for key events
		browser = {
			msie: !! (window.attachEvent && !window.opera),
			opera: !! window.opera,
			webkit: navigator.userAgent.indexOf('AppleWebKit/') > -1,
			safari: navigator.userAgent.indexOf('AppleWebKit/') > -1 && navigator.userAgent.indexOf('Chrome/') === -1,
			gecko: navigator.userAgent.indexOf('Gecko') > -1,
			mobilesafari: !! navigator.userAgent.match(/Apple.*Mobile.*Safari/),
			rhino: navigator.userAgent.match(/Rhino/) && true
		},
		createEventObject = function( type, options, element ) {
			var event = element.ownerDocument.createEventObject();
			return extend(event, options);
		},
		data = {},
		id = 1,
		expando = "_synthetic" + new Date().getTime(),
		bind, unbind, key = /keypress|keyup|keydown/,
		page = /load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll/,
		//this is maintained so we can click on html and blur the active element
		activeElement,

		/**
		 * @class Syn
		 * @download funcunit/dist/syn.js
		 * @test funcunit/synthetic/qunit.html
		 * Syn is used to simulate user actions.  It creates synthetic events and
		 * performs their default behaviors.
		 * 
		 * <h2>Basic Use</h2>
		 * The following clicks an input element with <code>id='description'</code>
		 * and then types <code>'Hello World'</code>.
		 * 
		 @codestart
		 Syn.click({},'description')
		 .type("Hello World")
		 @codeend
		 * <h2>User Actions and Events</h2>
		 * <p>Syn is typically used to simulate user actions as opposed to triggering events. Typing characters
		 * is an example of a user action.  The keypress that represents an <code>'a'</code>
		 * character being typed is an example of an event. 
		 * </p>
		 * <p>
		 *   While triggering events is supported, it's much more useful to simulate actual user behavior.  The 
		 *   following actions are supported by Syn:
		 * </p>
		 * <ul>
		 *   <li><code>[Syn.prototype.click click]</code> - a mousedown, focus, mouseup, and click.</li>
		 *   <li><code>[Syn.prototype.dblclick dblclick]</code> - two <code>click!</code> events followed by a <code>dblclick</code>.</li>
		 *   <li><code>[Syn.prototype.key key]</code> - types a single character (keydown, keypress, keyup).</li>
		 *   <li><code>[Syn.prototype.type type]</code> - types multiple characters into an element.</li>
		 *   <li><code>[Syn.prototype.move move]</code> - moves the mouse from one position to another (triggering mouseover / mouseouts).</li>
		 *   <li><code>[Syn.prototype.drag drag]</code> - a mousedown, followed by mousemoves, and a mouseup.</li>
		 * </ul>
		 * All actions run asynchronously.  
		 * Click on the links above for more 
		 * information on how to use the specific action.
		 * <h2>Asynchronous Callbacks</h2>
		 * Actions don't complete immediately. This is almost 
		 * entirely because <code>focus()</code> 
		 * doesn't run immediately in IE.
		 * If you provide a callback function to Syn, it will 
		 * be called after the action is completed.
		 * <br/>The following checks that "Hello World" was entered correctly: 
		 @codestart
		 Syn.click({},'description')
		 .type("Hello World", function(){
		 
		 ok("Hello World" == document.getElementById('description').value)  
		 })
		 @codeend
		 <h2>Asynchronous Chaining</h2>
		 <p>You might have noticed the [Syn.prototype.then then] method.  It provides chaining
		 so you can do a sequence of events with a single (final) callback.
		 </p><p>
		 If an element isn't provided to then, it uses the previous Syn's element.
		 </p>
		 The following does a lot of stuff before checking the result:
		 @codestart
		 Syn.type('ice water','title')
		 .type('ice and water','description')
		 .click({},'create')
		 .drag({to: 'favorites'},'newRecipe',
		 function(){
		 ok($('#newRecipe').parents('#favorites').length);
		 })
		 @codeend
		 
		 <h2>jQuery Helper</h2>
		 If jQuery is present, Syn adds a triggerSyn helper you can use like:
		 @codestart
		 $("#description").triggerSyn("type","Hello World");
		 @codeend
		 * <h2>Key Event Recording</h2>
		 * <p>Every browser has very different rules for dispatching key events.  
		 * As there is no way to feature detect how a browser handles key events,
		 * synthetic uses a description of how the browser behaves generated
		 * by a recording application.  </p>
		 * <p>
		 * If you want to support a browser not currently supported, you can
		 * record that browser's key event description and add it to
		 * <code>Syn.key.browsers</code> by it's navigator agent.
		 * </p>
		 @codestart
		 Syn.key.browsers["Envjs\ Resig/20070309 PilotFish/1.2.0.10\1.6"] = {
		 'prevent':
		 {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
		 'character':
		 { ... }
		 }
		 @codeend
		 * <h2>Limitations</h2>
		 * Syn fully supports IE 6+, FF 3+, Chrome, Safari, Opera 10+.
		 * With FF 1+, drag / move events are only partially supported. They will
		 * not trigger mouseover / mouseout events.<br/>
		 * Safari crashes when a mousedown is triggered on a select.  Syn will not 
		 * create this event.
		 * <h2>Contributing to Syn</h2>
		 * Have we missed something? We happily accept patches.  The following are 
		 * important objects and properties of Syn:
		 * <ul>
		 * 	<li><code>Syn.create</code> - contains methods to setup, convert options, and create an event of a specific type.</li>
		 *  <li><code>Syn.defaults</code> - default behavior by event type (except for keys).</li>
		 *  <li><code>Syn.key.defaults</code> - default behavior by key.</li>
		 *  <li><code>Syn.keycodes</code> - supported keys you can type.</li>
		 * </ul>
		 * <h2>Roll Your Own Functional Test Framework</h2>
		 * <p>Syn is really the foundation of JavaScriptMVC's functional testing framework - [FuncUnit].
		 *   But, we've purposely made Syn work without any dependencies in the hopes that other frameworks or 
		 *   testing solutions can use it as well.
		 * </p>
		 * @constructor 
		 * Creates a synthetic event on the element.
		 * @param {Object} type
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 * @return Syn
		 */
		Syn = function( type, options, element, callback ) {
			return (new Syn.init(type, options, element, callback));
		};

	bind = function( el, ev, f ) {
		return el.addEventListener ? el.addEventListener(ev, f, false) : el.attachEvent("on" + ev, f);
	};
	unbind = function( el, ev, f ) {
		return el.addEventListener ? el.removeEventListener(ev, f, false) : el.detachEvent("on" + ev, f);
	};

	/**
	 * @Static
	 */
	extend(Syn, {
		/**
		 * Creates a new synthetic event instance
		 * @hide
		 * @param {Object} type
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		init: function( type, options, element, callback ) {
			var args = Syn.args(options, element, callback),
				self = this;
			this.queue = [];
			this.element = args.element;

			//run event
			if ( typeof this[type] === "function" ) {
				this[type](args.options, args.element, function( defaults, el ) {
					args.callback && args.callback.apply(self, arguments);
					self.done.apply(self, arguments);
				});
			} else {
				this.result = Syn.trigger(type, args.options, args.element);
				args.callback && args.callback.call(this, args.element, this.result);
			}
		},
		jquery: function( el, fast ) {
			if ( window.FuncUnit && window.FuncUnit.jQuery ) {
				return window.FuncUnit.jQuery;
			}
			if ( el ) {
				return Syn.helpers.getWindow(el).jQuery || window.jQuery;
			}
			else {
				return window.jQuery;
			}
		},
		/**
		 * Returns an object with the args for a Syn.
		 * @hide
		 * @return {Object}
		 */
		args: function() {
			var res = {},
				i = 0;
			for ( ; i < arguments.length; i++ ) {
				if ( typeof arguments[i] === 'function' ) {
					res.callback = arguments[i];
				} else if ( arguments[i] && arguments[i].jquery ) {
					res.element = arguments[i][0];
				} else if ( arguments[i] && arguments[i].nodeName ) {
					res.element = arguments[i];
				} else if ( res.options && typeof arguments[i] === 'string' ) { //we can get by id
					res.element = document.getElementById(arguments[i]);
				}
				else if ( arguments[i] ) {
					res.options = arguments[i];
				}
			}
			return res;
		},
		click: function( options, element, callback ) {
			Syn('click!', options, element, callback);
		},
		/**
		 * @attribute defaults
		 * Default actions for events.  Each default function is called with this as its 
		 * element.  It should return true if a timeout 
		 * should happen after it.  If it returns an element, a timeout will happen
		 * and the next event will happen on that element.
		 */
		defaults: {
			focus: function() {
				if (!Syn.support.focusChanges ) {
					var element = this,
						nodeName = element.nodeName.toLowerCase();
					Syn.data(element, "syntheticvalue", element.value);

					//TODO, this should be textarea too
					//and this might be for only text style inputs ... hmmmmm ....
					if ( nodeName === "input" || nodeName === "textarea" ) {
						bind(element, "blur", function() {
							if ( Syn.data(element, "syntheticvalue") != element.value ) {

								Syn.trigger("change", {}, element);
							}
							unbind(element, "blur", arguments.callee);
						});

					}
				}
			},
			submit: function() {
				Syn.onParents(this, function( el ) {
					if ( el.nodeName.toLowerCase() === 'form' ) {
						el.submit();
						return false;
					}
				});
			}
		},
		changeOnBlur: function( element, prop, value ) {

			bind(element, "blur", function() {
				if ( value !== element[prop] ) {
					Syn.trigger("change", {}, element);
				}
				unbind(element, "blur", arguments.callee);
			});

		},
		/**
		 * Returns the closest element of a particular type.
		 * @hide
		 * @param {Object} el
		 * @param {Object} type
		 */
		closest: function( el, type ) {
			while ( el && el.nodeName.toLowerCase() !== type.toLowerCase() ) {
				el = el.parentNode;
			}
			return el;
		},
		/**
		 * adds jQuery like data (adds an expando) and data exists FOREVER :)
		 * @hide
		 * @param {Object} el
		 * @param {Object} key
		 * @param {Object} value
		 */
		data: function( el, key, value ) {
			var d;
			if (!el[expando] ) {
				el[expando] = id++;
			}
			if (!data[el[expando]] ) {
				data[el[expando]] = {};
			}
			d = data[el[expando]];
			if ( value ) {
				data[el[expando]][key] = value;
			} else {
				return data[el[expando]][key];
			}
		},
		/**
		 * Calls a function on the element and all parents of the element until the function returns
		 * false.
		 * @hide
		 * @param {Object} el
		 * @param {Object} func
		 */
		onParents: function( el, func ) {
			var res;
			while ( el && res !== false ) {
				res = func(el);
				el = el.parentNode;
			}
			return el;
		},
		//regex to match focusable elements
		focusable: /^(a|area|frame|iframe|label|input|select|textarea|button|html|object)$/i,
		/**
		 * Returns if an element is focusable
		 * @hide
		 * @param {Object} elem
		 */
		isFocusable: function( elem ) {
			var attributeNode;
			return (this.focusable.test(elem.nodeName) || 
				((attributeNode = elem.getAttributeNode("tabIndex")) 
				&& attributeNode.specified)) && Syn.isVisible(elem);
		},
		/**
		 * Returns if an element is visible or not
		 * @hide
		 * @param {Object} elem
		 */
		isVisible: function( elem ) {
			return (elem.offsetWidth && elem.offsetHeight) || (elem.clientWidth && elem.clientHeight);
		},
		/**
		 * Gets the tabIndex as a number or null
		 * @hide
		 * @param {Object} elem
		 */
		tabIndex: function( elem ) {
			var attributeNode = elem.getAttributeNode("tabIndex");
			return attributeNode && attributeNode.specified && (parseInt(elem.getAttribute('tabIndex')) || 0);
		},
		bind: bind,
		unbind: unbind,
		browser: browser,
		//some generic helpers
		helpers: {
			createEventObject: createEventObject,
			createBasicStandardEvent: function( type, defaults, doc ) {
				var event;
				try {
					event = doc.createEvent("Events");
				} catch (e2) {
					event = doc.createEvent("UIEvents");
				} finally {
					event.initEvent(type, true, true);
					extend(event, defaults);
				}
				return event;
			},
			inArray: function( item, array ) {
				var i =0;
				for ( ; i < array.length; i++ ) {
					if ( array[i] === item ) {
						return i;
					}
				}
				return -1;
			},
			getWindow: function( element ) {
				return element.ownerDocument.defaultView || element.ownerDocument.parentWindow;
			},
			extend: extend,
			scrollOffset: function( win , set) {
				var doc = win.document.documentElement,
					body = win.document.body;
				if(set){
					window.scrollTo(set.left, set.top);
					
				} else { 
					return {
						left: (doc && doc.scrollLeft || body && body.scrollLeft || 0) + (doc.clientLeft || 0),
						top: (doc && doc.scrollTop || body && body.scrollTop || 0) + (doc.clientTop || 0)
					};
				}
				
			},
			scrollDimensions: function(win){
				var doc = win.document.documentElement,
					body = win.document.body,
					docWidth = doc.clientWidth,
					docHeight = doc.clientHeight,
					compat = win.document.compatMode === "CSS1Compat";
				
				return {
					height: compat && docHeight ||
						body.clientHeight || docHeight,
					width: compat && docWidth ||
						body.clientWidth || docWidth
				};
			},
			addOffset: function( options, el ) {
				var jq = Syn.jquery(el),
					off;
				if ( typeof options === 'object' && options.clientX === undefined && options.clientY === undefined && options.pageX === undefined && options.pageY === undefined && jq ) {
					el = jq(el);
					off = el.offset();
					options.pageX = off.left + el.width() / 2;
					options.pageY = off.top + el.height() / 2;
				}
			}
		},
		// place for key data
		key: {
			ctrlKey: null,
			altKey: null,
			shiftKey: null,
			metaKey: null
		},
		//triggers an event on an element, returns true if default events should be run
		/**
		 * Dispatches an event and returns true if default events should be run.
		 * @hide
		 * @param {Object} event
		 * @param {Object} element
		 * @param {Object} type
		 * @param {Object} autoPrevent
		 */
		dispatch: function( event, element, type, autoPrevent ) {

			// dispatchEvent doesn't always work in IE (mostly in a popup)
			if ( element.dispatchEvent && event ) {
				var preventDefault = event.preventDefault,
					prevents = autoPrevent ? -1 : 0;

				//automatically prevents the default behavior for this event
				//this is to protect agianst nasty browser freezing bug in safari
				if ( autoPrevent ) {
					bind(element, type, function( ev ) {
						ev.preventDefault();
						unbind(this, type, arguments.callee);
					});
				}


				event.preventDefault = function() {
					prevents++;
					if (++prevents > 0 ) {
						preventDefault.apply(this, []);
					}
				};
				element.dispatchEvent(event);
				return prevents <= 0;
			} else {
				try {
					window.event = event;
				} catch (e) {}
				//source element makes sure element is still in the document
				return element.sourceIndex <= 0 || (element.fireEvent && element.fireEvent('on' + type, event));
			}
		},
		/**
		 * @attribute
		 * @hide
		 * An object of eventType -> function that create that event.
		 */
		create: {
			//-------- PAGE EVENTS ---------------------
			page: {
				event: function( type, options, element ) {
					var doc = Syn.helpers.getWindow(element).document || document,
						event;
					if ( doc.createEvent ) {
						event = doc.createEvent("Events");

						event.initEvent(type, true, true);
						return event;
					}
					else {
						try {
							event = createEventObject(type, options, element);
						}
						catch (e) {}
						return event;
					}
				}
			},
			// unique events
			focus: {
				event: function( type, options, element ) {
					Syn.onParents(element, function( el ) {
						if ( Syn.isFocusable(el) ) {
							if ( el.nodeName.toLowerCase() !== 'html' ) {
								el.focus();
								activeElement = el;
							}
							else if ( activeElement ) {
								// TODO: The HTML element isn't focasable in IE, but it is
								// in FF.  We should detect this and do a true focus instead
								// of just a blur
								var doc = Syn.helpers.getWindow(element).document;
								if ( doc !== window.document ) {
									return false;
								} else if ( doc.activeElement ) {
									doc.activeElement.blur();
									activeElement = null;
								} else {
									activeElement.blur();
									activeElement = null;
								}


							}
							return false;
						}
					});
					return true;
				}
			}
		},
		/**
		 * @attribute support
		 * 
		 * Feature detected properties of a browser's event system.
		 * Support has the following properties:
		 * 
		 *   - `backspaceWorks` - typing a backspace removes a character
		 *   - `clickChanges` - clicking on an option element creates a change event.
		 *   - `clickSubmits` - clicking on a form button submits the form.
		 *   - `focusChanges` - focus/blur creates a change event.
		 *   - `keypressOnAnchorClicks` - Keying enter on an anchor triggers a click.
		 *   - `keypressSubmits` - enter key submits
		 *   - `keyCharacters` - typing a character shows up
		 *   - `keysOnNotFocused` - enters keys when not focused.
		 *   - `linkHrefJS` - An achor's href JavaScript is run.
		 *   - `mouseDownUpClicks` - A mousedown followed by mouseup creates a click event.
		 *   - `mouseupSubmits` - a mouseup on a form button submits the form.
		 *   - `radioClickChanges` - clicking a radio button changes the radio.
		 *   - `tabKeyTabs` - A tab key changes tabs.
		 *   - `textareaCarriage` - a new line in a textarea creates a carriage return.
		 *   
		 * 
		 */
		support: {
			clickChanges: false,
			clickSubmits: false,
			keypressSubmits: false,
			mouseupSubmits: false,
			radioClickChanges: false,
			focusChanges: false,
			linkHrefJS: false,
			keyCharacters: false,
			backspaceWorks: false,
			mouseDownUpClicks: false,
			tabKeyTabs: false,
			keypressOnAnchorClicks: false,
			optionClickBubbles: false,
			ready: 0
		},
		/**
		 * Creates a synthetic event and dispatches it on the element.  
		 * This will run any default actions for the element.
		 * Typically you want to use Syn, but if you want the return value, use this.
		 * @param {String} type
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @return {Boolean} true if default events were run, false if otherwise.
		 */
		trigger: function( type, options, element ) {
			options || (options = {});

			var create = Syn.create,
				setup = create[type] && create[type].setup,
				kind = key.test(type) ? 'key' : (page.test(type) ? "page" : "mouse"),
				createType = create[type] || {},
				createKind = create[kind],
				event, ret, autoPrevent, dispatchEl = element;

			//any setup code?
			Syn.support.ready === 2 && setup && setup(type, options, element);

			autoPrevent = options._autoPrevent;
			//get kind
			delete options._autoPrevent;

			if ( createType.event ) {
				ret = createType.event(type, options, element);
			} else {
				//convert options
				options = createKind.options ? createKind.options(type, options, element) : options;

				if (!Syn.support.changeBubbles && /option/i.test(element.nodeName) ) {
					dispatchEl = element.parentNode; //jQuery expects clicks on select
				}

				//create the event
				event = createKind.event(type, options, dispatchEl);

				//send the event
				ret = Syn.dispatch(event, dispatchEl, type, autoPrevent);
			}

			//run default behavior
			ret && Syn.support.ready === 2 && Syn.defaults[type] && Syn.defaults[type].call(element, options, autoPrevent);
			return ret;
		},
		eventSupported: function( eventName ) {
			var el = document.createElement("div");
			eventName = "on" + eventName;

			var isSupported = (eventName in el);
			if (!isSupported ) {
				el.setAttribute(eventName, "return;");
				isSupported = typeof el[eventName] === "function";
			}
			el = null;

			return isSupported;
		}

	});
	/**
	 * @Prototype
	 */
	extend(Syn.init.prototype, {
		/**
		 * @function then
		 * <p>
		 * Then is used to chain a sequence of actions to be run one after the other.
		 * This is useful when many asynchronous actions need to be performed before some
		 * final check needs to be made.
		 * </p>
		 * <p>The following clicks and types into the <code>id='age'</code> element and then checks that only numeric characters can be entered.</p>
		 * <h3>Example</h3>
		 * @codestart
		 * Syn('click',{},'age')
		 *   .then('type','I am 12',function(){
		 *   equals($('#age').val(),"12")  
		 * })
		 * @codeend
		 * If the element argument is undefined, then the last element is used.
		 * 
		 * @param {String} type The type of event or action to create: "_click", "_dblclick", "_drag", "_type".
		 * @param {Object} options Optiosn to pass to the event.
		 * @param {String|HTMLElement} [element] A element's id or an element.  If undefined, defaults to the previous element.
		 * @param {Function} [callback] A function to callback after the action has run, but before any future chained actions are run.
		 */
		then: function( type, options, element, callback ) {
			if ( Syn.autoDelay ) {
				this.delay();
			}
			var args = Syn.args(options, element, callback),
				self = this;


			//if stack is empty run right away
			//otherwise ... unshift it
			this.queue.unshift(function( el, prevented ) {

				if ( typeof this[type] === "function" ) {
					this.element = args.element || el;
					this[type](args.options, this.element, function( defaults, el ) {
						args.callback && args.callback.apply(self, arguments);
						self.done.apply(self, arguments);
					});
				} else {
					this.result = Syn.trigger(type, args.options, args.element);
					args.callback && args.callback.call(this, args.element, this.result);
					return this;
				}
			})
			return this;
		},
		/**
		 * Delays the next command a set timeout.
		 * @param {Number} [timeout]
		 * @param {Function} [callback]
		 */
		delay: function( timeout, callback ) {
			if ( typeof timeout === 'function' ) {
				callback = timeout;
				timeout = null;
			}
			timeout = timeout || 600;
			var self = this;
			this.queue.unshift(function() {
				setTimeout(function() {
					callback && callback.apply(self, [])
					self.done.apply(self, arguments);
				}, timeout);
			});
			return this;
		},
		done: function( defaults, el ) {
			el && (this.element = el);
			if ( this.queue.length ) {
				this.queue.pop().call(this, this.element, defaults);
			}

		},
		/**
		 * @function click
		 * Clicks an element by triggering a mousedown, 
		 * mouseup, 
		 * and a click event.
		 * <h3>Example</h3>
		 * @codestart
		 * Syn.click({},'create',function(){
		 *   //check something
		 * })
		 * @codeend
		 * You can also provide the coordinates of the click.  
		 * If jQuery is present, it will set clientX and clientY
		 * for you.  Here's how to set it yourself:
		 * @codestart
		 * Syn.click(
		 *     {clientX: 20, clientY: 100},
		 *     'create',
		 *     function(){
		 *       //check something
		 *     })
		 * @codeend
		 * You can also provide pageX and pageY and Syn will convert it for you.
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @param {Function} callback
		 */
		"_click": function( options, element, callback, force ) {
			Syn.helpers.addOffset(options, element);
			Syn.trigger("mousedown", options, element);

			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function() {
				Syn.trigger("mouseup", options, element);
				if (!Syn.support.mouseDownUpClicks || force ) {
					Syn.trigger("click", options, element);
					callback(true);
				} else {
					//we still have to run the default (presumably)
					Syn.create.click.setup('click', options, element);
					Syn.defaults.click.call(element);
					//must give time for callback
					setTimeout(function() {
						callback(true);
					}, 1);
				}

			}, 1);
		},
		/**
		 * Right clicks in browsers that support it (everyone but opera).
		 * @param {Object} options
		 * @param {Object} element
		 * @param {Object} callback
		 */
		"_rightClick": function( options, element, callback ) {
			Syn.helpers.addOffset(options, element);
			var mouseopts = extend(extend({}, Syn.mouse.browser.right.mouseup), options);

			Syn.trigger("mousedown", mouseopts, element);

			//timeout is b/c IE is stupid and won't call focus handlers
			setTimeout(function() {
				Syn.trigger("mouseup", mouseopts, element);
				if ( Syn.mouse.browser.right.contextmenu ) {
					Syn.trigger("contextmenu", extend(extend({}, Syn.mouse.browser.right.contextmenu), options), element);
				}
				callback(true);
			}, 1);
		},
		/**
		 * @function dblclick
		 * Dblclicks an element.  This runs two [Syn.prototype.click click] events followed by
		 * a dblclick on the element.
		 * <h3>Example</h3>
		 * @codestart
		 * Syn.dblclick({},'open')
		 * @codeend
		 * @param {Object} options
		 * @param {HTMLElement} element
		 * @param {Function} callback
		 */
		"_dblclick": function( options, element, callback ) {
			Syn.helpers.addOffset(options, element);
			var self = this;
			this._click(options, element, function() {
				setTimeout(function() {
					self._click(options, element, function() {
						Syn.trigger("dblclick", options, element);
						callback(true);
					}, true);
				}, 2);

			});
		}
	});

	var actions = ["click", "dblclick", "move", "drag", "key", "type", 'rightClick'],
		makeAction = function( name ) {
			Syn[name] = function( options, element, callback ) {
				return Syn("_" + name, options, element, callback);
			};
			Syn.init.prototype[name] = function( options, element, callback ) {
				return this.then("_" + name, options, element, callback);
			};
		},
		i = 0;

	for ( ; i < actions.length; i++ ) {
		makeAction(actions[i]);
	}
	/**
	 * Used for creating and dispatching synthetic events.
	 * @codestart
	 * new MVC.Syn('click').send(MVC.$E('id'))
	 * @codeend
	 * @constructor Sets up a synthetic event.
	 * @param {String} type type of event, ex: 'click'
	 * @param {optional:Object} options
	 */
	if ( (window.FuncUnit && window.FuncUnit.jQuery) || window.jQuery ) {
		((window.FuncUnit && window.FuncUnit.jQuery) || window.jQuery).fn.triggerSyn = function( type, options, callback ) {
			if(!this[0]){
				throw "Can't "+type.substring(1)+" because no element matching '"+this.selector+"' was found"
			}
			Syn(type, options, this[0], callback);
			return this;
		};
	}

	window.Syn = Syn;
})();


(function() {
//handles mosue events

	var h = Syn.helpers,
		getWin = h.getWindow;

	Syn.mouse = {};
	h.extend(Syn.defaults, {
		mousedown: function( options ) {
			Syn.trigger("focus", {}, this)
		},
		click: function() {
			// prevents the access denied issue in IE if the click causes the element to be destroyed
			var element = this;
			try {
				element.nodeType;
			} catch (e) {
				return;
			}
			//get old values
			var href, radioChanged = Syn.data(element, "radioChanged"),
				scope = getWin(element),
				nodeName = element.nodeName.toLowerCase();
			
			//this code was for restoring the href attribute to prevent popup opening
			//if ((href = Syn.data(element, "href"))) {
			//	element.setAttribute('href', href)
			//}

			//run href javascript
			if (!Syn.support.linkHrefJS && /^\s*javascript:/.test(element.href) ) {
				//eval js
				var code = element.href.replace(/^\s*javascript:/, "")

				//try{
				if ( code != "//" && code.indexOf("void(0)") == -1 ) {
					if ( window.selenium ) {
						eval("with(selenium.browserbot.getCurrentWindow()){" + code + "}")
					} else {
						eval("with(scope){" + code + "}")
					}
				}
			}

			//submit a form
			if (!(Syn.support.clickSubmits) && (nodeName == "input" && element.type == "submit") || nodeName == 'button' ) {

				var form = Syn.closest(element, "form");
				if ( form ) {
					Syn.trigger("submit", {}, form)
				}

			}
			//follow a link, probably needs to check if in an a.
			if ( nodeName == "a" && element.href && !/^\s*javascript:/.test(element.href) ) {

				scope.location.href = element.href;

			}

			//change a checkbox
			if ( nodeName == "input" && element.type == "checkbox" ) {

				//if(!Syn.support.clickChecks && !Syn.support.changeChecks){
				//	element.checked = !element.checked;
				//}
				if (!Syn.support.clickChanges ) {
					Syn.trigger("change", {}, element);
				}
			}

			//change a radio button
			if ( nodeName == "input" && element.type == "radio" ) { // need to uncheck others if not checked
				if ( radioChanged && !Syn.support.radioClickChanges ) {
					Syn.trigger("change", {}, element);
				}
			}
			// change options
			if ( nodeName == "option" && Syn.data(element, "createChange") ) {
				Syn.trigger("change", {}, element.parentNode); //does not bubble
				Syn.data(element, "createChange", false)
			}
		}
	})

	//add create and setup behavior for mosue events
	h.extend(Syn.create, {
		mouse: {
			options: function( type, options, element ) {
				var doc = document.documentElement,
					body = document.body,
					center = [options.pageX || 0, options.pageY || 0],
					//browser might not be loaded yet (doing support code)
					left = Syn.mouse.browser && Syn.mouse.browser.left[type],
					right = Syn.mouse.browser && Syn.mouse.browser.right[type];
				return h.extend({
					bubbles: true,
					cancelable: true,
					view: window,
					detail: 1,
					screenX: 1,
					screenY: 1,
					clientX: options.clientX || center[0] - (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc.clientLeft || 0),
					clientY: options.clientY || center[1] - (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc.clientTop || 0),
					ctrlKey: !! Syn.key.ctrlKey,
					altKey: !! Syn.key.altKey,
					shiftKey: !! Syn.key.shiftKey,
					metaKey: !! Syn.key.metaKey,
					button: left && left.button != null ? left.button : right && right.button || (type == 'contextmenu' ? 2 : 0),
					relatedTarget: document.documentElement
				}, options);
			},
			event: function( type, defaults, element ) { //Everyone Else
				var doc = getWin(element).document || document
				if ( doc.createEvent ) {
					var event;

					try {
						event = doc.createEvent('MouseEvents');
						event.initMouseEvent(type, defaults.bubbles, defaults.cancelable, defaults.view, defaults.detail, defaults.screenX, defaults.screenY, defaults.clientX, defaults.clientY, defaults.ctrlKey, defaults.altKey, defaults.shiftKey, defaults.metaKey, defaults.button, defaults.relatedTarget);
					} catch (e) {
						event = h.createBasicStandardEvent(type, defaults, doc)
					}
					event.synthetic = true;
					return event;
				} else {
					var event;
					try {
						event = h.createEventObject(type, defaults, element)
					}
					catch (e) {}

					return event;
				}

			}
		},
		click: {
			setup: function( type, options, element ) {
				var nodeName = element.nodeName.toLowerCase(),
					type;

				//we need to manually 'check' in browser that can't check
				//so checked has the right value
				if (!Syn.support.clickChecks && !Syn.support.changeChecks && nodeName === "input" ) {
					type = element.type.toLowerCase(); //pretty sure lowercase isn't needed
					if ( type === 'checkbox' ) {
						element.checked = !element.checked;
					}
					if ( type === "radio" ) {
						//do the checks manually 
						if (!element.checked ) { //do nothing, no change
							try {
								Syn.data(element, "radioChanged", true);
							} catch (e) {}
							element.checked = true;
						}
					}
				}

				if ( nodeName == "a" && element.href && !/^\s*javascript:/.test(element.href) ) {

					//save href
					Syn.data(element, "href", element.href)

					//remove b/c safari/opera will open a new tab instead of changing the page
					// this has been removed because newer versions don't have this problem
					//element.setAttribute('href', 'javascript://')
					//however this breaks scripts using the href
					//we need to listen to this and prevent the default behavior
					//and run the default behavior ourselves. Boo!
				}
				//if select or option, save old value and mark to change
				if (/option/i.test(element.nodeName) ) {
					var child = element.parentNode.firstChild,
						i = -1;
					while ( child ) {
						if ( child.nodeType == 1 ) {
							i++;
							if ( child == element ) break;
						}
						child = child.nextSibling;
					}
					if ( i !== element.parentNode.selectedIndex ) {
						//shouldn't this wait on triggering
						//change?
						element.parentNode.selectedIndex = i;
						Syn.data(element, "createChange", true)
					}
				}

			}
		},
		mousedown: {
			setup: function( type, options, element ) {
				var nn = element.nodeName.toLowerCase();
				//we have to auto prevent default to prevent freezing error in safari
				if ( Syn.browser.safari && (nn == "select" || nn == "option") ) {
					options._autoPrevent = true;
				}
			}
		}
	});
	//do support code
	(function() {
		if (!document.body ) {
			setTimeout(arguments.callee, 1)
			return;
		}
		var oldSynth = window.__synthTest;
		window.__synthTest = function() {
			Syn.support.linkHrefJS = true;
		}
		var div = document.createElement("div"),
			checkbox, submit, form, input, select;

		div.innerHTML = "<form id='outer'>" + "<input name='checkbox' type='checkbox'/>" + "<input name='radio' type='radio' />" + "<input type='submit' name='submitter'/>" + "<input type='input' name='inputter'/>" + "<input name='one'>" + "<input name='two'/>" + "<a href='javascript:__synthTest()' id='synlink'></a>" + "<select><option></option></select>" + "</form>";
		document.documentElement.appendChild(div);
		form = div.firstChild
		checkbox = form.childNodes[0];
		submit = form.childNodes[2];
		select = form.getElementsByTagName('select')[0]

		checkbox.checked = false;
		checkbox.onchange = function() {
			Syn.support.clickChanges = true;
		}

		Syn.trigger("click", {}, checkbox)
		Syn.support.clickChecks = checkbox.checked;

		checkbox.checked = false;

		Syn.trigger("change", {}, checkbox);

		Syn.support.changeChecks = checkbox.checked;

		form.onsubmit = function( ev ) {
			if ( ev.preventDefault ) ev.preventDefault();
			Syn.support.clickSubmits = true;
			return false;
		}
		Syn.trigger("click", {}, submit)



		form.childNodes[1].onchange = function() {
			Syn.support.radioClickChanges = true;
		}
		Syn.trigger("click", {}, form.childNodes[1])


		Syn.bind(div, 'click', function() {
			Syn.support.optionClickBubbles = true;
			Syn.unbind(div, 'click', arguments.callee)
		})
		Syn.trigger("click", {}, select.firstChild)


		Syn.support.changeBubbles = Syn.eventSupported('change');

		//test if mousedown followed by mouseup causes click (opera), make sure there are no clicks after this
		var clicksCount = 0
		div.onclick = function() {
			Syn.support.mouseDownUpClicks = true;
			//we should use this to check for opera potentially, but would
			//be difficult to remove element correctly
			//Syn.support.mouseDownUpRepeatClicks = (2 == (++clicksCount))
		}
		Syn.trigger("mousedown", {}, div)
		Syn.trigger("mouseup", {}, div)

		//setTimeout(function(){
		//	Syn.trigger("mousedown",{},div)
		//	Syn.trigger("mouseup",{},div)
		//},1)

		document.documentElement.removeChild(div);

		//check stuff
		window.__synthTest = oldSynth;
		Syn.support.ready++;
	})();
})();


(function() {
	Syn.key.browsers = {
		webkit : {
			'prevent':
			 {"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char","char"],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'navigation':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'tab':
			 {"keydown":[0,"char"],"keyup":[0,"char"]},
			'pause-break':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":["char","key"],"keyup":[0,"key"]}
		},
		gecko : {
			'prevent':
			 {"keyup":[],"keydown":["char"],"keypress":["char"]},
			'character':
			 {"keydown":[0,"key"],"keypress":["char",0],"keyup":[0,"key"]},
			'specialChars':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'navigation':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'special':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\t':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'pause-break':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'caps':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'escape':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]},
			'num-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'scroll-lock':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'print':
			 {"keyup":[0,"key"]},
			'function':
			 {"keydown":[0,"key"],"keyup":[0,"key"]},
			'\r':
			 {"keydown":[0,"key"],"keypress":[0,"key"],"keyup":[0,"key"]}
		},
		msie : {
			'prevent':{"keyup":[],"keydown":["char","keypress"],"keypress":["char"]},
			'character':{"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'navigation':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'special':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'tab':{"keydown":[null,"char"],"keyup":[null,"char"]},
			'pause-break':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'caps':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'num-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'scroll-lock':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'print':{"keyup":[null,"key"]},
			'function':{"keydown":[null,"key"],"keyup":[null,"key"]},
			'\r':{"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		},
		opera : {
			'prevent':
			 {"keyup":[],"keydown":[],"keypress":["char"]},
			'character':
			 {"keydown":[null,"key"],"keypress":[null,"char"],"keyup":[null,"key"]},
			'specialChars':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'navigation':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'special':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'tab':
			 {"keydown":[null,"char"],"keypress":[null,"char"],"keyup":[null,"char"]},
			'pause-break':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'caps':
			 {"keydown":[null,"key"],"keyup":[null,"key"]},
			'escape':
			 {"keydown":[null,"key"],"keypress":[null,"key"]},
			'num-lock':
			 {"keyup":[null,"key"],"keydown":[null,"key"],"keypress":[null,"key"]},
			'scroll-lock':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'print':
			 {},
			'function':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]},
			'\r':
			 {"keydown":[null,"key"],"keypress":[null,"key"],"keyup":[null,"key"]}	
		}
	};
	
	Syn.mouse.browsers = {
		webkit : {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
		          "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		opera: {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3}},
		        "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		msie: {	"right":{"mousedown":{"button":2},"mouseup":{"button":2},"contextmenu":{"button":0}},
				"left":{"mousedown":{"button":1},"mouseup":{"button":1},"click":{"button":0}}},
		chrome : {"right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}},
				  "left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}}},
		gecko: {"left":{"mousedown":{"button":0,"which":1},"mouseup":{"button":0,"which":1},"click":{"button":0,"which":1}},
		        "right":{"mousedown":{"button":2,"which":3},"mouseup":{"button":2,"which":3},"contextmenu":{"button":2,"which":3}}}
	}
	
	//set browser
	Syn.key.browser = 
	(function(){
		if(Syn.key.browsers[window.navigator.userAgent]){
			return Syn.key.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.key.browsers[browser]){
				return Syn.key.browsers[browser]
			}
		}
		return Syn.key.browsers.gecko;
	})();
	
	Syn.mouse.browser = 
	(function(){
		if(Syn.mouse.browsers[window.navigator.userAgent]){
			return Syn.mouse.browsers[window.navigator.userAgent];
		}
		for(var browser in Syn.browser){
			if(Syn.browser[browser] && Syn.mouse.browsers[browser]){
				return Syn.mouse.browsers[browser]
			}
		}
		return Syn.mouse.browsers.gecko;
	})();
})();


(function() {
	
	// check if elementFromPageExists
	(function() {

		// document body has to exists for this test
		if (!document.body ) {
			setTimeout(arguments.callee, 1)
			return;
		}
		var div = document.createElement('div')
		document.body.appendChild(div);
		Syn.helpers.extend(div.style, {
			width: "100px",
			height: "10000px",
			backgroundColor: "blue",
			position: "absolute",
			top: "10px",
			left: "0px",
			zIndex: 19999
		});
		document.body.scrollTop = 11;
		if (!document.elementFromPoint ) {
			return;
		}
		var el = document.elementFromPoint(3, 1)
		if ( el == div ) {
			Syn.support.elementFromClient = true;
		}
		else {
			Syn.support.elementFromPage = true;
		}
		document.body.removeChild(div);
		document.body.scrollTop = 0;
	})();


	//gets an element from a point
	var elementFromPoint = function( point, element ) {
		var clientX = point.clientX,
			clientY = point.clientY,
			win = Syn.helpers.getWindow(element),
			el;



		if ( Syn.support.elementFromPage ) {
			var off = Syn.helpers.scrollOffset(win);
			clientX = clientX + off.left; //convert to pageX
			clientY = clientY + off.top; //convert to pageY
		}
		el = win.document.elementFromPoint ? win.document.elementFromPoint(clientX, clientY) : element;
		if ( el === win.document.documentElement && (point.clientY < 0 || point.clientX < 0) ) {
			return element;
		} else {
			return el;
		}
	},
		//creates an event at a certain point
		createEventAtPoint = function( event, point, element ) {
			var el = elementFromPoint(point, element)
			Syn.trigger(event, point, el || element)
			return el;
		},
		// creates a mousemove event, but first triggering mouseout / mouseover if appropriate
		mouseMove = function( point, element, last ) {
			var el = elementFromPoint(point, element)
			if ( last != el && el && last ) {
				var options = Syn.helpers.extend({}, point);
				options.relatedTarget = el;
				Syn.trigger("mouseout", options, last);
				options.relatedTarget = last;
				Syn.trigger("mouseover", options, el);
			}

			Syn.trigger("mousemove", point, el || element)
			return el;
		},
		// start and end are in clientX, clientY
		startMove = function( start, end, duration, element, callback ) {
			var startTime = new Date(),
				distX = end.clientX - start.clientX,
				distY = end.clientY - start.clientY,
				win = Syn.helpers.getWindow(element),
				current = elementFromPoint(start, element),
				cursor = win.document.createElement('div'),
				calls = 0;
			move = function() {
				//get what fraction we are at
				var now = new Date(),
					scrollOffset = Syn.helpers.scrollOffset(win),
					fraction = (calls == 0 ? 0 : now - startTime) / duration,
					options = {
						clientX: distX * fraction + start.clientX,
						clientY: distY * fraction + start.clientY
					};
				calls++;
				if ( fraction < 1 ) {
					Syn.helpers.extend(cursor.style, {
						left: (options.clientX + scrollOffset.left + 2) + "px",
						top: (options.clientY + scrollOffset.top + 2) + "px"
					})
					current = mouseMove(options, element, current)
					setTimeout(arguments.callee, 15)
				}
				else {
					current = mouseMove(end, element, current);
					win.document.body.removeChild(cursor)
					callback();
				}
			}
			Syn.helpers.extend(cursor.style, {
				height: "5px",
				width: "5px",
				backgroundColor: "red",
				position: "absolute",
				zIndex: 19999,
				fontSize: "1px"
			})
			win.document.body.appendChild(cursor)
			move();
		},
		startDrag = function( start, end, duration, element, callback ) {
			createEventAtPoint("mousedown", start, element);
			startMove(start, end, duration, element, function() {
				createEventAtPoint("mouseup", end, element);
				callback();
			})
		},
		center = function( el ) {
			var j = Syn.jquery()(el),
				o = j.offset();
			return {
				pageX: o.left + (j.outerWidth() / 2),
				pageY: o.top + (j.outerHeight() / 2)
			}
		},
		convertOption = function( option, win, from ) {
			var page = /(\d+)[x ](\d+)/,
				client = /(\d+)X(\d+)/,
				relative = /([+-]\d+)[xX ]([+-]\d+)/
				//check relative "+22x-44"
				if ( typeof option == 'string' && relative.test(option) && from ) {
					var cent = center(from),
						parts = option.match(relative);
					option = {
						pageX: cent.pageX + parseInt(parts[1]),
						pageY: cent.pageY + parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' && page.test(option) ) {
					var parts = option.match(page)
					option = {
						pageX: parseInt(parts[1]),
						pageY: parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' && client.test(option) ) {
					var parts = option.match(client)
					option = {
						clientX: parseInt(parts[1]),
						clientY: parseInt(parts[2])
					}
				}
				if ( typeof option == 'string' ) {
					option = Syn.jquery()(option, win.document)[0];
				}
				if ( option.nodeName ) {
					option = center(option)
				}
				if ( option.pageX ) {
					var off = Syn.helpers.scrollOffset(win);
					option = {
						clientX: option.pageX - off.left,
						clientY: option.pageY - off.top
					}
				}
				return option;
		},
		// if the client chords are not going to be visible ... scroll the page so they will be ...
		adjust = function(from, to, win){
			if(from.clientY < 0){
				var off = Syn.helpers.scrollOffset(win);
				var dimensions = Syn.helpers.scrollDimensions(win),
					top = off.top + (from.clientY) - 100,
					diff = top - off.top
				
				// first, lets see if we can scroll 100 px
				if( top > 0){
					
				} else {
					top =0;
					diff = -off.top;
				}
				from.clientY = from.clientY - diff;
				to.clientY = to.clientY - diff;
				Syn.helpers.scrollOffset(win,{top: top, left: off.left});
				
				//throw "out of bounds!"
			}
		}
		/**
		 * @add Syn prototype
		 */
		Syn.helpers.extend(Syn.init.prototype, {
			/**
			 * @function move
			 * Moves the cursor from one point to another.  
			 * 
			 * ### Quick Example
			 * 
			 * The following moves the cursor from (0,0) in
			 * the window to (100,100) in 1 second.
			 * 
			 *     Syn.move(
			 *          {
			 *            from: {clientX: 0, clientY: 0},
			 *            to: {clientX: 100, clientY: 100},
			 *            duration: 1000
			 *          },
			 *          document.document)
			 * 
			 * ## Options
			 * 
			 * There are many ways to configure the endpoints of the move.
			 * 
			 * ### PageX and PageY
			 * 
			 * If you pass pageX or pageY, these will get converted
			 * to client coordinates.
			 * 
			 *     Syn.move(
			 *          {
			 *            from: {pageX: 0, pageY: 0},
			 *            to: {pageX: 100, pageY: 100}
			 *          },
			 *          document.document)
			 * 
			 * ### String Coordinates
			 * 
			 * You can set the pageX and pageY as strings like:
			 * 
			 *     Syn.move(
			 *          {
			 *            from: "0x0",
			 *            to: "100x100"
			 *          },
			 *          document.document)
			 * 
			 * ### Element Coordinates
			 * 
			 * If jQuery is present, you can pass an element as the from or to option
			 * and the coordinate will be set as the center of the element.
			 
			 *     Syn.move(
			 *          {
			 *            from: $(".recipe")[0],
			 *            to: $("#trash")[0]
			 *          },
			 *          document.document)
			 * 
			 * ### Query Strings
			 * 
			 * If jQuery is present, you can pass a query string as the from or to option.
			 * 
			 * Syn.move(
			 *      {
			 *        from: ".recipe",
			 *        to: "#trash"
			 *      },
			 *      document.document)
			 *    
			 * ### No From
			 * 
			 * If you don't provide a from, the element argument passed to Syn is used.
			 * 
			 *     Syn.move(
			 *          { to: "#trash" },
			 *          'myrecipe')
			 * 
			 * ### Relative
			 * 
			 * You can move the drag relative to the center of the from element.
			 * 
			 *     Syn.move("+20 +30", "myrecipe");
			 * 
			 * @param {Object} options options to configure the drag
			 * @param {HTMLElement} from the element to move
			 * @param {Function} callback a callback that happens after the drag motion has completed
			 */
			_move: function( options, from, callback ) {
				//need to convert if elements
				var win = Syn.helpers.getWindow(from),
					fro = convertOption(options.from || from, win, from),
					to = convertOption(options.to || options, win, from);
				
				options.adjust !== false && adjust(fro, to, win);
				startMove(fro, to, options.duration || 500, from, callback);

			},
			/**
			 * @function drag
			 * Creates a mousedown and drags from one point to another.  
			 * Check out [Syn.prototype.move move] for API details.
			 * 
			 * @param {Object} options
			 * @param {Object} from
			 * @param {Object} callback
			 */
			_drag: function( options, from, callback ) {
				//need to convert if elements
				var win = Syn.helpers.getWindow(from),
					fro = convertOption(options.from || from, win, from),
					to = convertOption(options.to || options, win, from);

				options.adjust !== false && adjust(fro, to, win);
				startDrag(fro, to, options.duration || 500, from, callback);

			}
		})
})();


Faye.random = function() {
  var s = '', i = 40;
  while (i--) s += Math.floor(Math.random() * 16).toString(16);
  return s;
};

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

      if (typeof value === 'number') value = value.toString();

      if (String(field.contentEditable) === 'true')
        field.innerHTML = value;

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

