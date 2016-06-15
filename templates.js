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


// Timber templates v0.1.1 compiled 2016-06-15T17:33:11.039Z
bp.templates = {
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

};
