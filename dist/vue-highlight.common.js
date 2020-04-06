/*!
  * vue-highlight v1.0.2
  * (c) 2020 André Bunse (aburai)
  * @license MIT
  */
'use strict';

var _OPTIONS = {
  wordsOnly: false,
  caseSensitive: false,
  notGlobal: true,
  defaultSelector: 'div',
  nodeName: 'span',
  className: 'v-highlight',
  classNameStopWord: 'v-highlight v-highlight--stopword',
  ignore: 'v-highlight--ignore',
  splitter: [',', '/'],
  debug: false
};

var _REGEX_QUOTED = new RegExp(/"([^"\\]*(\\.[^"\\]*)*)"/);
var _REGEX_STOPWORD = new RegExp(/^\\\+/);
var _REGEX_CLEANUP = new RegExp(/[\-\[\]{}()*+?.,\\^$|#\s]/g);

// Highlight methods
var HL = {
  parseFilter: function parseFilter (term, settings) {
    console.assert(term, 'no term for parseFilter!');
    settings = settings || {};
    settings.splitter = settings.splitter || _OPTIONS.splitter;

    var words = [];
    // ensure array
    if (typeof term === 'string') {
      settings.splitter.forEach(function (splitBy) {
        if (term.indexOf(splitBy) !== -1) { words = words.concat(term.split(splitBy)); }
      });
    }
    // term not splitted
    if (!words.length) { words.push(term); }
    // without empty words
    words = words.filter(function (word) { return word.trim() !== ''; });
    // trim word
    // clean up for regexp
    return words.map(function (word) { return word.trim().replace(_REGEX_CLEANUP, '\\$&'); })
  },
  rexText: function rexText (term, settings) {
    var words = HL.parseFilter(term, settings);
    if (!words || words.length === 0) { return }

    settings = settings || {};

    // filter stopwords or not stopwords
    words = words.filter(function (w) {
      var isStopword = _REGEX_STOPWORD.test(w);
      return typeof settings.stopwords === 'undefined' || (settings.stopwords ? isStopword : !isStopword)
    });
    // clean up stopwords
    words = words.map(function (w) { return w.replace(_REGEX_STOPWORD, ''); }).filter(function (w) { return !!w.trim(); });
    // NOTE prevent regexp with empty words array
    //  creates endless loop in while clause
    if (!words || words.length === 0) { return }

    var flag = settings.caseSensitive ? '' : 'i';
    if (!settings.notGlobal) { flag += 'g'; }

    if (!settings.wordsOnly) {
      words = words.map(function (w) {
        if (_REGEX_QUOTED.test(w)) { w = w.replace(/"/g, '\\s\\b'); }
        return w
      });
    }
    var pattern = '(' + words.join('|') + ')';
    if (settings.wordsOnly) {
      pattern = '\\s\\b' + pattern + '\\b\\s';
    }

    return new RegExp(pattern, flag)
  },
  highlight: function highlight (term, node, settings) {
    settings = settings || {};
    var nodeName = settings.nodeName;
    var className = settings.className;
    var classNameStopWord = settings.classNameStopWord;
    var ignore = settings.ignore;

    settings.stopwords = false;
    var rex1 = HL.rexText(term, settings); // build rex for normal terms
    if (rex1) { HL._highlight(node, rex1, nodeName, className, ignore); }

    settings.stopwords = true;
    var rex2 = HL.rexText(term, settings); // build rex for stopwords
    if (rex2) { HL._highlight(node, rex2, nodeName, classNameStopWord, ignore); }
  },
  _highlight: function _highlight (node, re, nodeName, className, ignore) {
    nodeName = nodeName || 'span';
    className = className || 'highlight';
    if (node.nodeType === 3) {
      var match;
      while ((match = re.exec(node.data)) !== null) {
        if (!match[0].length) { break } // match has no text, break to prevent endless loop

        var highlight = document.createElement(nodeName);
        highlight.className = className;

        var wordNode = node.splitText(match.index);
        node = wordNode.splitText(match[0].length);

        var wordClone = wordNode.cloneNode(true);
        highlight.appendChild(wordClone);
        wordNode.parentNode.replaceChild(highlight, wordNode);
      }
      return 1 // skip added node in parent
    } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
      !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
      !(node.tagName === nodeName.toUpperCase() && node.className === className) && // skip if already highlighted
      !node.classList.contains(ignore)) {
      var il = node.childNodes.length;
      for (var i = 0; i < il; i++) {
        i += HL._highlight(node.childNodes[i], re, nodeName, className, ignore);
      }
    }
    return 0
  },
  unhighlight: function unhighlight (target, className) {
    if (!target || !className) { return }

    var nodes = target.querySelectorAll('.' + className);
    if (!nodes) { return }

    var il = nodes.length;
    for (var i = 0; i < il; i++) {
      var el = nodes[i];
      var parent = el.parentNode;
      parent.replaceChild(el.firstChild, el);
      parent.normalize();
    }
  }
};

var _Vue;

function install (Vue, options) {
  if (install.installed && _Vue === Vue) { return }
  install.installed = true;
  _Vue = Vue;

  // ## Default plugin options
  // Plugin defaults with options from Vue.use(VueHighlight, {options})
  var _options = Object.assign({}, _OPTIONS, options);

  Vue.prototype.$highlight = function (query, selector, copts) {
    var this$1 = this;

    var _o = Object.assign({}, _options, copts);
    selector = selector || _o.defaultSelector;
    query = (query || '').trim();

    this.$nextTick(function () {
      HL.unhighlight(this$1.$el, _o.className);
      if (!query) { return }

      var nodes = this$1.$el.querySelectorAll(selector);
      if (!nodes) { return }

      var il = nodes.length;
      for (var i = 0; i < il; i++) {
        HL.highlight(query, nodes[i], _o);
      }
    });
  };
  Vue.prototype.$highlight.parse = HL.parseFilter;
  Vue.prototype.$highlight.rex = HL.rexText;
}

/*  */

var VueHighlight = function VueHighlight () {};

VueHighlight.prototype.init = function init (app /* Vue component instance */) {
  if (process.env.NODE_ENV !== 'production')
    { throw new Error(
      install.installed,
      "not installed. Make sure to call `Vue.use(VueHighlight)` " +
      "before creating root instance."
    ) }
};

VueHighlight.install = install;
VueHighlight.version = '1.0.2';

if (window && window.Vue) { window.Vue.use(VueHighlight); }

module.exports = VueHighlight;
