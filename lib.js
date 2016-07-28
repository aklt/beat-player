/*global XMLHttpRequest Node*/
var __slice = [].slice
var __hasProp = {}.hasOwnProperty
var __proto = 'prototype'

// ## type(elem[, isType])
//
// Return the type of an element
// if isType is a string returns true if the types match
function type (obj, isType) {
  var t
  if (obj === null) t = 'null'
  else if (obj === undefined) t = 'undefined'
  if (t) {
    if (typeof isType === 'string') return t === isType
    return t
  }
  var ret = Object.prototype.toString.call(obj).match(/^\[object\s+(.*?)\]$/)[1]
  ret = ret ? ret.toLowerCase() : ''
  if (ret === 'number' && isNaN(obj)) t = 'nan'
  else t = ret
  if (typeof isType === 'string') return t === isType
  return t
}

// ## Object extend(target, parents...)
function extend (/* target, parents... */) {
  var args = __slice.call(arguments)
  var target = args[0]
  for (var i = 1; i < args.length; i += 1) {
    var parent = args[i]
    if (parent) {
      for (var key in parent) {
        if (__hasProp.call(parent, key)) target[key] = parent[key]
      }
    }
  }
  return target
}

function each (objOrArray, fn) {
  if (Array.isArray(objOrArray)) {
    objOrArray.forEach(function (elem, i) {
      fn(i, elem)
    })
  } else {
    var t = type(objOrArray)
    if (t === 'object') {
      for (var k in objOrArray) {
        var v = objOrArray[k]
        fn(k, v)
      }
    }
  }
}

function eachPush (objOrArray, fn) {
  var result = []
  each(objOrArray, function (k, v) {
    result.push(fn(k, v))
  })
  return result
}

// ## delay(time, fun, scope, args...)
function delay (/* time, fun, ... */) {
  var a = __slice.call(arguments)
  setTimeout(function () {
    a[1].apply(a[2], a.slice(3))
  }, a[0])
}

function _flatten (result, args) {
  for (var i = 0; i < args.length; i += 1) {
    var el = args[i]
    if (Array.isArray(el)) {
      _flatten(result, el)
    } else {
      result.push(el)
    }
  }
  return result
}

function flatten (args) {
  return _flatten([], args)
}

// HTtml Tags
// $t('div', {id: foo})
// $t('div', {id: foo}, 'text')
// $t('div', text1, [text2, ...], ...)
function $t (/* tag, opts, text...*/) {
  var args = [].slice.call(arguments)
  var tag = args.shift()
  var opts = {}
  if (type(args[0]) === 'object') opts = args.shift()
  return '<' + tag + $t_attr(opts) + '>' +
            flatten(args).join('\n') +
         '</' + tag + '>'
}

function $ts (/* tag, opts, text... */) {
  var args = [].slice.call(arguments)
  var tag = args.shift()
  var opts = {}
  if (type(args[0]) === 'object') opts = args.shift()
  return eachPush(flatten(args), function (i, text) {
    opts.index = i
    return $t(tag, opts, text)
  })
}

function $t_attr (opts) {
  var result = []
  each(opts, function (k, v) {
    result.push(k + '="' + v + '"')
  })
  if (result.length === 0) return ''
  return ' ' + result.join(' ')
}

var __window = window
var __document = __window.document

function classAdd (el, cls) {
  if (typeof el.className === 'undefined') el.className = cls
  else el.className = el.className + ' ' + cls
  return el.className
}

function classRemove (el, cls) {
  var c = el.className
  if (!c) return
  else el.className = c.replace(new RegExp('\\s?' + cls, 'g'), '')
  return el.className
}

// From http://dpi.lv/utopia.js
function qs (expr, con) {
  return (con || __document).querySelector(expr)
}

function qa (expr, con) {
  return __slice.call((con || __document).querySelectorAll(expr))
}

function $id (name) {
  return __document.getElementById(name)
}

var _pfx_style = __document.createElement('dummy').style
var _pfx_prefixes = 'Webkit Moz O ms Khtml'.split(' ')
var _pfx_memory = {}

