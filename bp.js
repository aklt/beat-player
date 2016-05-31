/* d, __window */
(function () {
  // // # a.js  =  Functions for node and the browser
var ab = {}
var __slice = [].slice
var __hasProp = {}.hasOwnProperty

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
    for (var k in objOrArray) {
      var v = objOrArray[k]
      fn(k, v)
    }
  }
}

// ## String getId([identifier[, separator]])
var _id_counter = {}

function getId (identifier, separator) {
  identifier = identifier || 'id'
  separator = separator || '_'
  var count = _id_counter[identifier] || 0
  _id_counter[identifier] = count + 1
  return identifier + separator + count.toString(36)
}

// ## withMatches(matchers)(tokens, repeat)
//
// Apply array of (regex, func) to mathing tokens.
//
// If repeat is true continue applying after first match
//
function withMatches (matchers) {
  if (matchers.length % 2) matchers.splice(matchers.length - 1, 0, /.*/)
  return function (tokens, repeat) {
    if (!Array.isArray(tokens)) tokens = [tokens]
    for (var i = 0; i < matchers.length; i += 2) {
      for (var j = 0; j < tokens.length; j += 1) {
        var token = tokens[j]
        if (matchers[i].test(token)) {
          var value = matchers[i + 1].apply(
            matchers[i + 1], matchers[i].exec(token))
          if (!repeat) return value
        }
      }
    }
  }
}

// # rand(min, max) return a real number between [min; max]
function rand (min, max) {
  min = min || 0
  max = max || 1
  var n = max - min
  return min + n * Math.random()
}

function randInt (min, max) {
  min = min || 0
  max = max || 1
  var n = max - min + 1
  return Math.floor(min + n * Math.random())
}

// ## range(begin, end, step, method)
// @returns range Array or result of method applied to range
function range (begin, end, step, method) {
  step = step || 1
  var r = []
  if (typeof method !== 'function') {
    method = function () {
      r.push(i)
    }
  }
  for (var i = begin; i !== end; i += step) {
    r.push(method(i))
  }
  return r
}

// ## delay(time, fun, scope, args...)
function delay (/* time, fun, ... */) {
  var a = __slice.call(arguments)
  setTimeout(function () {
    a[1].apply(a[2], a.slice(3))
  }, a[0])
}

/*global clearTimeout, setTimeout*/
// ## debounce(fn, delay)
//
// Call the function fn once after a delay
// regardless of how many events arrive.
//
// See also throttle.js
//
// From http://remysharp.com/2010/07/21/throttling-function-calls/
function debounce (delay, fn) {
  var timer = null
  return function () {
    var context = this
    var args = arguments
    clearTimeout(timer)
    timer = setTimeout(function () {
      fn.apply(context, args)
    }, delay)
  }
}

// ## String template(tplString)(varObject)
// Templating
//
// Usage:
//  var hello = t("Hello, #{this.name || 'world'}!")
//
//  console.log( // => "Hello, Jed!"
//    hello({name: "Jed"})
//  )
//
// Copyright (C) 2011 Jed Schmidt <http://jed.is> - WTFPL
// More: https://gist.github.com/964762
/*eslint-disable*/
function templateJed(
  a, // the string source from which the template is compiled
  b  // the default 'with' context of the template (optional)
  ){
  return function(
    c, // the object called as 'this' in the template
    d  // the 'with' context of this template call (optional)
    ){
    return a.replace(
      /\${([^}]*)}/g, // a regexp that finds the interpolated code: "${<code>}"
      function(
        a, // not used, only positional
        e  // the code matched by the interpolation
      ){
        return Function(
          "x",
          "with(x)return " + e // the result of the interpolated code
        ).call(
          c,    // pass the data object as 'this', with
          d     // the most
          || b  // specific
          || {} // context.
        )
      }
    )
  }
}
/*eslint-enable*/

// ## path(String|Object, Undefined|String)
//
// 2 Versions:
//
// path(String) => Object
function path (obj, action, value) {
  var to = type(obj)
  var ta = type(action)

  if (typeof to === 'string') {
    // Return Path object
  } else if (typeof to === 'object') {
    if (typeof ta === 'string') {
      if (typeof value === 'undefined') {
        // return value at index
      } else {
        // Assign
      }
    } else if (typeof ta === 'object') {
      // Object of regexps to run over the obj object
    }
  }
}

// ## pathAt(object, path[, value])
//
// get or set a value in an object
//
// Returns
//
// * object{path: value} with path keys and the values
path.at = function at (obj, pathArray, value) {
  var key
  var i = 0
  var ci = obj
  var last
  if (typeof pathArray === 'string') pathArray = pathArray.split(/\/+/g)
  if (typeof value !== 'undefined') {
    for (; i < pathArray.length; i += 1) {
      key = pathArray[i]
      last = ci
      if (typeof ci[key] !== 'object' || Array.isArray(ci[key])) ci[key] = {}
      ci = ci[key]
    }
    last[pathArray[i - 1]] = value
  } else {
    for (; i < pathArray.length - 1; i += 1) {
      key = pathArray[i]
      ci = ci[key]
      if (!ci) return null
    }
    return ci[pathArray[i]]
  }
}

// ## pathExplode(obj)
//
// Return an object exploded
//
path.explode = function explode (obj) {
  var result = {}
  for (var k in obj) {
    var v = obj[k]
    var o = result
    var parts = k.split(/\/+/)
    var last

    parts.forEach(function handlePart (part) {
      if (!part) return
      if (!o[part]) o[part] = {}
      last = o
      o = o[part]
    })
    last[parts[parts.length - 1]] = v
  }
  return result
}

// ## pathImplode(obj)
//
// Return An object of keys and values 1 deep
//
// The leading HIDE comment tells sd not to include this function.
function _pathImplode (obj, path, result) {
  for (var k in obj) {
    var v = obj[k]
    if (typeof v !== 'object' || Array.isArray(v)) {
      var key = path.concat(k).join('/')
      result[key] = v
    } else {
      _pathImplode(v, path.concat(k), result)
    }
  }
  return result
}

path.implode = function implode (obj) {
  return _pathImplode(obj, [], {})
}

// ## path.str(obj)
//
// Create a string from the path object
path.str = function str (obj) {
  var path = []
  var imploded = _pathImplode(obj, [], {})

  for (var k in imploded) {
    var v = imploded[k]
    if (imploded.hasOwnProperty(k)) {
      path.push(k + ':' + v)
    }
  }
}

// Returns
//
// * {Array[String:The key and JSON value]}
path.lines = function lines (obj) {
  var result = []

  for (var k in obj) {
    var v = obj[k]
    result.push(k + ' ' + JSON.stringify(v))
  }
  return result
}

