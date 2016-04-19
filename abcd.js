/*global d, __window*/
(function () {
  // # a.js  =  Functions for node and the browser
  var a = {}
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
      for (var key in parent) {
        if (__hasProp.call(parent, key)) target[key] = parent[key]
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
  // * an object of all leaves matching `match`
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
  
  a.version = 1
  a.type = type
  a.extend = extend
  a.each = each
  a.getId = getId
  a.withMatches = withMatches
  a.rand = rand
  a.randInt = randInt
  a.range = range
  a.delay = delay
  a.debounce = debounce
  a.path = path
  a.withMatches = withMatches
  
  
  /*global extend,a,__slice */
  // # b.js  =  Functions the browser
  
  var b = extend({}, a)
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
  
  // Set the css specified in `props` on element `el`
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
  
  function attrs (el, obj) {
    Object.keys(obj).forEach(function (at) {
      el.setAttribute(at, obj[at])
    })
  }
  
  function xhr (o) {
  }
  
  b.classAdd = classAdd
  b.classRemove = classRemove
  b.qs = qs
  b.qa = qa
  b.css = css
  b.ready = ready
  b.attrs = attrs
  b.xhr = xhr
  
  
  
  var c = extend({}, b)
  
  function TimeManager(o) {
    if (typeof o.interval !== 'number') throw new Error('Need o.interval to be a number')
    if (!o.timeds) throw new Error('Need o.timeds')
    this.interval = o.interval
    this.start = Date.now()
  }
  
  TimeManager.protoype = {
    milis: function () {
  
    }
  }
  
  function Timed(o) {
  }
  
  c.Timed = Timed
  c.TimeManager = TimeManager
  
  
  /*global extend, c*/
  // ## d.js is for generating data of models
  var d = extend({}, c)
  
  
  var parent = __window
  if (typeof module !== 'undefined' && typeof module.exports === 'object') parent = module.exports
  parent.abcd = d
}())