// Return b prefixed version of b browser style
//
// From http://bartaz.github.io/impress.js/js/impress.js
function pfx (prop) {
  if (typeof _pfx_memory[ prop ] === 'undefined') {
    var ucProp = prop.charAt(0).toUpperCase() + prop.substr(1)
    var props = (prop + ' ' + _pfx_prefixes.join(ucProp + ' ') +
                ucProp).split(' ')

    _pfx_memory[ prop ] = null
    for (var i in props) {
      if (_pfx_style[props[i]] !== undefined) {
        _pfx_memory[prop] = props[i]
        break
      }
    }
  }
  return _pfx_memory[ prop ]
}

// Set the css specified in 'props' on element 'el'
//
// From http://bartaz.github.io/impress.js/js/impress.js
//
function css (el, props) {
  if (typeof el === 'string') el = qs(el)
  if (!el.style) return
  var key, pkey
  for (key in props) {
    if (props.hasOwnProperty(key)) {
      pkey = pfx(key)
      if (pkey !== null) {
        el.style[pkey] = props[key]
      }
    }
  }
  return el
}

function elRect (el) {
  if (!el.offsetParent) throw new Error('Need offsetParent')
  var curleft = el.offsetLeft
  var curtop = el.offsetTop
  var width = el.offsetWidth
  var height = el.offsetHeight
  while ((el = el.offsetParent)) {
    curleft += el.offsetLeft
    curtop += el.offsetTop
  }
  return {
    left: curleft,
    top: curtop,
    width: width,
    height: height
  }
}

var _readyFuncs = []
var _loaded
function ready (fn) {
  if (_loaded) return fn()
  _readyFuncs.push(fn)
  if (_readyFuncs.length === 1) {
    __document.addEventListener('DOMContentLoaded', function (ev) {
      for (var i = 0; i < _readyFuncs.length; i += 1) {
        _readyFuncs[i]()
      }
      _loaded = 1
    })
  }
}

// ## attr(el, Object|String)
//
// Get or set attributes on a node
//
function attr (el, attrs) {
  if (typeof attrs === 'string') {
    return el.getAttribute(attrs)
  }
  Object.keys(attrs || {}).forEach(function (at) {
    // TODO Ugly hack to create a text element in htmlEl and svgEl
    if (at === 'text') return
    el.setAttribute(at, attrs[at])
  })
}

function html (el, text) {
  el.innerHTML = text
}

// ### dom(html[, html, ...])
// Create dom elements from html strings
function createDomArray (o) {
  var h = __document.createElement('div')
  h.innerHTML = o.html
  return __slice.call(h.childNodes)
}

function dom (/* htmlText0, htmlText1, ..., options{css} */) {
  var args = __slice.call(arguments)
  var options = args[args.length - 1]
  if (typeof options === 'object') {
    args.pop()
  }
  var result = []
  args.forEach(function (arg) {
    var domArray = createDomArray({html: arg})
    domArray.forEach(function (dom1) {
      if (dom1) {
        if (options.css) css(dom1, options.css)
      }
    })
    result = result.concat(domArray)
  })
  return result.length === 1 ? result[0] : result
}

function removeChild (root, child) {
  return root.removeChild(child)
}

function appendChild (root, child) {
  root.appendChild(child)
  return root
}

function insertBefore(parent, newElement, beforeThis) {
  return parent.insertBefore(newElement, beforeThis)
}

function prevSibling (el) {
  return el.previousSibling
}

function nextSibling (el) {
  return el.nextSibling
}

function textEl (text) {
  return __document.createTextNode(text)
}

// ### append(root[, child || body])
// Append dom elements
function append (root, child) {
  if (typeof root === 'string') root = qs(root)
  if (typeof child === 'string') child = qs(child)
  if (!root) root = __document.body
  // Node types https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType#Constants
  if (root.nodeType === Node.ELEMENT_NODE) {
    if (!Array.isArray(child)) child = [child]
    var i = 0
    while (i < child.length) {
      var c1 = child[i]
      if (c1 && c1.nodeType && c1.nodeType === 1) {
        root.appendChild(c1)
      }
      i += 1
    }
  }
}

function htmlEl (name, attrs) {
  var el = __document.createElement(name)
  if (attrs) {
    if (attrs.text) {
      append(el, textEl(attrs.text))
    }
    attr(el, attrs)
  }
  return el
}

