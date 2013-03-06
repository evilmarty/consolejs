/*!
Copyright (C) 2011 by Marty Zalega

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function() {
  var consoles = {};

  function create(tagName, attrs) {
    var el = document.createElement(tagName);
    if (attrs)
      for (var k in attrs) el.setAttribute(k, attrs[k]);
    for (var i = 2; i < arguments.length; ++i)
      el.appendChild(arguments[i]);
    return el;
  }

  function text(el, text) {
    if (typeof el === 'string' || typeof el === 'number')
      return document.createTextNode(el);
    el.appendChild(document.createTextNode(text));
    return el;
  }

  function addClass(el) {
    var classes = [];
    for (var i = 1; i < arguments.length; ++i)
      classes = classes.concat(arguments[i].split(/\s+/));
    if (el.classList) {
      for (var i in classes) el.classList.add(classes[i]);
    }
    else {
      classes = el.className.split(/\s+/).concat(classes);
      el.className = classes.join(' ');
    }
    return el;
  }

  function listen(el, event, callback) {
    var onevent = 'on' + event;
    if (el.addEventListener)
      return el.addEventListener(event, callback, false);
    else if (el.attachEvent)
      return el.attachEvent(onevent, callback);
    else if (onevent in el)
      return el[onevent] = callback;
  }

  function extend(src) {
    for (var i = 1; i < arguments.length; ++i) {
      var obj = arguments[i];
      for (var k in obj) src[k] = obj[k];
    }
    return src;
  }

  function toArray(arr) {
    return Array.prototype.slice.call(arr);
  }

  function bind(func, inst) {
    var args = toArray(arguments).slice(2);
    return function() {
      func.apply(inst || this, args.concat(toArray(arguments)));
    }
  }

  function typeOf(obj) {
    if (Object.prototype.toString.call(obj) === '[object Array]')
      return 'array';
    else if (Object.prototype.toString.call(obj) === '[object Error]')
      return 'error';
    else if (obj === null)
      return 'null';
    else if (obj && obj.nodeType == 1)
      return 'element';
    else
      return typeof obj;
  }

  function output(result, deep) {
    var type = typeOf(result);
    switch (type) {
      case 'null':
      case 'undefined':
        return create('span', {'class': type}, text(type));
      case 'array':
        var arr = create('ol', {'class': type});
        for (var i in result) {
          var val = result[i];
          arr.appendChild(create('li', null, output(val)));
        }
        return arr;
      case 'object':
        var obj = create('dl', {'class': type});
        for (var k in result) {
          if (!(k in result.__proto__)) {
            var val = deep === false ? text(k) : output(result[k], false);
            obj.appendChild(create('dt', null, text(k)));
            obj.appendChild(create('dd', null, val));
          }
        }
        return obj;
      case 'element':
        var nodeName = result.nodeName.toLowerCase(),
            attrs = create('dl'),
            open = create('div', {'class': 'open'}, text(nodeName), attrs),
            close = create('div', {'class': 'close'}, text(nodeName)),
            html = create('div', {'class': 'content'}, text(result.innerHTML));
        for (var i = 0; i < result.attributes.length; ++i) {
          var attr = result.attributes[i];
          attrs.appendChild(create('dt', null, text(attr.name)));
          attrs.appendChild(create('dd', null, text(attr.value)));
        }
        return create('div', {'class': type}, open, html, close);
      default:
        return create('span', {'class': type}, text(result.toString()));
    }
  }

  var History = function() {
    var index = -1, history = [];
    return extend(this, {
      clear: function() {
        history = [];
      },
      reset: function() {
        index = history.length;
      },
      previous: function() {
        return history[index = Math.max(--index, 0)];
      },
      next: function() {
        return history[index = Math.min(++index, history.length)];
      },
      push: function(data) {
        if (history[history.length - 1] !== data) {
          history.push(data);
          this.reset();
        }
      }
    });
  }

  var Console = function(el, scope) {
    if (typeof el == 'string')
      el = document.getElementById(el);

    var console = consoles[el];
    if (console) {
      console.cd(scope);
      return console;
    }
    else if (!(this instanceof Console)) {
      if (!console)
        console = new Console(el, scope);
      return console;
    }
    consoles[el] = this;

    scope || (scope = window);

    var limbo = create('div');
    while (node = el.childNodes[0])
      limbo.appendChild(node);

    var container      = create('div', {'class': 'console-container'}),
        inputContainer = create('p', {'class': 'console-input'}),
        input          = create('textarea', {row: 1}),
        original       = {className: el.className, tabIndex: el.tabIndex};
    inputContainer.appendChild(input);
    container.appendChild(inputContainer);
    addClass(el, 'console').appendChild(container);

    if (el.tabIndex < 0) el.tabIndex = 0;
    listen(el, 'focus', function() {
      input.focus();
    });

    var history = new History;
    listen(input, 'keydown', function(event) {
      switch (event.keyCode) {
        case 13: // enter
          event.preventDefault();
          exec(this.value);
          this.value = '';
          return false;
        case 38: // up
          if (cmd = history.previous())
            input.value = cmd;
          event.preventDefault();
          return false;
        case 40: // down
          if (cmd = history.next())
            input.value = cmd;
          else
            input.value = '';
          event.preventDefault();
          return false;
      }
    });
    listen(input, 'blur', function() {
      history.reset();
    });

    function log(level) {
      var msg = arguments.length === 2 ? arguments[1] : toArray(arguments).slice(1);

      var result = create('div', {'class': 'result'}, output(msg)),
          el = addClass(create('p', null, result), typeOf(msg), level);
      container.insertBefore(el, inputContainer);
      return el;
    }

    function exec(command) {
      if (!command) return;

      var cmd = text(create('div', {'class': 'command'}), command),
          level = 'info', msg;
      try {
        msg = (function() { with(scope) { return eval(command) } }).call(scope);
      }
      catch (err) {
        msg = err; level = 'error';
      }
      var el = log(level, msg)
      el.insertBefore(cmd, el.childNodes[0]);
      el.scrollTop = el.scrollHeight;
      container.scrollTop = container.scrollHeight;
      history.push(command);
    }

    return extend(this, {
      cd: function(s) {
        scope = s;
      },
      log: function() {
        this.info.apply(this, arguments)
      },
      info: bind(log, this, 'info'),
      warn: bind(log, this, 'warn'),
      error: bind(log, this, 'error'),
      clear: function() {
        var prev = inputContainer.previousSibling;
        while (prev) {
          var el = prev;
          prev = el.previousSibling;
          el.parentNode.removeChild(el);
        }
      },
      destroy: function() {
        for (var k in original) el[k] = original[k];
        while (node = el.childNodes[0]) el.removeChild(node);
        while (node = limbo.childNodes[0]) el.appendChild(node);
        delete limbo;
        delete output;
        delete input;
        delete original;
      }
    });
  }

  window.Console = Console;
})();