// ## pathMatch(object, regexp|string[, fun|num])
//
// match the leaf keys of an object to a regex and return
// an object of paths and values of the match.
//
// Returns
//
// * pathMatch(object, rx)              returns an object of paths and values
// * pathMatch(object, rx, limit)       matches max limit keys
// * pathMatch(object, rx, fun)         returns an array of fun(key, value) if rx matches
// * pathMatch(object, rx, fun, limit)  returns an array of matches of max size
// The leading HIDE comment tells sd not to include this function.
function _match (obj, rx, path, fun, results, count) {
  // console.warn('m', arguments)
  if (count && count === 0) return results
  var val, result
  for (var k in obj) {
    val = obj[k]
    if (typeof val !== 'object' || Array.isArray(val)) {
      if (rx.test(k)) {
        if (fun) {
          result = fun(k, val)
          if (result) {
            results.push(result)
          }
        } else {
          results[path.concat(k).join('/')] = val
        }
        if (count) count -= 1
        if (count === 0) return results
        continue
      }
    }
  }
  if (count >= 0) return _match(val, rx, path.concat(k), fun, results, count)
  return result
}

// dEprecate
path.match = function match (obj, rx, fun) {
  if (typeof rx === 'string') rx = new RegExp(rx)

  var result = {}
  var count = -1

  if (fun) {
    if (typeof fun === 'number') {
      if (fun <= 0) throw new Error('pathMatch: count must > 0')
      count = fun
      fun = null
    } else {
      result = []
    }
  }

  _match(obj, rx, [], fun, result, count)
  return result
}

// ## pathObj(obj, match)
//
// Returns
//
// * an object of all leaves matching 'match'
function _pathObj (obj, match, result, path, hadResult) {
  var k
  var val
  var objs = []
  for (k in obj) {
    val = obj[k]
    if (typeof val !== 'object' || Array.isArray(val)) {
      if (match.test(k)) {
        var o = result
        var last = o
        for (var i = 0; i < path.length; i += 1) {
          var node = path[i]
          last = o
          if (!o[node]) last = o[node] = {}
          o = o[node]
          hadResult = true
        }
        last[k] = val
      }
      continue
    }
    objs.push(k)
  }
  for (var j = 0; j < objs.length; j += 1) {
    k = objs[j]
    hadResult = _pathObj(obj[k], match, result, path.concat(k), hadResult)
  }
  return hadResult
}

path.obj = function obj (obj1, match) {
  match = match || ''
  match = typeof match === 'string' ? new RegExp(match) : match
  var result = {}
  var hadResult = _pathObj(obj1, match, result, [], hadResult)
  if (hadResult) return result
}

function peek (arr1, at, to) {
  to = to || null
  at = at || 0
  if (!to) {
    if (at === -1) return arr1[arr1.length - 1]
    return arr1[at % arr1.length]
  }
  return arr1.slice(at, to)
}

ab.version = 1
ab.type = type
ab.peek = peek
ab.extend = extend
ab.each = each
ab.getId = getId
ab.withMatches = withMatches
ab.rand = rand
ab.randInt = randInt
ab.range = range
ab.delay = delay
ab.debounce = debounce
ab.path = path
ab.withMatches = withMatches

  // /*global extend,__slice, Node, XMLHttpRequest, ab */
// # b.js  -  Functions the browser

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

