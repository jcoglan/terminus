var Pathology = new JS.Module('Pathology', {
  extend: {
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
    }
  }
});

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


Pathology.XPathResult = new JS.Class('Pathology.XPathResult', {
  initialize: function(resultType) {
    this._type  = resultType;
    this._nodes = [];
    this._index = 0;
  },
  
  push: function(node) {
    if (this._type !== 0 && node.nodeType !== this._type) return;
    this._nodes.push(node);
  },
  
  iterateNext: function() {
    var node = this._nodes[this._index];
    if (!node) return null;
    this._index += 1;
    return node;
  },
  
  forEach: function(block, scope) {
    for (var i = 0, n = this._nodes.length; i < n; i++)
      block.call(scope, this._nodes[i], i);
  },
  
  atomize: function() {
    var node = this._nodes[0];
    if (!node) return null;
    if (node.nodeValue === undefined || node.nodeValue === null) return node;
    return node.nodeValue;
  },
  
  makeString: function() {
    var parts = [];
    this.forEach(function(node) { parts.push(node.nodeValue) });
    return parts.join('');
  }
});


(function() {;
    var namespace = this;
    namespace = namespace.Pathology = namespace.Pathology || {};
    if (typeof exports === "object") {
        exports.Pathology = this.Pathology;
    }
})();

