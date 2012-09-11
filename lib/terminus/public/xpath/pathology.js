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
  if (this._nodes.indexOf(node) >= 0) return;
  this._nodes.push(node);
};

Pathology.XPathResult.prototype.iterateNext = function() {
  var node = this._nodes[this._index];
  if (!node) return null;
  this._index += 1;
  return node;
};

Pathology.XPathResult.prototype.forEach = function(block, scope) {
  for (var i = 0, n = this._nodes.length; i < n; i++)
    block.call(scope, this._nodes[i], i);
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
      this.forEach(function(node) { parts.push(node.nodeValue) });
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
    __consume__union_expression: function(input) {
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
    __consume__location_path: function(input) {
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
    __consume__location_step: function(input) {
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
    __consume__axis: function(input) {
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
    __consume__axis_shorthand: function(input) {
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
    __consume__node_test: function(input) {
      var address0 = null, index0 = this._offset;
      this._nodeCache["node_test"] = this._nodeCache["node_test"] || {};
      var cached = this._nodeCache["node_test"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      address0 = this.__consume__node_condition();
      if (address0) {
        var type0 = find(this.constructor, "NodeTest");
        if (typeof type0 === "object") {
          extend(address0, type0);
        }
      } else {
        this._offset = index1;
        address0 = this.__consume__node_name();
        if (address0) {
          var type1 = find(this.constructor, "NodeTest");
          if (typeof type1 === "object") {
            extend(address0, type1);
          }
        } else {
          this._offset = index1;
          var slice0 = null;
          if (this._input.length > this._offset) {
            slice0 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice0 = null;
          }
          if (slice0 === "*") {
            var klass0 = this.constructor.SyntaxNode;
            var type2 = null;
            address0 = new klass0("*", this._offset, []);
            if (typeof type2 === "object") {
              extend(address0, type2);
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
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "\"*\""};
            }
          }
          if (address0) {
            var type3 = find(this.constructor, "NodeTest");
            if (typeof type3 === "object") {
              extend(address0, type3);
            }
          } else {
            this._offset = index1;
          }
        }
      }
      return this._nodeCache["node_test"][index0] = address0;
    },
    __consume__node_condition: function(input) {
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
    __consume__node_name: function(input) {
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
    __consume__node_predicate: function(input) {
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
      return this._nodeCache["node_predicate"][index0] = address0;
    },
    __consume__expression: function(input) {
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
    __consume__or_expression: function(input) {
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
    __consume__and_expression: function(input) {
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
    __consume__comparison: function(input) {
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
    __consume__comparator: function(input) {
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
    __consume__atom: function(input) {
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
    __consume__value: function(input) {
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
    __consume__function_call: function(input) {
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
    __consume__function_name: function(input) {
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
    __consume__function_args: function(input) {
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
    __consume__string: function(input) {
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
    __consume__space: function(input) {
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
      attributes = Pathology.array(context.attributes);
  
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
    
    case 'parent':
      block.call(scope, context.parentNode);
      break;
    
    case 'self':
      block.call(scope, context);
      break;
    
    case 'descendant-or-self':
      block.call(scope, context);
      for (var i = 0, n = children.length; i < n; i++) {
        this.walk(children[i], block, scope);
      }
      break;
    
    case 'child':
      for (var i = 0, n = children.length; i < n; i++) {
        block.call(scope, children[i]);
      }
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
        right      = Pathology.atomize(this.right, context, root);
    
    if (left.forEach) {
      var viable = false;
      left.forEach(function(node) {
        switch (comparator) {
          case '=':
            viable = viable || (right instanceof Array ? right.indexOf(node.nodeValue) >= 0 : node.nodeValue == right);
            break;
          case '!=':
            viable = viable || (right instanceof Array ? right.indexOf(node.nodeValue) < 0 : node.nodeValue != right);
            break;
        }
      });
      return viable;
    
    } else {
      switch (comparator) {
        case '=':   return right instanceof Array ? right.indexOf(left.nodeValue) >= 0 : left == right;
        case '!=':  return right instanceof Array ? right.indexOf(node.nodeValue) <  0 : left != right;
      }
    }
  }
};


Pathology.XPathParser.FunctionCall = {
  getArguments: function(context, root) {
    var args = [];
    if (this.function_args.first && this.function_args.first.evaluate) {
      args.push(this.function_args.first.evaluate(context, root));
    }
    if (this.function_args.rest) {
      this.function_args.rest.forEach(function(arg) {
        args.push(arg.expression.evaluate(context, root));
      });
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
    block.call(scope, this.head);
    this.rest.forEach(block, scope);
  },
  
  evaluate: function(context, root, resultType, result) {
    result = result || new Pathology.XPathResult(XPathResult.ANY_TYPE);
    resultType = resultType || XPathResult.ANY_TYPE;
    
    var intermediate = new Pathology.XPathResult(resultType),
        startNode    = this.head.isRelative() ? context : root;
    
    intermediate.push(startNode);
    
    this.eachStep(function(step) {
      var nextStage = new Pathology.XPathResult(resultType);
      intermediate.forEach(function(node) {
        step.evaluate(node, root, resultType, nextStage);
      });
      intermediate = nextStage;
    });
    intermediate.forEach(result.push, result);
    
    return result;
  }
};


Pathology.XPathParser.LocationStep = {
  isRelative: function() {
    return this.elements[0].textValue !== '/';
  },
  
  evaluate: function(context, root, resultType, result) {
    var axis = this.selector.axis,
        test = this.selector.test;
    
    Pathology.Axis.fromAST(axis).walk(context, function(node) {
      if (!test || !test.evaluate) return result.push(node);
      test.evaluate(node, this.predicates, root, resultType, result);
    }, this);
  }
};


Pathology.XPathParser.NodeTest = {
  evaluate: function(context, predicates, root, resultType, result) {
    var name = this.condition_name;
    if (name && name.textValue === 'node') {
      // NOOP
    } else if (name && name.textValue === 'text') {
      if (context.nodeType !== XPathResult.BOOLEAN_TYPE) return;
    } else {
      var tagName = this.textValue.toLowerCase();
      if (tagName === '*') {
        if (context.nodeType !== 1) return;
      } else {
        if (!context.nodeName) return;
        if (context.nodeName.toLowerCase() !== tagName) return;
      }
    }
    
    var viable = true;
    predicates.forEach(function(predicate) {
      viable = viable && Pathology.atomize(predicate.expression, context, root);
      if (typeof viable === 'string') viable = true;
    });
    
    if (viable) result.push(context);
  }
};


Pathology.XPathParser.Or = {
  evaluate: function(context, root) {
    return Pathology.atomize(this.left, context, root) ||
           Pathology.atomize(this.right, context, root);
  }
};


Pathology.XPathParser.String = {
  evaluate: function(context, root) {
    return eval(this.textValue);
  }
};


Pathology.XPathParser.Union = {
  eachPath: function(block, scope) {
    block.call(scope, this.head);
    this.rest.forEach(function(section) {
      block.call(scope, section.location_path);
    });
  },
  
  evaluate: function(context, root, resultType, result) {
    result = result || new Pathology.XPathResult(XPathResult.ANY_TYPE);
    resultType = resultType || XPathResult.ANY_TYPE;
    
    this.eachPath(function(path) {
      path.evaluate(context, root, resultType, result);
    });
    
    return result;
  }
};