function $id (name, con) {
  return (con || __document).getElementById(name)
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

// Generate #xxxxxx color strings where each of the RGB factors are in the
// range [min;max]
var goldenRatio = (1 + Math.sqrt(5)) / 2
function newColor (num, min, max) {
  max = max || 0xFF
  min = min || 0x7F

  var result = ''
  var range = max - min

  for (var i = 1; i < 4; i += 1) {
    var n = i * num * goldenRatio
    var v = n - (n | 0)
    v *= range + min
    var s = (v | 0).toString(16)

    if (s.length < 2) s = '0' + s
    result += s
  }
  return '#' + result
}

// ## browser.rect(node)
//
// Get position rect of an element or text node
function rect (node) {
  if (node.nodeType === 3 && __document.createRange) {
    var range = __document.createRange()
    range.selectNodeContents(node)
    if (range.getBoundingClientRect) {
      return range.getBoundingClientRect()
    }
  } else if (node.getBoundingClientRect) {
    return node.getBoundingClientRect()
  }
}

var _readyFuncs = []
var _loaded
function ready (fn) {
  if (_loaded) return fn()
  _readyFuncs.push(fn)
  if (_readyFuncs.length === 1) {
    __document.addEventListener('DOMContentLoaded', function (ev) {
      _loaded = 1
      for (var i = 0; i < _readyFuncs.length; i += 1) {
        _readyFuncs[i]()
      }
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

// ### dom(html[, html, ...])
// Create dom elements from html strings
function createDomArray (o) {
  var h = __document.createElement('div')
  h.innerHTML = o.html
  return __slice.call(h.childNodes)
}

function readTemplates (id) {
  var el = id
  if (typeof id === 'string') el = qs(id)
  if (!el.innerText) throw new Error('No innerText')

  var templates = {}
  var templateName
  el.innerText.split(/\n/).concat(['']).forEach(function (line) {
    if (/^(?: |\t)+/.test(line)) {
      if (typeof templateName === 'string') {
        if (!templates[templateName]) templates[templateName] = []
        templates[templateName].push(line.replace(/^\s+/, ''))
      }
    } else {
      var keyEndIndex = line.indexOf(':')
      if (keyEndIndex > -1) {
        if (templates[templateName]) {
          templates[templateName] = templates[templateName].join('\n')
        }
        templateName = line.slice(0, keyEndIndex)
        templates[templateName] = [line.slice(keyEndIndex + 1).replace(/^\s+/, '')]
      }
    }
  })
  return templates
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

function removeChild (root, child) {
  return root.removeChild(child)
}

function appendChild (root, child) {
  root.appendChild(child)
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
  console.warn('addEvents', el, events, handlerContext)
  for (var i = 0; i < events.length; i += 1) {
    el.addEventListener(events[i], handlerContext, capture)
  }
}

function removeEvents (el, events, handlerContext, capture) {
  for (var i = 0; i < events.length; i += 1) {
    el.removeEventListener(events[i], handlerContext, capture)
  }
}

/* {{{1 Mixins */

var __proto = 'prototype'

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
    var fn = this['on' + ev.type]
    if (fn) return fn.call(this, ev, eventTarget(ev))
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
  AClass.create = function (o) {
    var a1 = new AClass(o)
    o = o || {}
    a1 = extend(a1, o)
    if (typeof o.el === 'string') a1.el = qs(o.el)
    else a1.el = o.el
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
    if (this.domCount <= 0) throw new Error('Boo')
    this.dom = f
    if (typeof this.afterRender === 'function') this.afterRender()
    return this
  }
  AClass[__proto].attach = function (parent) {
    if (!parent) parent = this.parentEl
    parent = (typeof parent === 'string') ? qs(parent) : parent
    if (!parent) throw new Error('No such parent el: ' + parent)
    if (this.domCount === 0) this.render()
    if (!this.dom) throw new Error('Need to render before')
    parent.appendChild(this.dom)
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
  AClass[__proto].update = function (o) {
    this.detach()
    this.render(o)
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

// 1}}} Mixins

// Simple JavaScript Templating
// John Resig - http://ejohn.org/ - MIT Licensed
var templateResigCache = {}

/*eslint-disable*/
function templateResig (str, data) {
  // Figure out if we're getting a template, or if we need to
  // load the template - and be sure to cache the result.
  var fn = !/\W/.test(str) ?
    templateResigCache[str] = templateResigCache[str] ||
      templateResig(__document.getElementById(str).innerHTML) :

    // Generate a reusable function that will serve as a template
    // generator (and which will be cached).
    new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +

      // Convert the template into pure JavaScript
      str
        .replace(/[\r\t\n]/g, " ")
        .split("<%").join("\t")
        .replace(/((^|%>)[^\t]*)'/g, "$1\r")
        .replace(/\t=(.*?)%>/g, "',$1,'")
        .split("\t").join("');")
        .split("%>").join("p.push('")
        .split("\r").join("\\'")
    + "');}return p.join('');");


  // console.warn('tpl', fn)
  // Provide some basic currying to the user
  return data ? fn( data ) : fn;
}
/*eslint-enable*/

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

// {{{1 Elem
// ## Elem
//
// Render an element
//
// # Elem(options[, context])
//
// Elem objects control child DOM elements rendered from template objects:
//
//   * render(o): Create the dom fragment from the '.tpl' property
//   * attach(values): Add the dom fragment and register a reference to it.
//
//     Once attached:
//
//       * '.css' Update css properties
//
//   * detached: Removed from document
//
//
function Elem (o) {
  o = o || {}
  if (!o.tpl) throw new Error('Need o.tpl(values) function')
  if (!o.parent) throw new Error('Need o.parent')
  extend(this, o)
  return this
}

Elem.create = function createElem (o) {
  var e1 = new Elem(o)
  if (o.handlers) mixinHandlers(e1, 'parentEl', o.handlers)
  return e1
}

Elem.prototype = {
  // ## elem.render()
  //
  // Render 'this.tpl' to 'this.html' to the 'this.dom' fragment
  //
  render: function (o) {
    var h = __document.createElement('div')
    var f = __document.createDocumentFragment()
    var i
    o = o || {}
    this.values = extend({}, this.values, o)
    h.innerHTML = this.tpl(this.values)
    while ((i = h.firstChild)) f.appendChild(i)
    this.dom = f
    if (typeof this.afterRender === 'function') this.afterRender()
    return this
  },
  // ### attach({options}, id)
  //
  // Attach this element to element 'id' in the dom applying the template if needed
  //
  attach: function (o) {
    if (!this.parentEl) this.parentEl = $id(this.parent)
    if (!this.parentEl) throw new Error('No such parent el: ' + this.parent)
    if (!this.dom) this.render(o)
    this.parentEl.appendChild(this.dom)
    this.el = this.parentEl.lastChild
    if (typeof this.eventsAttach === 'function') this.eventsAttach()
    if (typeof this.afterAttach === 'function') this.afterAttach()
    return this
  },
  // ### detach()
  //
  // Remove this element from the dom
  detach: function () {
    if (typeof this.beforeDetach === 'function') this.beforeDetach()
    if (typeof this.eventsDetach === 'function') this.eventsDetach()
    if (this.dom) {
      removeChild(this.parentEl, this.el)
      this.dom = null
    }
  },
  // ### update(tplOptions)
  // Re-render the template with new options
  update: function (o) {
    console.warn('update', o)
    this.detach()
    this.attach(o)
  },
  // ### hide()
  // Hide this element
  hide: function hide () {
    this._display = this.el.style.display
    this.el.style.display = 'none'
    return this
  },
  // ### show()
  // Show this element (default)
  show: function show () {
    this.el.style.display = this._display || 'block'
    delete this._display
    return this
  },
  // ### css(cssObject)
  // Change some css for this object
  css: function (o) {
    css(this.el, o)
  }
}

// 1}}} Elem

ab.classAdd = classAdd
ab.classRemove = classRemove
ab.qs = qs
ab.qa = qa
ab.$id = $id
ab.css = css
ab.color = newColor
ab.rect = rect
ab.readTemplates = readTemplates
ab.template = templateResig
ab.ready = ready
ab.attr = attr
ab.dom = dom
ab.remove = removeChild
ab.append = append
ab.xhr = xhr
ab.mix = {}
ab.mix.dom = mixinDom
ab.mix.handlers = mixinHandlers
ab.htmlEl = htmlEl
ab.Elem = Elem

  // /*global __window extend xhr AudioContext webkitAudioContext */
// # BeatModel
//
// Represents the model of the current beat.
//
// Holds all data of the current beat and is referenced from all Views.
//
// TODO Add subscriptions to events

var bp = __window.bp = {}
bp.test = {}

function BeatModel (text) {
  this.model = {
    instruments: []
  }
  this.subscriptions = {}
  if (typeof text === 'string') this.readBeatText(text)
}

BeatModel.defaultInstrument = {
  name: 'Unknown Instrument',
  url: 'Unknown URL',
  range: null
}

var subscriptionEvents = {
  NewText: 1,
  ChangeBpm: 1,
  ChangeTpb: 1,
  ChangeBeats: 1,
  ChangeNote: 1,
  SelectInstrument: 1,
  SelectInstrumentRange: 1
}

BeatModel.prototype = {
  subscribe: function (ev, cb, context) {
    if (!subscriptionEvents[ev]) throw new Error('Illegal event name ' + ev)
    if (!this.subscriptions[ev]) this.subscriptions[ev] = []
    if (!context) context = this
    this.subscriptions[ev].push([cb, context])
  },
  dispatch: function (ev, data) {
    if (!subscriptionEvents[ev]) throw new Error('Illegal subscription event name ' + ev)
    var cbs = this.subscriptions[ev] || []
    console.warn('dispatch', ev, data)
    if (!cbs.disabled) {
      for (var i = 0; i < cbs.length; i += 1) {
        var cb = cbs[i]
        console.warn('  call', cb[0].name, data)
        cb[0].call(cb[1], data)
      }
    }
  },
  // Read a text pattern without instruments
  readBeatText: function (text) {
    var patterns = this.model.patterns = {}
    var patternIndex = 0
    var patternInstruments = {}
    var lines = text.split(/\n/)
    var patternLpb
    var patternBars
    var instrument
    var line
    for (var i = 0; i < lines.length; i += 1) {
      line = lines[i]
      if (/^\s*$/.test(line)) continue
      if (/^\s*#/.test(line)) continue
      if (/^--/.test(line)) break
      var idx = line.indexOf(':')
      if (idx < 0) throw new Error('Bad pattern format on line ' + i)
      instrument = line.slice(0, idx).trim()
      patternInstruments[instrument] = {}
      line = line.slice(idx + 1).trim()
      var rawChars = line.split('')
      var chars = []
      var k
      var ch
      var tpb = -1
      var beats = 0
      var lastLpb = -1
      for (k = 0; k < rawChars.length; k += 1) {
        ch = rawChars[k]
        if (ch === ' ') {
          beats += 1
          if (tpb === -1) {
            tpb = k
            lastLpb = k
          } else {
            if (k - lastLpb - 1 !== tpb) {
              console.warn(new Error('Bad tpb ' + lastLpb + ' ' + k))
            }
          }
        } else {
          chars.push(ch)
        }
      }
      patterns[patternIndex] = {}
      for (k = 0; k < chars.length; k += 1) {
        ch = chars[k]
        if (ch !== '.') {
          patterns[patternIndex][k] = ch
          patternInstruments[instrument][ch] = patternIndex
        }
      }
      patternIndex += 1
      beats += 1
      patternLpb = tpb
      patternBars = beats
    }
    this.model.tpb = patternLpb
    this.model.beats = patternBars

    // Read samples/instruments
    i += 1
    var instruments = {}
    instrument = null
    var m
    for (; i < lines.length; i += 1) {
      line = lines[i]
      if (/^\s*$/.test(line)) continue

      // instrument name
      m = /^(\w+[\w\s]+):/.exec(line)
      if (m) {
        instrument = m[1].trim()
        instruments[instrument] = {}
        if (!patternInstruments[instrument]) {
          console.warn('Unused instrument', instrument)
        }
        continue
      }

      // instrument properties
      m = /^\s+([\w]+):(.*)/.exec(line)
      if (m) {
        if (!instrument) {
          throw new Error('Expected an instrument name at line ' + i + 1)
        }
        instruments[instrument][m[1]] = m[2].trim()
      }
    }

    var ins = this.model.instruments = {}
    Object.keys(patternInstruments).forEach(function (name, i) {
      var obj = {
        name: name
      }
      if (!instruments[name]) {
        throw new Error('Undefined instrument used: ' + name)
      }
      for (var k in instruments[name]) {
        obj[k] = instruments[name][k]
      }
      ins[i] = obj
    })
    var cb = this.subscriptions.NewText
    if (typeof cb === 'function') cb(this)
  },
  // Load a beat including samples
  load: function (url, cb) {
    var self = this
    this.loadBeat(url, function (err) {
      if (err) return cb(err)
      self.loadBeatSamples(function (err, model) {
        if (err) return cb(err)
        cb(null, model)
      })
    })
  },
  // Load a beat text
  loadBeat: function (url, cb) {
    var self = this
    xhr({
      url: url
    }, function (err, data) {
      if (err) return cb(err)
      self.readBeatText(data)
      cb(null, self)
    })
  },
  // Load the samples referenced
  loadBeatSamples: function (cb) {
    var instruments = this.model.instruments
    var ikeys = Object.keys(instruments)
    var self = this
    var count = 0
    // TODO Share the audio context
    var context = new (AudioContext || webkitAudioContext)()
    function loadOne (i) {
      xhr({
        url: instruments[i + ''].url,
        responseType: 'arraybuffer'
      }, function (err, result) {
        if (err) return cb(err)
        context.decodeAudioData(result, function (buffer) {
          instruments[i].buffer = buffer
          instruments[i].number = i + ''
          count += 1
          if (count === ikeys.length) return cb(null, self)
        })
      })
    }
    for (var i = 0; i < ikeys.length; i += 1) loadOne(i)
    // TODO: mixin and effects
  },
  // TODO Return a text string representing the pattern
  getPattern: function () {

  },
  instruments: function (changeUrls) {
    if (!changeUrls) {
      // TODO This is a bit strange
      var inst = this.model.instruments
      var keys = Object.keys(inst)
      var result = []
      for (var i = 0; i < keys.length; i += 1) {
        var i1 = inst[keys[i]]
        result.push(extend({number: keys[i]}, i1))
      }
      return result
    }
    throw new Error('TODO: set instruments')
  },
  patterns: function (newPatterns) {
    if (!newPatterns) return this.model.patterns
    throw new Error('TODO: set patterns')
  },
  patternLength: function (newLength) {
    if (!newLength) return this.tpb() * this.beats()
    throw new Error('TODO: set patternLength')
  },
  // ## Modifying the model with getters and setters
  instrument: function (number) {
    number = number || this.model.selectedInstrument
    var i1 = this.model.instruments[number]
    if (!i1) {
      i1 = extend({}, BeatModel.defaultInstrument, {number: number})
      this.model.instruments[number] = i1
    }
    return i1
  },
  selectedInstrument: function (number) {
    if (!number) return this.model.selectedInstrument
    number += ''
    this.model.selectedInstrument = number
    this.dispatch('SelectInstrument', number)
  },
  selectedInstrumentRange: function (range) {
    var i1 = this.selectedInstrument()
    this.model.instruments[i1] = extend({},
      this.model.instruments[i1] || BeatModel.defaultInstrument,
      {
        number: i1,
        range: range})
    this.dispatch('SelectInstrumentRange', range)
  },
  instrumentUrl: function (i, newUrl) {
    if (!newUrl) return this.model.instruments[i]
    this.model.instruments[i].url = newUrl
    var cb = this.subscriptions.ChangeUrl
    if (typeof cb === 'function') cb(this)
  },
  instrumentName: function (i, newName) {
    if (!newName) return this.model.instruments[i].name
    this.model.instruments[i].name = newName
    var cb = this.subscriptions.ChangeName
    if (typeof cb === 'function') cb(this)
  },
  toString: function () {
    return JSON.stringify(this.model, 0, 2)
  }
}

function mixinGetSet (AClass, prop, defaultValue) {
  AClass.prototype[prop] = function (value) {
    var change
    if (typeof value !== 'undefined') {
      this.model[prop] = value
      change = true
    }
    if (typeof this.model[prop] === 'undefined') {
      this.model[prop] = defaultValue
      change = true
    }
    if (change) {
      var cb = this.subscriptions['Change' + ucfirst(prop)]
      if (typeof cb === 'function') cb()
    }
    return this.model[prop]
  }
}

mixinGetSet(BeatModel, 'bpm', 100)
mixinGetSet(BeatModel, 'tpb', 4)
mixinGetSet(BeatModel, 'beats', 4)

function ucfirst (s) {
  return s[0].toUpperCase() + s.slice(1)
}

bp.test.beatModel = function () {
  var bm1 = new BeatModel()
  bm1.load('data/beat1.beat', function (err, model) {
    if (err) throw err
    console.warn('Loaded', model)
  })
}

/*global bp, AudioContext, webkitAudioContext, BeatModel*/

// # BeatAudio
//
// Load and play patterns and instruments
//
// See: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
//
function BeatAudio (model) {
  this.model = model
  this.instruments = model.instruments()
  // TODO There is a max. limit on the number of AudioContexts
  this.context = new (AudioContext || webkitAudioContext)()
  this.volume = this.context.createGain()
  this.volume.gain.value = 1
  this.volume.connect(this.context.destination)
  this.playing = []
  this.position = 0
  this.positionTime = 0
  this.lookaheadTime = 0.4
}

// divide notes on property `note.time` into buckets of `intervalTime` size
function timeBuckets (notes, intervalTime) {
  var time = intervalTime
  var buckets = [[]]
  var ibucket = 0
  var i = 0
  var note = notes[i]
  while (note && i < notes.length) {
    if (note.time < time) {
      buckets[ibucket].push(note)
    } else {
      ibucket += 1
      buckets[ibucket] = []
      time += intervalTime
      i -= 1
    }
    i += 1
    note = notes[i]
  }
  return buckets
}

BeatAudio.prototype = {
  // load and reset variables
  load: function (url, cb) {
    var self = this
    this.model.load(url, function (err, model) {
      if (err) return cb(err)
      self.calculateNoteBuckets()
      if (typeof cb === 'function') cb(null, self)
    })
  },
  // Schedule offset times of samples according to pattern
  calculateNoteBuckets: function () {
    var patterns = this.model.patterns()
    this.secondsPerTick = (60 / this.model.bpm()) / this.model.tpb()
    console.warn('bpm, secondsPerTick', this.model.bpm(), this.secondsPerTick)
    this.orderedNotes = []
    for (var instrumentNumber in patterns) {
      var notes = patterns[instrumentNumber]
      for (var offset in notes) {
        var key = notes[offset]
        this.orderedNotes.push({
          time: this.secondsPerTick * parseInt(offset, 10),
          instrument: instrumentNumber,
          key: key
        })
      }
    }
    this.orderedNotes.sort(function (a, b) { return a.time - b.time })
    this.noteBuckets = timeBuckets(this.orderedNotes, this.lookaheadTime)
    this.noteBucketsIndex = 0
  },
  // Start playback at pattern position
  play: function () {
    var self = this
    var ctx = this.context
    var time0 = ctx.currentTime
    var bucketIndex = this.noteBucketsIndex
    var length = this.noteBuckets.length
    var jitterTime = 0
    this.timeout = setInterval(function () {
      var timePassed = ctx.currentTime - time0
      var bucketTime = bucketIndex * self.lookaheadTime
      jitterTime = bucketTime - timePassed
      var bucket = self.noteBuckets[bucketIndex]
      for (var i = 0; i < bucket.length; i += 1) {
        var note = bucket[i]
        var xTime = self.lookaheadTime + note.time - bucketTime + jitterTime
        self.playSample(note.instrument, xTime)
        console.warn('playSample', bucketIndex, xTime)
      }
      bucketIndex += 1
      if (bucketIndex === length) {
        bucketIndex = 0
        time0 += timePassed
      }
    }, this.lookaheadTime * 1000)
  },
  // Stop all playing samples
  stop: function () {
    clearTimeout(this.timeout)
  },
  // Play a sample in `when` seconds
  playSample: function (i, when) {
    when = when || 0
    // detune = detune || 0
    var source = this.context.createBufferSource()
    var instrument = this.model.instruments()[i]
    if (!instrument) throw new Error('Please init')
    source.buffer = instrument.buffer
    source.connect(this.volume)
    // TODO Make ranges of notes
    // source.detune.value = detune
    // source.playbackRate.value = 2
    source.start(this.context.currentTime + when)
    source.onended = function () {
      this.ended = true
    }
    this.playing.push(source)
  },
  // Remove sounds that have been played drom this.playing
  removeEnded: function () {
    this.playing = this.playing.filter(function (s1) {
      return !s1.ended
    })
  }

  // TODO Mixing https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext
}

bp.BeatAudio = BeatAudio

bp.testBeatAudio = function () {
  var beat1Model = new BeatModel(beat1)
  var beat1 = bp.beat1 = new BeatAudio(beat1Model)
  beat1.model.bpm(90)
  beat1.load('data/beat0.beat', function (err, audio) {
    if (err) throw err
    console.warn('beat', beat1)
    beat1.play()
    setTimeout(function (o) {
      beat1.stop()
    }, 6000)
  })
}

/*global bp __document requestAnimationFrame htmlEl insertBefore
  appendChild, removeChild mixinDom mixinHandlers css qa qs classRemove classAdd
  rect attr nextSibling prevSibling $id mixinHideShow BeatModel */

const alphaNum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

const keyboardKeys = [
  '1234567890',
  'QWERTYUIOP',
  'ASDFGHJKL',
  'ZXCVBNM,.']

const keyboardKeyMap = {}

keyboardKeys.join('').split('').forEach(function (k, i) {
  keyboardKeyMap[k] = i
})

// TODO Remove this
function mixinFocus (AClass) {
  AClass.prototype.focus = function () {
    css(this.parentEl, {
      border: '1px solid blue'
    })
  }
  AClass.prototype.unfocus = function () {
    css(this.parentEl, {
      border: 'none'
    })
  }
}

// {{{1 KeyboardView
function KeyboardView (o) {
  o = o || {}
  this.ranges = o.ranges || [
    // Assumption: The array is sorted as the keyboard
    // and intervals do not overlap
    [1, 'U', 'F'],
    [2, 'Q', 'R'],
    [3, 'B', 'M']
  ]
  o.model.selectedInstrument(o.selectedInstrument || 3)
  // properties on o added
}

KeyboardView.prototype = {
  tpl: function (o) {
    o = o || {}
    return bp.templates.keyboard(keyboardKeys.map((row, j) => {
      var keys = ''
      var chars = row.split('')
      if (j === 0) return bp.templates.keyboardRow(chars)
      for (var i = 0; i < chars.length; i += 1) {
        var ch = chars[i]
        keys += '<i>' + ch + '</i>'
      }
      return (j > 1 ? ' ' : '') + keys
    }))
  },
  // Add span around key range
  markRange: function (beginEl, endEl, instrumentNumber) {
    var begin = beginEl
    var end = endEl
    if (keyboardKeyMap[begin.innerText] > keyboardKeyMap[end.innerText]) {
      begin = endEl
      end = beginEl
    }
    this.model.selectedInstrumentRange([begin.innerText, end.innerText])
    var span = htmlEl('span', {'class': 'color' + instrumentNumber})
    span = insertBefore(begin.parentNode, span, begin)
    while (1) {
      var next = begin.nextSibling
      appendChild(span, begin)
      if (begin === end) break
      begin = next
      if (!begin) break
    }
  },
  findElTypeWithInnerText: function (elType, character) {
    var keys = qa(elType, this.parentEl)
    for (var i = 0; i < keys.length; i += 1) {
      var k1 = keys[i]
      if (k1.innerText === character) return k1
    }
  },
  afterAttach: function (el) {
    // Select the active sample
    var samples = qa('b', this.parentEl)
    if (this.lastInstrumentEl) classRemove(this.lastInstrumentEl, 'active-instrument')
    for (var i = 0; i < samples.length; i += 1) {
      var s1 = samples[i]
      // console.warn('afterRender', s1.innerText, this.model.selectedInstrument())
      if (s1.innerText === this.model.selectedInstrument()) {
        classAdd(s1, 'active-instrument')
        this.lastInstrumentEl = s1
        break
      }
    }
    // Set selected ranges
    for (i = 0; i < this.ranges.length; i += 1) {
      var assignment = this.ranges[i]
      var begin = this.findElTypeWithInnerText('i', assignment[1])
      var end = this.findElTypeWithInnerText('i', assignment[2])
      this.markRange(begin, end, assignment[0])
    }
  },
  selectInstrument: function (sample, el) {
    if (!el) el = this.findElTypeWithInnerText('b', sample)
    if (this.lastInstrumentEl) {
      classRemove(this.lastInstrumentEl, 'active-instrument')
    }
    classAdd(el, 'active-instrument')
    this.lastInstrumentEl = el
    this.model.selectedInstrument(sample)
  }
}

mixinDom(KeyboardView)
mixinHandlers(KeyboardView, {
  click: function (event, el) {
    // Instrument
    if (el.nodeName === 'B') {
      this.selectInstrument(el.innerText, el)
    // Keyboard layout
    } else if (el.nodeName === 'I') {
      var parentName = el.parentNode.nodeName
      if (parentName === 'PRE') {
        // Define range for instrument and surround with a span
        if (this.lastKeyEl) {
          classRemove(this.lastKeyEl, 'active-key')
          this.markRange(this.lastKeyEl, el, this.model.selectedInstrument())
          this.lastKeyEl = null
        // Mark the start of the range
        } else {
          classAdd(el, 'active-key')
          this.lastKeyEl = el
        }
      } else if (parentName === 'SPAN') {
        var span = el.parentNode
        var top = span.parentNode
        while ((el = span.firstChild)) {
          insertBefore(top, el, span)
        }
        removeChild(top, span)
        this.model.selectedInstrumentRange()
      }
    }
    this.focus()
  }
})

mixinFocus(KeyboardView)

KeyboardView.prototype.keyLeft = function (ev, el) {
  console.warn(ev, el)
}
KeyboardView.prototype.keyRight = function (ev, el) {
  console.warn(ev, el)
}
KeyboardView.prototype.keyUp = function (ev, el) {
  console.warn(ev, el)
}
KeyboardView.prototype.keyDown = function (ev, el) {
  console.warn(ev, el)
}
// 1}}} KeyboardView

// {{{1 ScoreColumns
function ScoreColumns (el) {
  // console.warn(type(el));
  this.els = qa('* p', el).filter(function (el1) {
    return el1.childNodes.length > 1
  })
  this.selectedIndex = -1
  this.selectedEl = this.els[this.selectedIndex]
  this.lastSelectedEl = this.selectedEl
  console.warn('els', this.els)
}

ScoreColumns.prototype = {
  step: function (units) {
    if (!units) units = 1
    this.selectedIndex += units
    if (this.selectedIndex >= this.els.length) this.selectedIndex = 0
    this.lastSelectedEl = this.selectedEl
    this.selectedEl = this.els[this.selectedIndex]

    if (!this.selectedEl) throw new Error('BAd ' + this.selectedIndex)
    if (this.lastSelectedEl) classRemove(this.lastSelectedEl, 'active')
    classAdd(this.selectedEl, 'active')
  }
}
// 1}}} ScoreColumns

// {{{1 PlayerView
function PlayerView (o) {
  o = o || {}
  // this.parentEl = ab.dom('<div class="player"></div>')
  // if (typeof this.parentEl === 'string') this.parentEl = ab.qs(this.parentEl)
  // if (!this.parentEl) throw new Error('Bad el ' + this.parentEl)
  // this.scoreColumns = new ScoreColumns(this.parentEl)

  // this.bpm = o.bpm || 100
  // this.tpb = o.tpb || 4
  // this.bar = o.bar || 4
  // this.bars = this.bar

  this.tracks = [
    '1...'.split(''),
    '.2..'.split(''),
    '.3..'.split(''),
    '.4..'.split('')
  ]

  // for (var ibar = 0; ibar < this.bars; ibar += 1) {
  //   this.tracks[ibar] = []
  //   for (var itpb = 0; itpb < this.tpb; itpb += 1) {
  //     this.tracks[ibar][itpb] = (o.tracks && o.tracks[ibar] && o.tracks[ibar][itpb])
  //     if (!this.tracks[ibar][itpb]) this.tracks[ibar][itpb] = '·'
  //   }
  // }
  // console.warn('PlayerView', this)
  // properties on o added
}

PlayerView.prototype = {
  tpl: function (o) {
    var t = bp.templates
    o.settings = t.settings(o.settings)
    o.score = t.scoreSpan([1, 2, 3, 4, 5, 6, 7, 8, 9, 'A'])
    o.instruments = t.instruments(o.instruments)
    o.columns = t.columnEmpty() + this.tracks.map(t.column).join('\n')
    console.warn('Player tpl', o)
    var player = t.player(o)
    return player
  },
  renderModel: function () {
    // Extract the parts needed for the playerview
    var m = this.model
    var o = {
      settings: {
        bpm: m.bpm(),
        tpb: m.tpb(),
        beats: m.beats()
      },
      instruments: m.instruments()
    }
    console.warn('obj', o)
    this.render(o)
  },
  renderTrack: function (track) {
    // var columns = []
    var i = 0
    var length = this.tpb * this.bar * this.bars
    while (i < length) {
      i += 1
    }
  },
  gotoPos: function (pos) {
    this.scoreColumns.selectedIndex = -1
    this.scoreColumns.step(pos)
  },
  start: function (from) {
    var self = this
    this.interval = setInterval(function () {
      requestAnimationFrame(function () {
        self.step()
      })
    }, (this.bpm / 60) * this.bar * this.tpb * 100)
  },
  stop: function () {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  },
  step: function (amount) {
    amount = amount || 1
    this.currentPos += amount
    this.scoreColumns.step(amount)
  }
}

mixinDom(PlayerView)
mixinFocus(PlayerView)

PlayerView.prototype.unfocus = function () {
  css(this.parentEl.childNodes[0], {
    border: 'none'
  })
  if (bp.lastPopUp) bp.lastPopUp.hide()
}
PlayerView.prototype.focus = function () {
  css(this.parentEl.childNodes[0], {
    border: '1px solid blue'
  })
  if (bp.lastPopUp) {
    bp.lastPopUp.show()
    bp.lastPopUp.inputEl.select()
  }
}

PlayerView.prototype.keyLeft = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyRight = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyUp = function (ev, el) {
  console.warn(ev, el)
}
PlayerView.prototype.keyDown = function (ev, el) {
  console.warn(ev, el)
}

// function decToalphanum (num) {
  // if (num >= alphaNum.length) {
    // console.warn('reset num from ', num)
    // num = alphaNum.length - 1
    // console.warn('reset num to', num)
  // }
  // return alphaNum[num]
// }

function alphanumToDec (anum) {
  return alphaNum.indexOf(anum + '')
}

mixinHandlers(PlayerView, {
  click: function (ev, el) {
    // console.warn('You clicked', ev, el, el.parentNode)
    // var rowIndex = [].slice.call(el.parentNode.childNodes).indexOf(el)
    // var columnIndex
    var r1
    switch (el.nodeName) {
      case 'P':
        console.warn('P Instrument', el)
        // var dom2 = ab.dom('<div class="instruments">${instruments}</div>')
        // falls through
      case 'B':
        r1 = rect(el)
        var value = el.innerText
        if (!value || /^\s*$/.test(value)) value = '.'
        bp.live.ti1.popup({
          top: r1.top,
          left: r1.left,
          width: r1.width,
          value: value,
          set: function (value) {
            el.innerText = value
          }
        })
        bp.lastPopUp = bp.live.ti1
        break
      case 'I': // Click top row to go to position
        console.warn('I', alphanumToDec(el.innerText))
        // TODO  this.gotoPos(alphanumToDec(el.innerText))
        break
      case 'ABBR':
        r1 = rect(qs('dd', el))
        // falls through
      case 'DT':
        // falls through
      case 'DD':
        r1 = rect(el)
        // if (bp.lastPopUp) bp.lastPopUp.hide()
        bp.sliderInput1.popup({
          top: r1.top,
          left: r1.left,
          value: el.innerText,
          set: function (value) {
            el.innerText = value + ''
          }
        })
        bp.lastPopUp = bp.sliderInput1
        break
    }
    this.focus()
    return ev.stopPropagation()
  }
})
// 1}}} PlayerView

// {{{1 InputHandler
var key0 = '0'.charCodeAt(0)
var key9 = '9'.charCodeAt(0)
var keyUp = 38
var keyDown = 40
var keyLeft = 37
var keyRight = 39
var keyEnter = 13
var keySpace = 32
var keyEsc = 27
var keyTab = 9

function InputHandler (o) {
  if (!o.keyboardView) throw new Error('Need o.keyboardView')
  if (!o.player) throw new Error('o.player')
  if (!o.model) throw new Error('o.model')
  this.keyboardView = o.keyboardView
  this.player = o.player
  this.parentEl = __document
}

InputHandler.prototype = {
}

mixinHandlers(InputHandler, {
  keydown: function (ev, el) {
    var code = ev.which
    console.warn('Key', code, ev.charCode, String.fromCharCode(code))
    if (code <= key9 && code >= key0) {
      this.keyboardView.selectInstrument(String.fromCharCode(code))
    } else if (code === keyUp) {
      console.warn('keyUp')
      if (bp.lastPopUp && bp.lastPopUp.keyUp) bp.lastPopUp.keyUp()
      ev.preventDefault()
    } else if (code === keyDown) {
      console.warn('keyDown')
      if (bp.lastPopUp && bp.lastPopUp.keyDown) bp.lastPopUp.keyDown()
      ev.preventDefault()
    } else if (code === keyLeft) {
      console.warn('keyLeft')
      if (bp.lastPopUp && bp.lastPopUp.keyLeft) bp.lastPopUp.keyLeft()
      ev.preventDefault()
    } else if (code === keyRight) {
      console.warn('keyRight')
      if (bp.lastPopUp && bp.lastPopUp.keyRight) bp.lastPopUp.keyRight()
      ev.preventDefault()
    } else if (code === keySpace) {
      console.warn('keySpace')
      ev.preventDefault()
    } else if (code === keyEsc) {
      console.warn('keyEsc')
      if (bp.lastPopUp) bp.lastPopUp.inputEl.hide()
      ev.preventDefault()
    } else if (code === keyEnter) {
      console.warn('keyEnter')
      ev.preventDefault()
    } else if (code === keyTab) {
      console.warn('keyTab')
      if (!this.activeTab) this.activeTab = this.keyboardView
      this.activeTab.unfocus()
      if (this.activeTab === this.keyboardView) this.activeTab = this.player
      else this.activeTab = this.keyboardView
      this.activeTab.focus()

      return ev.preventDefault()
    } else {
      var k = String.fromCharCode(code)
      if (keyboardKeyMap[k]) {
        console.warn('play key', k)
      }
    }
  },
  keyup: function () {
    console.warn('up', arguments)
  },
  wheel: function () {
    console.warn('scroll', arguments)
  }

})

// 1}}} InputHandler

// {{{1 InstrumentsView
function InstrumentsView (o) {
  o.model.subscribe('SelectInstrument', this.selectInstrumentNumber, this)
  o.model.subscribe('SelectInstrumentRange', this.selectInstrumentRange, this)
}

InstrumentsView.prototype = {
  tpl: function (o) {
    return bp.templates.instrument(o)
  },
  selectInstrumentNumber: function (number) {
    this.update(this.model.instrument())
  },
  selectInstrumentRange: function (range) {
    this.update(this.model.instrument())
  }
}

mixinDom(InstrumentsView)

mixinHandlers(InstrumentsView, {
  click: function (ev, el) {
    var name = el.nodeName
    var dtEl
    var ddEl
    if (name === 'DT') {
      dtEl = el
      ddEl = nextSibling(el)
    } else if (name === 'DD') {
      dtEl = prevSibling(el)
      ddEl = el
    }
    if (dtEl && ddEl) {
      var r1 = rect(ddEl)
      bp.live.ti1.popup({
        top: r1.top,
        left: r1.left,
        width: r1.width,
        value: ddEl.innerText,
        set: function (value) {
          ddEl.innerText = value
        }
      })
    }
  }
})
// 1}}} InstrumentsView

// {{{1 SliderInput
function SliderInput (o) {
  o = o || {}
  this.parentEl = $id(o.id)
  this.sliderEl = qs('input[type=range]', this.parentEl)
  this.textEl = qs('input[type=text]', this.parentEl)
  if (!this.parentEl) throw new Error('Need o.id')
  if (!this.sliderEl) throw new Error('Need o.sliderEl')
  if (!this.textEl) throw new Error('Need o.textEl')
}

SliderInput.prototype = {
  tpl: function (o) {
    return bp.templates.sliderInput(o)
  },
  setRange: function (start, stop, value) {
    value = value || (start + stop) / 2
    attr(this.sliderEl, {min: start,
                            max: stop,
                            value: value})
    this.textEl.value = value
  },
  popup: function (o) {
    if (!this.attached) {
      this.attach(document.body)
      this.attached = true
    }
    // o.value = o.value || this.inputEl.value
    // this.detach()
    // if (o.value !== this.lastValue) this.render(o)
    // this.attach(this.parent)
    css(this.el, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px'
    })
    this.sliderEl.value = o.value
    this.textEl.value = o.value
    this.setValue = o.set
    // this.lastValue = this.inputEl.value = o.value
    this.textEl.focus()
    this.textEl.select()
  }
}

mixinDom(SliderInput)

mixinHandlers(SliderInput, {
  input: function (ev, el) {
    var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
    if (this.setValue) this.setValue(v1)
    ev.stopPropagation()
  },
  change: function (ev, el) {
    var v1 = this.sliderEl.value = this.textEl.value = Math.round(el.value)
    if (this.setValue) this.setValue(v1)
    ev.stopPropagation()
  },
  keydown: function (ev, el) {
    console.warn('Key i sdown', ev, el)
    ev.stopPropagation()
  }
})
// 1}}} Slider Input

// {{{1 TextInput
function TextInput (o) {
  this.parentEl = $id(o.id)
  if (!this.parentEl) throw new Error('Need parentEl')
  this.inputEl = qs('input', this.parentEl)
  this.eventsAttach()
}

TextInput.prototype = {
  popup: function (o) {
    var value = o.value || this.inputEl.value
    css(this.parentEl, {
      position: 'absolute',
      top: o.top + 'px',
      left: o.left + 'px',
      width: o.width + 'px'
    })
    this.setValue = o.set
    this.lastValue = this.inputEl.value = value
    this.inputEl.focus()
    this.inputEl.select()
    this.show()
  },
  popdown: function () {
    this.inputEl.blur()
    this.hide()
  }
}

TextInput.create = function (o) {
  return new TextInput(o)
}

mixinHideShow(TextInput)

mixinHandlers(TextInput, {
  keyup: function (ev, el) {
    var key = String.fromCharCode(ev.keyCode).toLowerCase()
    if (/^[\s\b]*$/.test(key)) key = '.'
    if (this.setValue) this.setValue(key)
    this.popdown()
  },
  keydown: function (ev) {
    // Prevent InputHandler from changing instrument
    return ev.stopPropagation()
  }
})
// 1}}} TextInput

// {{{1 Samples
function Samples () {
}

mixinDom(Samples)

Samples.prototype = {
  draw: function (el) {
    bp.templates.keyboard({
    })
  }
}

// 1}}} Samples

bp.test.player = function () {
  var bm1 = new BeatModel()
  bm1.loadBeat('data/beat1.beat', function (err, model) {
    if (err) throw err
    bm1.loadBeatSamples(function (err, bm) {
      if (err) throw err
      var pl1 = PlayerView.create({
        model: bm
      })
      pl1.renderModel()
      pl1.attach('#test1')
    })
  })
}


// Include definitions for timber v0.1.1
var escapeMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '`': '&#x60;'
    },
    regex = new RegExp(Object.keys(escapeMap).join('|'), 'g');

function escapeHtml(aString) {
    return (aString + '').replace(regex, function (ch) {
        return escapeMap[ch];
    });
}

function escapeText(t) {
   return (t + '').replace(/(")/g, '\\"');
}

function escapeJson(o) {
  return JSON.stringify(o, 0, 2);
}

function escapeNone(o) { return o + ''; }


// Timber templates v0.1.1 compiled 2016-05-31T14:30:20.388Z
bp.templates = {
  column: function (o) {
  var result =   "<p>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <b>" + escapeHtml(v1) + "</b>\n";
  }
  result += "</p>\n";
return result; }
,
  columnEmpty: function (o) {
  var result =   "<p><b>&nbsp;</b></p>\n";
return result; }
,
  instrument: function (o) {
  var result =   "<h4>instrument " + escapeHtml(o.number) + "</h4><dl><dt>Name</dt><dd>" + escapeHtml(o.name) + "</dd><dt>Url</dt><dd>" + escapeHtml(o.url) + "</dd>";
  if (o.range) {
    result +=     "<dt>Range</dt><dd>" + escapeHtml(o.range) + "</dd>";
  }
  result += "";
  if (o.buffer) {
    result +=     "<dt>Duration</dt><dd>" + escapeHtml(Math.round(o.buffer.duration * 100) / 100) + "</dd>";
  }
  result += "</dl>";
return result; }
,
  instruments: function (o) {
  var result =   "";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <p>" + escapeHtml(v1.name) + "</p>\n";
  }
  result += "";
return result; }
,
  keyboard: function (o) {
  var result =   "<pre>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  " + (v1) + "\n";
  }
  result += "</pre>\n";
return result; }
,
  keyboardRow: function (o) {
  var result =   "";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "<b>" + escapeHtml(v1) + "</b>";
  }
  result += "";
return result; }
,
  player: function (o) {
  var result =   "<div class=settings>\n" + (o.settings) + "\n</div>\n<div class=instruments>\n" + (o.instruments) + "\n</div>\n<div class=score>\n" + (o.score) + "\n<div class=score-columns>\n" + (o.columns) + "\n</div>\n</div>\n";
return result; }
,
  scoreSpan: function (o) {
  var result =   "<span>\n<i>&nbsp;</i>\n";
  for (var v0 = 0; v0 < o.length; v0 += 1) {
    var v1 = o[v0];
    result +=     "  <i>" + escapeHtml(v1) + "</i>\n";
  }
  result += "</span>\n";
return result; }
,
  settings: function (o) {
  var result =   "<dl>\n  <dt><abbr title=\"Beats Per Minute\">BPM</abbr></dt> <dd>" + escapeHtml(o.bpm) + "</dd>\n  <dt><abbr title=\"Ticks Per Beat\">LPB</abbr></dt> <dd>" + escapeHtml(o.tpb) + "</dd>\n  <dt><abbr title=\"Total Beats\">Beats</abbr></dt> <dd>" + escapeHtml(o.beats) + "</dd>\n</dl>\n";
return result; }
,
  sliderInput: function (o) {
  var result =   "<div id=\"slider1\" class=\"slider-input\">\n  <input type=\"text\" name=\"val\" value=\"" + escapeText(o.value) + "\">\n  <input orient=\"vertical\" type=\"range\" min=\"0\" max=\"100\" step=\"1\"\n         value=\"" + escapeText(o.value) + "\">\n</div>\n";
return result; }

};

/*global ready bp BeatModel KeyboardView InstrumentsView PlayerView InputHandler
  TextInput SliderInput InstrumentsView*/

ready(function () {
  bp.started = Date.now()
  bp.live = {}

  // Main

  var beatModel = new BeatModel()

  // KeyboardView
  var kv1 = KeyboardView.create({
    model: beatModel
  })
  kv1.render()
  kv1.attach('#keyboard')
  bp.live.kv1 = kv1

  // InstrumentsView
  var iv1 = InstrumentsView.create({
    model: beatModel
  })
  iv1.render({
    name: 'goo',
    url: '/data/bd.wav'
  })
  iv1.attach('#instruments')
  bp.live.iv1 = iv1

  // PlayerView
  var pl1 = PlayerView.create({
    model: beatModel
  })
  pl1.renderModel()
  pl1.attach('#player1')

  // InputHandler handles events on body
  var ih1 = new InputHandler({
    model: beatModel,
    keyboardView: kv1,
    player: pl1
  })
  ih1.eventsAttach()
  bp.live.ih1 = ih1

  // TextInput pops up to get input
  var ti1 = TextInput.create({id: 'textInput1'})
  bp.live.ti1 = ti1

  var si1 = SliderInput.create({id: 'sliderInput1'})
  bp.live.si1 = si1

  // 

  // Main

  bp.testBeatAudio()

  return true
  beatModel.loadBeat('data/beat1.beat', function (err, model) {
    if (err) throw err
    beatModel.loadBeatSamples(function (err, bm) {
      if (err) throw err
      console.warn('Loaded beat1')
      pl1.detach()
      pl1.renderModel()
      pl1.attach()
    })
  })

  // SliderInput for slidable values
  // var si1 = SliderInput.create({el: '#slider1'})
  // // si1.eventsAttach()
  // si1.setRange(0, 100)
  // si1.render()
  // bp.sliderInput1 = si1

  // test audio
  // bp.beat1.test()

  // var instrumentsView = InstrumentsView.create()
  // instrumentsView.render({name: 'name', url: 'foo/url.pattern'})
  // instrumentsView.attach('#ie1')
  // bp.iv1 = instrumentsView

  // ab.delay(1001, () => {
    // console.warn('syop')
    // player1.stop()
  // })
  // ab.delay(2001, () => {
    // console.warn('set')
    // // player1.gotoPos(4)
  // })
  // // ab.delay(2501, () => {
    // // console.warn('Hello')
    // // // player1.start()
  // // })

  // var player = new Player({id: 'player0'})
  // // player.eventsAttach()
})


  var parent = __window
  try {
    if (typeof module !== 'undefined' && typeof module.exports === 'object') parent = module.exports
    parent.ab = ab
  } catch (e) {
    console.warn('Error', e)
    parent.ab = e
  }
}())