// Adapted from http://www.quirksmode.org/js/events_properties.html
function eventTarget (e) {
  e = e || __window.event
  var targ = e.target || e.srcElement
  if (targ.nodeType === 3) { // defeat Safari bug
    targ = targ.parentNode
  }
  return targ
}

function addEvents (el, events, handlerContext, capture) {
  // console.warn('addEvents', el, events, handlerContext)
  for (var i = 0; i < events.length; i += 1) {
    el.addEventListener(events[i], handlerContext, capture)
  }
}

function removeEvents (el, events, handlerContext, capture) {
  for (var i = 0; i < events.length; i += 1) {
    el.removeEventListener(events[i], handlerContext, capture)
  }
}

// ## mixinHandlers(AClass, events, capture)
//
// Implement the eventhandler interface on an object
//
// Calling this function on a class causes it to implement
//
//     handleEvent  - to call on<eventName>
//     eventsAttach - to attach event handlers to this.target
//     eventsDetach - remove event handlers
//
// @param {Object} AClass The object to attach to
// @param {Object} events The events to handle
// @param {Boolean} capture Should we capture events?
//
function mixinHandlers (AClass, events, capture) {
  AClass[__proto].handleEvent = function (ev) {
    console.warn('handleEvent', this)
    var target = eventTarget(ev)
    if (this.ondefaultHandler) {
      this.ondefaultHandler(ev, target)
    }
    var fn = this['on' + ev.type]
    if (fn) return fn.call(this, ev, target)
  }
  var evs = Object.keys(events)
  for (var i = 0; i < evs.length; i += 1) {
    var ev = evs[i]
    AClass[__proto]['on' + ev] = events[ev]
  }
  AClass[__proto].eventsAttach = function () {
    if (!this.parentEl) throw new Error('Need this.parentEl to be a DOM element')
    addEvents(this.parentEl, evs, this, capture)
  }
  AClass[__proto].eventsDetach = function () {
    removeEvents(this.parentEl, evs, this, capture)
  }
}

// ## mixinDom(DefinedClassName)
//
// Mixin function
//
//   * Class.create(): To create an instance of the class setting this.el to be
//     the dom element
//
// and prototype methods
//
//   * render(templateOpts): Render templates to non attached DOM in this.dom.
//     Calls this.afterRender()
//   * attach(el): Attach to an element.  Calls this.eventsAttach() and
//     this.afterAttach()
//   * detach(): Detach.  Calls this.beforeDetach() and this.eventsDetach()
//
// The constructor should define the parent to which this element will be
// attached.
//
function mixinDom (AClass) {
  var origCreate = AClass.create
  AClass.create = function (o) {
    var a1
    // Run previously defined AClass.create functions to get an instance
    if (typeof origCreate === 'function') a1 = origCreate(o)
    else a1 = new AClass(o)
    o = o || {}
    a1 = extend(a1, o)
    return a1
  }
  AClass[__proto].render = function (o) {
    var h = __document.createElement('div')
    var f = __document.createDocumentFragment()
    var i
    o = o || {}
    this.values = extend({}, this.values, o)
    h.innerHTML = this.tpl(this.values)
    // Count of the number of children that the dom fragment contains
    this.domCount = 0
    while ((i = h.firstChild)) {
      f.appendChild(i)
      this.domCount += 1
    }
    // XXX Check
    if (this.domCount === 0) throw new Error('this.domCount is 0')
    this.dom = f
    if (typeof this.afterRender === 'function') this.afterRender()
    return this
  }
  AClass[__proto].attach = function (parent) {
    if (!parent) parent = this.parentEl
    parent = (typeof parent === 'string') ? qs(parent) : parent
    if (!parent) throw new Error('No such parent el: ' + parent)
    if (this.domCount === 0) this.render()
    if (this.dom) {
      parent.appendChild(this.dom)
    }
    this.parentEl = parent
    if (typeof this.eventsAttach === 'function') this.eventsAttach()
    if (typeof this.afterAttach === 'function') this.afterAttach()
    return this
  }
  AClass[__proto].detach = function () {
    if (typeof this.beforeDetach === 'function') this.beforeDetach()
    if (typeof this.eventsDetach === 'function') this.eventsDetach()
    while (this.domCount > 0) {
      removeChild(this.parentEl, this.parentEl.lastChild)
      this.domCount -= 1
    }
  }
  // TODO
  AClass[__proto].update = function (o) {
    this.detach()
    this.renderModel()
    this.attach()
  }
}