Pathology.XPath = new JS.Module("Pathology.XPath", {
    root: "location_path",
    __consume__location_path: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.location_path = this._nodeCache.location_path || {};
        var cached = this._nodeCache.location_path[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__location_step();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.head = address1;
            var address2 = null;
            var remaining0 = 0;
            var index2 = this._offset;
            var elements1 = [];
            var text1 = "";
            var address3 = true;
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
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0(text1, this._offset, elements1);
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
            var klass1 = null;
            if (Pathology.LocationPath instanceof Function) {
                klass1 = Pathology.LocationPath;
            } else {
                klass1 = this.klass.SyntaxNode;
            }
            address0 = new klass1(text0, this._offset, elements0, labelled0);
            if (!(Pathology.LocationPath instanceof Function)) {
                address0.extend(Pathology.LocationPath);
            }
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.location_path[index0] = address0;
    },
    __consume__location_step: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.location_step = this._nodeCache.location_step || {};
        var cached = this._nodeCache.location_step[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        var index2 = this._offset;
        var index3 = this._offset;
        var elements1 = [];
        var labelled1 = {};
        var text1 = "";
        var address2 = null;
        if (this._input.substring(this._offset, this._offset + 1) === "/") {
            var klass0 = this.klass.SyntaxNode;
            address2 = new klass0("/", this._offset, []);
            this._offset += 1;
        } else {
            address2 = null;
        }
        if (address2) {
            elements1.push(address2);
            text1 += address2.textValue;
            labelled1.slash = address2;
            var address3 = null;
            address3 = this.__consume__axis();
            if (address3) {
                elements1.push(address3);
                text1 += address3.textValue;
                labelled1.axis = address3;
                var address4 = null;
                var index4 = this._offset;
                address4 = this.__consume__node_test();
                if (address4) {
                } else {
                    this._offset = index4;
                    var klass1 = this.klass.SyntaxNode;
                    address4 = new klass1("", this._offset, []);
                    this._offset += 0;
                }
                if (address4) {
                    elements1.push(address4);
                    text1 += address4.textValue;
                    labelled1.test = address4;
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
            var klass2 = this.klass.SyntaxNode;
            address1 = new klass2(text1, this._offset, elements1, labelled1);
            this._offset += text1.length;
        } else {
            address1 = null;
        }
        if (address1) {
        } else {
            this._offset = index2;
            var index5 = this._offset;
            var elements2 = [];
            var labelled2 = {};
            var text2 = "";
            var address5 = null;
            address5 = this.__consume__axis();
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
                    this._offset = index5;
                }
            } else {
                elements2 = null;
                this._offset = index5;
            }
            if (elements2) {
                this._offset = index5;
                var klass3 = this.klass.SyntaxNode;
                address1 = new klass3(text2, this._offset, elements2, labelled2);
                this._offset += text2.length;
            } else {
                address1 = null;
            }
            if (address1) {
            } else {
                this._offset = index2;
            }
        }
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.head = address1;
            var address7 = null;
            var remaining0 = 0;
            var index6 = this._offset;
            var elements3 = [];
            var text3 = "";
            var address8 = true;
            while (address8) {
                address8 = this.__consume__node_predicate();
                if (address8) {
                    elements3.push(address8);
                    text3 += address8.textValue;
                    remaining0 -= 1;
                }
            }
            if (remaining0 <= 0) {
                this._offset = index6;
                var klass4 = this.klass.SyntaxNode;
                address7 = new klass4(text3, this._offset, elements3);
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
        if (elements0) {
            this._offset = index1;
            var klass5 = null;
            if (Pathology.LocationStep instanceof Function) {
                klass5 = Pathology.LocationStep;
            } else {
                klass5 = this.klass.SyntaxNode;
            }
            address0 = new klass5(text0, this._offset, elements0, labelled0);
            if (!(Pathology.LocationStep instanceof Function)) {
                address0.extend(Pathology.LocationStep);
            }
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.location_step[index0] = address0;
    },
    __consume__axis: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.axis = this._nodeCache.axis || {};
        var cached = this._nodeCache.axis[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        var remaining0 = 1;
        var index3 = this._offset;
        var elements1 = [];
        var text1 = "";
        var address2 = true;
        while (address2) {
            var temp0 = this._input.substring(this._offset, this._offset + 1);
            var match0 = null;
            if (match0 = temp0.match(/^[a-z\-]/)) {
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0(match0[0], this._offset, []);
                this._offset += 1;
            } else {
                address2 = null;
            }
            if (address2) {
                elements1.push(address2);
                text1 += address2.textValue;
                remaining0 -= 1;
            }
        }
        if (remaining0 <= 0) {
            this._offset = index3;
            var klass1 = this.klass.SyntaxNode;
            address1 = new klass1(text1, this._offset, elements1);
            this._offset += text1.length;
        } else {
            address1 = null;
        }
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.axis_name = address1;
            var address3 = null;
            if (this._input.substring(this._offset, this._offset + 2) === "::") {
                var klass2 = this.klass.SyntaxNode;
                address3 = new klass2("::", this._offset, []);
                this._offset += 2;
            } else {
                address3 = null;
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
            var klass3 = this.klass.SyntaxNode;
            address0 = new klass3(text0, this._offset, elements0, labelled0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        if (address0) {
            if (!(Pathology.Axis instanceof Function)) {
                address0.extend(Pathology.Axis);
            }
        } else {
            this._offset = index1;
            address0 = this.__consume__axis_shorthand();
            if (address0) {
                if (!(Pathology.Axis instanceof Function)) {
                    address0.extend(Pathology.Axis);
                }
            } else {
                this._offset = index1;
            }
        }
        return this._nodeCache.axis[index0] = address0;
    },
    __consume__axis_shorthand: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.axis_shorthand = this._nodeCache.axis_shorthand || {};
        var cached = this._nodeCache.axis_shorthand[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        if (this._input.substring(this._offset, this._offset + 1) === "@") {
            var klass0 = this.klass.SyntaxNode;
            address0 = new klass0("@", this._offset, []);
            this._offset += 1;
        } else {
            address0 = null;
        }
        if (address0) {
        } else {
            this._offset = index1;
            if (this._input.substring(this._offset, this._offset + 2) === "..") {
                var klass1 = this.klass.SyntaxNode;
                address0 = new klass1("..", this._offset, []);
                this._offset += 2;
            } else {
                address0 = null;
            }
            if (address0) {
            } else {
                this._offset = index1;
                if (this._input.substring(this._offset, this._offset + 1) === ".") {
                    var klass2 = this.klass.SyntaxNode;
                    address0 = new klass2(".", this._offset, []);
                    this._offset += 1;
                } else {
                    address0 = null;
                }
                if (address0) {
                } else {
                    this._offset = index1;
                    if (this._input.substring(this._offset, this._offset + 1) === "/") {
                        var klass3 = this.klass.SyntaxNode;
                        address0 = new klass3("/", this._offset, []);
                        this._offset += 1;
                    } else {
                        address0 = null;
                    }
                    if (address0) {
                    } else {
                        this._offset = index1;
                        if (this._input.substring(this._offset, this._offset + 0) === "") {
                            var klass4 = this.klass.SyntaxNode;
                            address0 = new klass4("", this._offset, []);
                            this._offset += 0;
                        } else {
                            address0 = null;
                        }
                        if (address0) {
                        } else {
                            this._offset = index1;
                        }
                    }
                }
            }
        }
        return this._nodeCache.axis_shorthand[index0] = address0;
    },
    __consume__node_test: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.node_test = this._nodeCache.node_test || {};
        var cached = this._nodeCache.node_test[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        address0 = this.__consume__node_condition();
        if (address0) {
            if (!(Pathology.NodeTest instanceof Function)) {
                address0.extend(Pathology.NodeTest);
            }
        } else {
            this._offset = index1;
            address0 = this.__consume__node_name();
            if (address0) {
                if (!(Pathology.NodeTest instanceof Function)) {
                    address0.extend(Pathology.NodeTest);
                }
            } else {
                this._offset = index1;
                if (this._input.substring(this._offset, this._offset + 1) === "*") {
                    var klass0 = this.klass.SyntaxNode;
                    address0 = new klass0("*", this._offset, []);
                    this._offset += 1;
                } else {
                    address0 = null;
                }
                if (address0) {
                    if (!(Pathology.NodeTest instanceof Function)) {
                        address0.extend(Pathology.NodeTest);
                    }
                } else {
                    this._offset = index1;
                }
            }
        }
        return this._nodeCache.node_test[index0] = address0;
    },
    __consume__node_condition: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.node_condition = this._nodeCache.node_condition || {};
        var cached = this._nodeCache.node_condition[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        var remaining0 = 1;
        var index2 = this._offset;
        var elements1 = [];
        var text1 = "";
        var address2 = true;
        while (address2) {
            var temp0 = this._input.substring(this._offset, this._offset + 1);
            var match0 = null;
            if (match0 = temp0.match(/^[a-z\-]/)) {
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0(match0[0], this._offset, []);
                this._offset += 1;
            } else {
                address2 = null;
            }
            if (address2) {
                elements1.push(address2);
                text1 += address2.textValue;
                remaining0 -= 1;
            }
        }
        if (remaining0 <= 0) {
            this._offset = index2;
            var klass1 = this.klass.SyntaxNode;
            address1 = new klass1(text1, this._offset, elements1);
            this._offset += text1.length;
        } else {
            address1 = null;
        }
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.condition_name = address1;
            var address3 = null;
            if (this._input.substring(this._offset, this._offset + 2) === "()") {
                var klass2 = this.klass.SyntaxNode;
                address3 = new klass2("()", this._offset, []);
                this._offset += 2;
            } else {
                address3 = null;
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
            var klass3 = this.klass.SyntaxNode;
            address0 = new klass3(text0, this._offset, elements0, labelled0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.node_condition[index0] = address0;
    },
    __consume__node_name: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.node_name = this._nodeCache.node_name || {};
        var cached = this._nodeCache.node_name[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var remaining0 = 1;
        var index1 = this._offset;
        var elements0 = [];
        var text0 = "";
        var address1 = true;
        while (address1) {
            var temp0 = this._input.substring(this._offset, this._offset + 1);
            var match0 = null;
            if (match0 = temp0.match(/^[A-Za-z0-9\-]/)) {
                var klass0 = this.klass.SyntaxNode;
                address1 = new klass0(match0[0], this._offset, []);
                this._offset += 1;
            } else {
                address1 = null;
            }
            if (address1) {
                elements0.push(address1);
                text0 += address1.textValue;
                remaining0 -= 1;
            }
        }
        if (remaining0 <= 0) {
            this._offset = index1;
            var klass1 = this.klass.SyntaxNode;
            address0 = new klass1(text0, this._offset, elements0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.node_name[index0] = address0;
    },
    __consume__node_predicate: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.node_predicate = this._nodeCache.node_predicate || {};
        var cached = this._nodeCache.node_predicate[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        if (this._input.substring(this._offset, this._offset + 1) === "[") {
            var klass0 = this.klass.SyntaxNode;
            address1 = new klass0("[", this._offset, []);
            this._offset += 1;
        } else {
            address1 = null;
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
                if (this._input.substring(this._offset, this._offset + 1) === "]") {
                    var klass1 = this.klass.SyntaxNode;
                    address3 = new klass1("]", this._offset, []);
                    this._offset += 1;
                } else {
                    address3 = null;
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
            var klass2 = this.klass.SyntaxNode;
            address0 = new klass2(text0, this._offset, elements0, labelled0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.node_predicate[index0] = address0;
    },
    __consume__expression: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.expression = this._nodeCache.expression || {};
        var cached = this._nodeCache.expression[index0];
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
        return this._nodeCache.expression[index0] = address0;
    },
    __consume__or_expression: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.or_expression = this._nodeCache.or_expression || {};
        var cached = this._nodeCache.or_expression[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__and_expression();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.left = address1;
            var address2 = null;
            if (this._input.substring(this._offset, this._offset + 2) === "or") {
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0("or", this._offset, []);
                this._offset += 2;
            } else {
                address2 = null;
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
            var klass1 = null;
            if (Pathology.Or instanceof Function) {
                klass1 = Pathology.Or;
            } else {
                klass1 = this.klass.SyntaxNode;
            }
            address0 = new klass1(text0, this._offset, elements0, labelled0);
            if (!(Pathology.Or instanceof Function)) {
                address0.extend(Pathology.Or);
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
        return this._nodeCache.or_expression[index0] = address0;
    },
    __consume__and_expression: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.and_expression = this._nodeCache.and_expression || {};
        var cached = this._nodeCache.and_expression[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__comparison();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.left = address1;
            var address2 = null;
            if (this._input.substring(this._offset, this._offset + 3) === "and") {
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0("and", this._offset, []);
                this._offset += 3;
            } else {
                address2 = null;
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
            var klass1 = null;
            if (Pathology.And instanceof Function) {
                klass1 = Pathology.And;
            } else {
                klass1 = this.klass.SyntaxNode;
            }
            address0 = new klass1(text0, this._offset, elements0, labelled0);
            if (!(Pathology.And instanceof Function)) {
                address0.extend(Pathology.And);
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
        return this._nodeCache.and_expression[index0] = address0;
    },
    __consume__comparison: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.comparison = this._nodeCache.comparison || {};
        var cached = this._nodeCache.comparison[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
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
            var klass0 = null;
            if (Pathology.Comparison instanceof Function) {
                klass0 = Pathology.Comparison;
            } else {
                klass0 = this.klass.SyntaxNode;
            }
            address0 = new klass0(text0, this._offset, elements0, labelled0);
            if (!(Pathology.Comparison instanceof Function)) {
                address0.extend(Pathology.Comparison);
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
        return this._nodeCache.comparison[index0] = address0;
    },
    __consume__comparator: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.comparator = this._nodeCache.comparator || {};
        var cached = this._nodeCache.comparator[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        if (this._input.substring(this._offset, this._offset + 2) === "!=") {
            var klass0 = this.klass.SyntaxNode;
            address0 = new klass0("!=", this._offset, []);
            this._offset += 2;
        } else {
            address0 = null;
        }
        if (address0) {
        } else {
            this._offset = index1;
            if (this._input.substring(this._offset, this._offset + 1) === "=") {
                var klass1 = this.klass.SyntaxNode;
                address0 = new klass1("=", this._offset, []);
                this._offset += 1;
            } else {
                address0 = null;
            }
            if (address0) {
            } else {
                this._offset = index1;
            }
        }
        return this._nodeCache.comparator[index0] = address0;
    },
    __consume__atom: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.atom = this._nodeCache.atom || {};
        var cached = this._nodeCache.atom[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__space();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.space = address1;
            var address2 = null;
            var index2 = this._offset;
            var index3 = this._offset;
            var elements1 = [];
            var labelled1 = {};
            var text1 = "";
            var address3 = null;
            if (this._input.substring(this._offset, this._offset + 1) === "(") {
                var klass0 = this.klass.SyntaxNode;
                address3 = new klass0("(", this._offset, []);
                this._offset += 1;
            } else {
                address3 = null;
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
                    if (this._input.substring(this._offset, this._offset + 1) === ")") {
                        var klass1 = this.klass.SyntaxNode;
                        address5 = new klass1(")", this._offset, []);
                        this._offset += 1;
                    } else {
                        address5 = null;
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
                var klass2 = this.klass.SyntaxNode;
                address2 = new klass2(text1, this._offset, elements1, labelled1);
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
            var klass3 = null;
            if (Pathology.Atom instanceof Function) {
                klass3 = Pathology.Atom;
            } else {
                klass3 = this.klass.SyntaxNode;
            }
            address0 = new klass3(text0, this._offset, elements0, labelled0);
            if (!(Pathology.Atom instanceof Function)) {
                address0.extend(Pathology.Atom);
            }
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.atom[index0] = address0;
    },
    __consume__value: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.value = this._nodeCache.value || {};
        var cached = this._nodeCache.value[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        address0 = this.__consume__function_call();
        if (address0) {
        } else {
            this._offset = index1;
            address0 = this.__consume__attribute();
            if (address0) {
            } else {
                this._offset = index1;
                address0 = this.__consume__string();
                if (address0) {
                } else {
                    this._offset = index1;
                    address0 = this.__consume__self();
                    if (address0) {
                    } else {
                        this._offset = index1;
                        address0 = this.__consume__location_path();
                        if (address0) {
                        } else {
                            this._offset = index1;
                        }
                    }
                }
            }
        }
        return this._nodeCache.value[index0] = address0;
    },
    __consume__function_call: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.function_call = this._nodeCache.function_call || {};
        var cached = this._nodeCache.function_call[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__function_name();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.function_name = address1;
            var address2 = null;
            if (this._input.substring(this._offset, this._offset + 1) === "(") {
                var klass0 = this.klass.SyntaxNode;
                address2 = new klass0("(", this._offset, []);
                this._offset += 1;
            } else {
                address2 = null;
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
                    if (this._input.substring(this._offset, this._offset + 1) === ")") {
                        var klass1 = this.klass.SyntaxNode;
                        address4 = new klass1(")", this._offset, []);
                        this._offset += 1;
                    } else {
                        address4 = null;
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
            var klass2 = null;
            if (Pathology.FunctionCall instanceof Function) {
                klass2 = Pathology.FunctionCall;
            } else {
                klass2 = this.klass.SyntaxNode;
            }
            address0 = new klass2(text0, this._offset, elements0, labelled0);
            if (!(Pathology.FunctionCall instanceof Function)) {
                address0.extend(Pathology.FunctionCall);
            }
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.function_call[index0] = address0;
    },
    __consume__function_name: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.function_name = this._nodeCache.function_name || {};
        var cached = this._nodeCache.function_name[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var remaining0 = 1;
        var index1 = this._offset;
        var elements0 = [];
        var text0 = "";
        var address1 = true;
        while (address1) {
            var temp0 = this._input.substring(this._offset, this._offset + 1);
            var match0 = null;
            if (match0 = temp0.match(/^[a-z\-]/)) {
                var klass0 = this.klass.SyntaxNode;
                address1 = new klass0(match0[0], this._offset, []);
                this._offset += 1;
            } else {
                address1 = null;
            }
            if (address1) {
                elements0.push(address1);
                text0 += address1.textValue;
                remaining0 -= 1;
            }
        }
        if (remaining0 <= 0) {
            this._offset = index1;
            var klass1 = this.klass.SyntaxNode;
            address0 = new klass1(text0, this._offset, elements0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.function_name[index0] = address0;
    },
    __consume__function_args: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.function_args = this._nodeCache.function_args || {};
        var cached = this._nodeCache.function_args[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        address1 = this.__consume__expression();
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            labelled0.first = address1;
            var address2 = null;
            var remaining0 = 0;
            var index3 = this._offset;
            var elements1 = [];
            var text1 = "";
            var address3 = true;
            while (address3) {
                var index4 = this._offset;
                var elements2 = [];
                var labelled1 = {};
                var text2 = "";
                var address4 = null;
                if (this._input.substring(this._offset, this._offset + 1) === ",") {
                    var klass0 = this.klass.SyntaxNode;
                    address4 = new klass0(",", this._offset, []);
                    this._offset += 1;
                } else {
                    address4 = null;
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
                    var klass1 = this.klass.SyntaxNode;
                    address3 = new klass1(text2, this._offset, elements2, labelled1);
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
                var klass2 = this.klass.SyntaxNode;
                address2 = new klass2(text1, this._offset, elements1);
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
            var klass3 = this.klass.SyntaxNode;
            address0 = new klass3(text0, this._offset, elements0, labelled0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        if (address0) {
        } else {
            this._offset = index1;
            var klass4 = this.klass.SyntaxNode;
            address0 = new klass4("", this._offset, []);
            this._offset += 0;
        }
        return this._nodeCache.function_args[index0] = address0;
    },
    __consume__attribute: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.attribute = this._nodeCache.attribute || {};
        var cached = this._nodeCache.attribute[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        if (this._input.substring(this._offset, this._offset + 1) === "@") {
            var klass0 = this.klass.SyntaxNode;
            address1 = new klass0("@", this._offset, []);
            this._offset += 1;
        } else {
            address1 = null;
        }
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            var address2 = null;
            address2 = this.__consume__node_name();
            if (address2) {
                elements0.push(address2);
                text0 += address2.textValue;
                labelled0.node_name = address2;
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
            var klass1 = null;
            if (Pathology.Attribute instanceof Function) {
                klass1 = Pathology.Attribute;
            } else {
                klass1 = this.klass.SyntaxNode;
            }
            address0 = new klass1(text0, this._offset, elements0, labelled0);
            if (!(Pathology.Attribute instanceof Function)) {
                address0.extend(Pathology.Attribute);
            }
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.attribute[index0] = address0;
    },
    __consume__string: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.string = this._nodeCache.string || {};
        var cached = this._nodeCache.string[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var index1 = this._offset;
        var index2 = this._offset;
        var elements0 = [];
        var labelled0 = {};
        var text0 = "";
        var address1 = null;
        if (this._input.substring(this._offset, this._offset + 1) === "'") {
            var klass0 = this.klass.SyntaxNode;
            address1 = new klass0("'", this._offset, []);
            this._offset += 1;
        } else {
            address1 = null;
        }
        if (address1) {
            elements0.push(address1);
            text0 += address1.textValue;
            var address2 = null;
            var remaining0 = 0;
            var index3 = this._offset;
            var elements1 = [];
            var text1 = "";
            var address3 = true;
            while (address3) {
                var index4 = this._offset;
                var index5 = this._offset;
                var elements2 = [];
                var labelled1 = {};
                var text2 = "";
                var address4 = null;
                if (this._input.substring(this._offset, this._offset + 1) === "\\") {
                    var klass1 = this.klass.SyntaxNode;
                    address4 = new klass1("\\", this._offset, []);
                    this._offset += 1;
                } else {
                    address4 = null;
                }
                if (address4) {
                    elements2.push(address4);
                    text2 += address4.textValue;
                    var address5 = null;
                    var temp0 = this._input.substring(this._offset, this._offset + 1);
                    if (temp0 === "") {
                        address5 = null;
                    } else {
                        var klass2 = this.klass.SyntaxNode;
                        address5 = new klass2(temp0, this._offset, []);
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
                    var klass3 = this.klass.SyntaxNode;
                    address3 = new klass3(text2, this._offset, elements2, labelled1);
                    this._offset += text2.length;
                } else {
                    address3 = null;
                }
                if (address3) {
                } else {
                    this._offset = index4;
                    var temp1 = this._input.substring(this._offset, this._offset + 1);
                    var match0 = null;
                    if (match0 = temp1.match(/^[^']/)) {
                        var klass4 = this.klass.SyntaxNode;
                        address3 = new klass4(match0[0], this._offset, []);
                        this._offset += 1;
                    } else {
                        address3 = null;
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
                var klass5 = this.klass.SyntaxNode;
                address2 = new klass5(text1, this._offset, elements1);
                this._offset += text1.length;
            } else {
                address2 = null;
            }
            if (address2) {
                elements0.push(address2);
                text0 += address2.textValue;
                var address6 = null;
                if (this._input.substring(this._offset, this._offset + 1) === "'") {
                    var klass6 = this.klass.SyntaxNode;
                    address6 = new klass6("'", this._offset, []);
                    this._offset += 1;
                } else {
                    address6 = null;
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
            var klass7 = this.klass.SyntaxNode;
            address0 = new klass7(text0, this._offset, elements0, labelled0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        if (address0) {
            if (!(Pathology.String instanceof Function)) {
                address0.extend(Pathology.String);
            }
        } else {
            this._offset = index1;
            var index6 = this._offset;
            var elements3 = [];
            var labelled2 = {};
            var text3 = "";
            var address7 = null;
            if (this._input.substring(this._offset, this._offset + 1) === "\"") {
                var klass8 = this.klass.SyntaxNode;
                address7 = new klass8("\"", this._offset, []);
                this._offset += 1;
            } else {
                address7 = null;
            }
            if (address7) {
                elements3.push(address7);
                text3 += address7.textValue;
                var address8 = null;
                var remaining1 = 0;
                var index7 = this._offset;
                var elements4 = [];
                var text4 = "";
                var address9 = true;
                while (address9) {
                    var index8 = this._offset;
                    var index9 = this._offset;
                    var elements5 = [];
                    var labelled3 = {};
                    var text5 = "";
                    var address10 = null;
                    if (this._input.substring(this._offset, this._offset + 1) === "\\") {
                        var klass9 = this.klass.SyntaxNode;
                        address10 = new klass9("\\", this._offset, []);
                        this._offset += 1;
                    } else {
                        address10 = null;
                    }
                    if (address10) {
                        elements5.push(address10);
                        text5 += address10.textValue;
                        var address11 = null;
                        var temp2 = this._input.substring(this._offset, this._offset + 1);
                        if (temp2 === "") {
                            address11 = null;
                        } else {
                            var klass10 = this.klass.SyntaxNode;
                            address11 = new klass10(temp2, this._offset, []);
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
                        var klass11 = this.klass.SyntaxNode;
                        address9 = new klass11(text5, this._offset, elements5, labelled3);
                        this._offset += text5.length;
                    } else {
                        address9 = null;
                    }
                    if (address9) {
                    } else {
                        this._offset = index8;
                        var temp3 = this._input.substring(this._offset, this._offset + 1);
                        var match1 = null;
                        if (match1 = temp3.match(/^[^"]/)) {
                            var klass12 = this.klass.SyntaxNode;
                            address9 = new klass12(match1[0], this._offset, []);
                            this._offset += 1;
                        } else {
                            address9 = null;
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
                    var klass13 = this.klass.SyntaxNode;
                    address8 = new klass13(text4, this._offset, elements4);
                    this._offset += text4.length;
                } else {
                    address8 = null;
                }
                if (address8) {
                    elements3.push(address8);
                    text3 += address8.textValue;
                    var address12 = null;
                    if (this._input.substring(this._offset, this._offset + 1) === "\"") {
                        var klass14 = this.klass.SyntaxNode;
                        address12 = new klass14("\"", this._offset, []);
                        this._offset += 1;
                    } else {
                        address12 = null;
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
                var klass15 = this.klass.SyntaxNode;
                address0 = new klass15(text3, this._offset, elements3, labelled2);
                this._offset += text3.length;
            } else {
                address0 = null;
            }
            if (address0) {
                if (!(Pathology.String instanceof Function)) {
                    address0.extend(Pathology.String);
                }
            } else {
                this._offset = index1;
            }
        }
        return this._nodeCache.string[index0] = address0;
    },
    __consume__self: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.self = this._nodeCache.self || {};
        var cached = this._nodeCache.self[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        if (this._input.substring(this._offset, this._offset + 1) === ".") {
            var klass0 = null;
            if (Pathology.Self instanceof Function) {
                klass0 = Pathology.Self;
            } else {
                klass0 = this.klass.SyntaxNode;
            }
            address0 = new klass0(".", this._offset, []);
            if (!(Pathology.Self instanceof Function)) {
                address0.extend(Pathology.Self);
            }
            this._offset += 1;
        } else {
            address0 = null;
        }
        return this._nodeCache.self[index0] = address0;
    },
    __consume__space: function(input) {
        var address0 = null;
        var index0 = this._offset;
        this._nodeCache.space = this._nodeCache.space || {};
        var cached = this._nodeCache.space[index0];
        if (cached) {
            this._offset += cached.textValue.length;
            return cached;
        }
        var remaining0 = 0;
        var index1 = this._offset;
        var elements0 = [];
        var text0 = "";
        var address1 = true;
        while (address1) {
            if (this._input.substring(this._offset, this._offset + 1) === " ") {
                var klass0 = this.klass.SyntaxNode;
                address1 = new klass0(" ", this._offset, []);
                this._offset += 1;
            } else {
                address1 = null;
            }
            if (address1) {
                elements0.push(address1);
                text0 += address1.textValue;
                remaining0 -= 1;
            }
        }
        if (remaining0 <= 0) {
            this._offset = index1;
            var klass1 = this.klass.SyntaxNode;
            address0 = new klass1(text0, this._offset, elements0);
            this._offset += text0.length;
        } else {
            address0 = null;
        }
        return this._nodeCache.space[index0] = address0;
    }
});

Pathology.XPathParser = new JS.Class("Pathology.XPathParser", {
    include: Pathology.XPath,
    initialize: function(input) {
        this._input = input;
        this._offset = 0;
        this._nodeCache = {};
    },
    parse: function() {
        var result = this["__consume__" + this.root]();
        return this._offset === this._input.length ? result : null;
    },
    extend: {
        parse: function(input) {
            var parser = new this(input);
            return parser.parse();
        }
    }
});

Pathology.XPathParser.SyntaxNode = new JS.Class("Pathology.XPathParser.SyntaxNode", {
    include: JS.Enumerable,
    initialize: function(textValue, offset, elements, properties) {
        this.textValue = textValue;
        this.offset    = offset;
        this.elements  = elements || [];
        if (!properties) return;
        for (var key in properties) this[key] = properties[key];
    },
    forEach: function(block, context) {
        for (var i = 0, n = this.elements.length; i < n; i++)
            block.call(context, this.elements[i], i);
    }
});


Pathology.And = new JS.Module('Pathology.And', {
  evaluate: function(context, root) {
    return Pathology.atomize(this.left, context, root) &&
           Pathology.atomize(this.right, context, root);
  }
});


Pathology.Atom = new JS.Module('Pathology.Atom', {
  evaluate: function(context, root) {
    var expression = this.expression.in_parens || this.expression;
    return expression.evaluate(context, root);
  }
});


Pathology.Attribute = new JS.Module('Pathology.Attribute', {
  evaluate: function(context, root) {
    if (!context.getAttributeNode && !context.getAttribute) return null;
    
    var name = this.node_name.textValue,
        node = context.getAttributeNode(name);
    
    if (!node) return null;
    
    return (node.value === 'false') ? false :
           (node.value === 'true')  ? true  :
           node.value;
  }
});


Pathology.Axis = new JS.Module('Pathology.Axis', {
  getName: function() {
    return this.axis_name
         ? this.axis_name.textValue
         : Pathology.Axis.SHORTHANDS[this.textValue];
  },
  
  walk: function(context, block, scope) {
    var children   = context.childNodes,
        attributes = context.attributes;
    
    switch (this.getName()) {
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
  },
  
  extend: {
    SHORTHANDS: {
      '@' : 'attribute',
      '..': 'parent',
      '.' : 'self',
      '/' : 'descendant-or-self',
      ''  : 'child'
    }
  }
});


Pathology.Comparison = new JS.Module('Pathology.Comparison', {
  evaluate: function(context, root) {
    var left  = Pathology.atomize(this.left, context, root),
        right = Pathology.atomize(this.right, context, root);
    
    switch (this.comparator.textValue) {
      case '=':   return left == right;
      case '!=':  return left != right;
    }
  }
});


Pathology.FunctionCall = new JS.Module('Pathology.FunctionCall', {
  getArguments: function(context, root) {
    var args = [];
    if (this.function_args.first.evaluate) {
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
        proc = Pathology.FunctionCall.REGISTER[this.function_name.textValue];
    
    return proc.apply(context, args);
  },
  
  extend: {
    REGISTER: {
      'concat': function() {
        return Array.prototype.join.call(arguments, "");
      },
      
      'contains': function(haystack, needle) {
        if (!haystack) return false;
        return haystack.toString().indexOf(needle) >= 0;
      },
      
      'normalize-space': function(string) {
        if (string.makeString) string = string.makeString();
        
        return string.toString().replace(/^\s*/g, '')
                                .replace(/\s*$/g, '')
                                .replace(/\s+/, ' ');
      },
      
      'not': function(value) {
        return !value;
      },
      
      'text': function() {
        return document.evaluate('/text()', this, null, XPathResult.ANY_TYPE, null);
      }
    }
  }
});


Pathology.LocationPath = new JS.Module('Pathology.LocationPath', {
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
});


Pathology.LocationStep = new JS.Module('Pathology.LocationStep', {
  isRelative: function() {
    return !this.head.slash;
  },
  
  evaluate: function(context, root, resultType, result) {
    var axis = this.head.axis, test = this.head.test;
    axis.walk(context, function(node) {
      if (!test || !test.evaluate) return result.push(node);
      test.evaluate(node, this.predicates, root, resultType, result);
    }, this);
  }
});


Pathology.NodeTest = new JS.Module('Pathology.NodeTest', {
  evaluate: function(context, predicates, root, resultType, result) {
    if (this.condition_name) {
      switch (this.condition_name.textValue) {
        case 'node':
          // NOOP
          break;
        case 'text':
          if (context.nodeType !== XPathResult.BOOLEAN_TYPE)
            return;
          break;
      }
    } else {
      var tagName = this.textValue.toLowerCase();
      if (tagName !== '*') {
        if (!context.nodeName) return;
        if (context.nodeName.toLowerCase() !== tagName) return;
      }
    }
    
    var viable = true;
    predicates.forEach(function(predicate) {
      var expression = predicate.expression;
      viable = viable && Pathology.atomize(expression, context, root);
    });
    
    if (viable) result.push(context);
  }
});


Pathology.Or = new JS.Module('Pathology.Or', {
  evaluate: function(context, root) {
    return Pathology.atomize(this.left, context, root) ||
           Pathology.atomize(this.right, context, root);
  }
});


Pathology.Self = new JS.Module('Pathology.Self', {
  evaluate: function(context, root) {
    this._context = context;
    return this;
  },
  
  makeString: function() {
    var result = document.evaluate('//text()', this._context, null, XPathResult.ANY_TYPE, null);
    return result.makeString();
  }
});


Pathology.String = new JS.Module('Pathology.String', {
  evaluate: function(context, root) {
    return eval(this.textValue);
  }
});