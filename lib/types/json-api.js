// Generated by CoffeeScript 1.6.2
(function() {
  var SubDoc, depath, extendDoc, pathEquals, traverse, _type, _types,
    __slice = [].slice;

  _types = typeof window === 'undefined' ? require('ottypes') : window.ottypes;

  if (typeof WEB !== "undefined" && WEB !== null) {
    extendDoc = exports.extendDoc;
    exports.extendDoc = function(name, fn) {
      SubDoc.prototype[name] = fn;
      return extendDoc(name, fn);
    };
  }

  depath = function(path) {
    if (path.length === 1 && path[0].constructor === Array) {
      return path[0];
    } else {
      return path;
    }
  };

  SubDoc = (function() {
    function SubDoc(context, path) {
      var subdoc = this;
      this.context = context;
      this.path = path;

      // Listen for relevant move operations and update the local path
      // TODO: stop using _doc for this
      this.context._doc.on('op',function(op){
        var i, c, new_path_prefix;
        for (i = 0; i < op.length; i++) {
          c = op[i];
          if(c.lm !== void 0 && containsPath(subdoc.path,c.p)){
            new_path_prefix = c.p.slice(0,c.p.length-1);
            new_path_prefix.push(c.lm);
            subdoc.path = new_path_prefix.concat(subdoc.path.slice(new_path_prefix.length));
          }
        }
      });
    }

    SubDoc.prototype.at = function() {
      var path;

      path = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return this.context.at(this.path.concat(depath(path)));
    };

    SubDoc.prototype.parent = function() {
      if (this.path.length) {
        return this.context.at(this.path.slice(0, this.path.length - 1));
      } else {
        return void 0;
      }
    };

    SubDoc.prototype.get = function() {
      return this.context.getAt(this.path);
    };

    SubDoc.prototype.set = function(value, cb) {
      return this.context.setAt(this.path, value, cb);
    };

    SubDoc.prototype.insert = function(pos, value, cb) {
      return this.context.insertAt(this.path, pos, value, cb);
    };

    SubDoc.prototype.del = function(pos, length, cb) {
      return this.context.deleteTextAt(this.path, length, pos, cb);
    };

    SubDoc.prototype.remove = function(cb) {
      return this.context.removeAt(this.path, cb);
    };

    SubDoc.prototype.push = function(value, cb) {
      return this.insert(this.get().length, value, cb);
    };

    SubDoc.prototype.move = function(from, to, cb) {
      return this.context.moveAt(this.path, from, to, cb);
    };

    SubDoc.prototype.add = function(amount, cb) {
      return this.context.addAt(this.path, amount, cb);
    };

    SubDoc.prototype.on = function(event, cb) {
      return this.context.addListener(this.path, event, cb);
    };

    SubDoc.prototype.removeListener = function(l) {
      return this.context.removeListener(l);
    };

    SubDoc.prototype.getLength = function() {
      return this.get().length;
    };

    SubDoc.prototype.getText = function() {
      return this.get();
    };

    return SubDoc;

  })();

  traverse = function(snapshot, path) {
    var container, elem, key, p, _i, _len;

    container = {
      data: snapshot
    };
    key = 'data';
    elem = container;
    for (_i = 0, _len = path.length; _i < _len; _i++) {
      p = path[_i];
      elem = elem[key];
      key = p;
      if (typeof elem === 'undefined') {
        throw new Error('bad path');
      }
    }
    return {
      elem: elem,
      key: key
    };
  };

  pathEquals = function(p1, p2) {
    var e, i, _i, _len;

    if (p1.length !== p2.length) {
      return false;
    }
    for (i = _i = 0, _len = p1.length; _i < _len; i = ++_i) {
      e = p1[i];
      if (e !== p2[i]) {
        return false;
      }
    }
    return true;
  };

  containsPath = function(p1, p2) {
    if (p1.length < p2.length) return false;
    return pathEquals( p1.slice(0,p2.length), p2);
  };

  _type = _types['http://sharejs.org/types/JSONv0'];

  _type.api = {
    provides: {
      json: true
    },
    _fixComponentPaths: function(c) {
      var dummy, i, l, to_remove, xformed, _i, _j, _len, _len1, _ref, _results;

      if (!this._listeners) {
        return;
      }
      if (c.na !== void 0 || c.si !== void 0 || c.sd !== void 0) {
        return;
      }
      to_remove = [];
      _ref = this._listeners;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        l = _ref[i];
        dummy = {
          p: l.path,
          na: 0
        };
        xformed = _type.transformComponent([], dummy, c, 'left');
        if (xformed.length === 0) {
          to_remove.push(i);
        } else if (xformed.length === 1) {
          l.path = xformed[0].p;
        } else {
          throw new Error("Bad assumption in json-api: xforming an 'na' op will always result in 0 or 1 components.");
        }
      }
      to_remove.sort(function(a, b) {
        return b - a;
      });
      _results = [];
      for (_j = 0, _len1 = to_remove.length; _j < _len1; _j++) {
        i = to_remove[_j];
        _results.push(this._listeners.splice(i, 1));
      }
      return _results;
    },
    _fixPaths: function(op) {
      var c, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = op.length; _i < _len; _i++) {
        c = op[_i];
        _results.push(this._fixComponentPaths(c));
      }
      return _results;
    },
    _submit: function(op, callback) {
      this._fixPaths(op);
      return this.submitOp(op, callback);
    },
    at: function() {
      var path;

      path = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      return new SubDoc(this, depath(path));
    },
    get: function() {
      return this.getSnapshot();
    },
    set: function(value, cb) {
      return this.setAt([], value, cb);
    },
    getAt: function(path) {
      var elem, key, _ref;

      _ref = traverse(this.getSnapshot(), path), elem = _ref.elem, key = _ref.key;
      return elem[key];
    },
    setAt: function(path, value, cb) {
      var elem, key, op, _ref;

      _ref = traverse(this.getSnapshot(), path), elem = _ref.elem, key = _ref.key;
      op = {
        p: path
      };
      if (elem.constructor === Array) {
        op.li = value;
        if (typeof elem[key] !== 'undefined') {
          op.ld = elem[key];
        }
      } else if (typeof elem === 'object') {
        op.oi = value;
        if (typeof elem[key] !== 'undefined') {
          op.od = elem[key];
        }
      } else {
        throw new Error('bad path');
      }
      return this._submit([op], cb);
    },
    removeAt: function(path, cb) {
      var elem, key, op, _ref;

      _ref = traverse(this.getSnapshot(), path), elem = _ref.elem, key = _ref.key;
      if (typeof elem[key] === 'undefined') {
        throw new Error('no element at that path');
      }
      op = {
        p: path
      };
      if (elem.constructor === Array) {
        op.ld = elem[key];
      } else if (typeof elem === 'object') {
        op.od = elem[key];
      } else {
        throw new Error('bad path');
      }
      return this._submit([op], cb);
    },
    insertAt: function(path, pos, value, cb) {
      var elem, key, op, _ref;

      _ref = traverse(this.getSnapshot(), path), elem = _ref.elem, key = _ref.key;
      op = {
        p: path.concat(pos)
      };
      if (elem[key].constructor === Array) {
        op.li = value;
      } else if (typeof elem[key] === 'string') {
        op.si = value;
      }
      return this._submit([op], cb);
    },
    moveAt: function(path, from, to, cb) {
      var op;

      op = [
        {
          p: path.concat(from),
          lm: to
        }
      ];
      return this._submit(op, cb);
    },
    addAt: function(path, amount, cb) {
      var op;

      op = [
        {
          p: path,
          na: amount
        }
      ];
      return this._submit(op, cb);
    },
    deleteTextAt: function(path, length, pos, cb) {
      var elem, key, op, _ref;

      _ref = traverse(this.getSnapshot(), path), elem = _ref.elem, key = _ref.key;
      op = [
        {
          p: path.concat(pos),
          sd: elem[key].slice(pos, pos + length)
        }
      ];
      return this._submit(op, cb);
    },
    addListener: function(path, event, cb) {
      var l;

      this._listeners || (this._listeners = []);
      l = {
        path: path,
        event: event,
        cb: cb
      };
      this._listeners.push(l);
      return l;
    },
    removeListener: function(l) {
      var i;

      if (!this._listeners) {
        return;
      }
      i = this._listeners.indexOf(l);
      if (i < 0) {
        return false;
      }
      this._listeners.splice(i, 1);
      return true;
    },
    _onOp: function(op) {
      var c, cb, child_path, event, match_path, path, _i, _len, _results;

      _results = [];
      for (_i = 0, _len = op.length; _i < _len; _i++) {
        c = op[_i];
        this._fixComponentPaths(c);
        match_path = c.na === void 0 ? c.p.slice(0, c.p.length - 1) : c.p;
        _results.push((function() {
          var _j, _len1, _ref, _ref1, _results1;

          _ref = this._listeners;
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            _ref1 = _ref[_j], path = _ref1.path, event = _ref1.event, cb = _ref1.cb;
            if (pathEquals(path, match_path)) {
              switch (event) {
                case 'insert':
                  if (c.li !== void 0 && c.ld === void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.li));
                  } else if (c.oi !== void 0 && c.od === void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.oi));
                  } else if (c.si !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.si));
                  } else {
                    _results1.push(void 0);
                  }
                  break;
                case 'delete':
                  if (c.li === void 0 && c.ld !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.ld));
                  } else if (c.oi === void 0 && c.od !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.od));
                  } else if (c.sd !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.sd));
                  } else {
                    _results1.push(void 0);
                  }
                  break;
                case 'replace':
                  if (c.li !== void 0 && c.ld !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.ld, c.li));
                  } else if (c.oi !== void 0 && c.od !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.od, c.oi));
                  } else {
                    _results1.push(void 0);
                  }
                  break;
                case 'move':
                  if (c.lm !== void 0) {
                    _results1.push(cb(c.p[c.p.length - 1], c.lm));
                  } else {
                    _results1.push(void 0);
                  }
                  break;
                case 'add':
                  if (c.na !== void 0) {
                    _results1.push(cb(c.na));
                  } else {
                    _results1.push(void 0);
                  }
                  break;
                default:
                  _results1.push(void 0);
              }
            } else if (_type.canOpAffectOp(path, match_path)) {
              if (event === 'child op') {
                child_path = c.p.slice(path.length);
                _results1.push(cb(child_path, c));
              } else {
                _results1.push(void 0);
              }
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    }
  };

}).call(this);