function mixinHideShow (AClass) {
  AClass[__proto].hide = function () {
    classAdd(this.parentEl, 'hidden')
  }
  AClass[__proto].show = function () {
    classRemove(this.parentEl, 'hidden')
  }
}

// TODO setRequestHeader
function xhr (o, cb) {
  var xhr1 = new XMLHttpRequest()
  var method = o.method || 'GET'
  xhr1.open(method, o.url)
  xhr1.onreadystatechange = function () {
    if (xhr1.readyState === 4) {
      if (xhr1.status < 300) {
        cb(null, xhr1.response)
      } else {
        cb(xhr1.status + ' ' + xhr1.statusText)
      }
    }
  }
  for (var prop in o) {
    if (prop === 'url' || prop === 'method' || prop === 'data') continue
    xhr1[prop] = o[prop]
  }
  xhr1.send(o.data)
}

function mixinGetSet (AClass, prop, defaultValue) {
  AClass.prototype[prop] = function (value) {
    var change
    if (typeof value !== 'undefined') {
      this.model[prop] = parseInt(value, 10)
      change = true
    }
    if (typeof this.model[prop] === 'undefined') {
      this.model[prop] = defaultValue
      change = true
    }
    if (change) {
      var cb = this.subscriptions['Change' + ucFirst(prop)]
      if (typeof cb === 'function') cb()
    }
    return this.model[prop]
  }
}

function IterElems (els, i) {
  this.elems = els
  this.index = i || 0
}

IterElems.prototype = {
  next: function () {
    this.index += 1
    if (this.index === this.elems.length) this.index = 0
    return this.elems[this.index]
  },
  prev: function () {
    this.index -= 1
    if (this.index === -1) this.index = this.elems.length - 1
    return this.elems[this.index]
  },
  step: function (s) {
    if (s > 0) return this.next()
    return this.prev()
  },
  get: function () {
    return this.elems[this.index]
  },
  set: function (pos) {
    if (typeof pos === 'number') {
      this.index = pos
    } else {
      this.index = this.elems.indexOf(pos)
    }
    return this.elems[this.index]
  }
}

// TODO deprecate
function mixinFocus (context, obj, elName, className) {
  obj.focus = function () {
    if (!obj[elName]) throw new Error('Need obj[' + elName + ']')
    if (context.lastEl) classRemove(context.lastEl, className)
    classAdd(obj[elName], className)
    context.lastEl = obj[elName]
  }
}

function createView (bp, AClass, proto, handlers, args) {
  if (!bp.model) throw new Error('Need bp.model')
  if (!bp.live) throw new Error('Need bp.live')
  if (!AClass.mixedIn) {
    if (!proto.tpl) throw new Error('Need proto.tpl function for markup')
    if (!proto.renderModel) throw new Error('Need proto.renderModel')
    if (!proto.handleKey) {
      console.warn('installing default handleKey for', AClass.name)
      proto.handleKey = function (o) {
        console.warn('No key handling', o)
        return false
      }
    }
    AClass.prototype = proto
    // TODO move elsewhere
    AClass.prototype.emit = function (ev, arg) {
      this.model.dispatch(ev, arg)
    }
    mixinDom(AClass)
    mixinHandlers(AClass, handlers)
    AClass.mixedIn = true
  }
  args = args || {}
  if (!args.id) throw new Error('Need args.id')
  args.model = bp.model
  args.parentEl = $id(args.id)
  var obj = AClass.create(args)
  mixinFocus(bp.focus, obj, 'parentEl', 'focus')
  bp.live[args.id] = obj
}

function lcFirst (text) {
  return text[0].toLowerCase() + text.slice(1)
}

function ucFirst (text) {
  return text[0].toUpperCase() + text.slice(1)
}
