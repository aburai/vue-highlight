const _OPTIONS = {
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
}

const _REGEX_QUOTED = new RegExp(/"([^"\\]*(\\.[^"\\]*)*)"/)
const _REGEX_STOPWORD = new RegExp(/^\\\+/)
const _REGEX_CLEANUP = new RegExp(/[\-\[\]{}()*+?.,\\^$|#\s]/g)

// Highlight methods
const HL = {
  parseFilter (term, settings) {
    console.assert(term, 'no term for parseFilter!')
    settings = settings || {}
    settings.splitter = settings.splitter || _OPTIONS.splitter

    let words = []
    // ensure array
    if (typeof term === 'string') {
      settings.splitter.forEach(splitBy => {
        if (term.indexOf(splitBy) !== -1) words = words.concat(term.split(splitBy))
      })
    }
    // term not splitted
    if (!words.length) words.push(term)
    // without empty words
    words = words.filter(word => word.trim() !== '')
    // trim word
    // clean up for regexp
    return words.map(word => word.trim().replace(_REGEX_CLEANUP, '\\$&'))
  },
  rexText (term, settings) {
    let words = HL.parseFilter(term, settings)
    if (!words || words.length === 0) return

    settings = settings || {}

    // filter stopwords or not stopwords
    words = words.filter(w => {
      const isStopword = _REGEX_STOPWORD.test(w)
      return typeof settings.stopwords === 'undefined' || (settings.stopwords ? isStopword : !isStopword)
    })
    // clean up stopwords
    words = words.map(w => w.replace(_REGEX_STOPWORD, ''))
    // NOTE prevent regexp with empty words array
    //  creates endless loop in while clause
    if (!words || words.length === 0) return

    let flag = settings.caseSensitive ? '' : 'i'
    if (!settings.notGlobal) flag += 'g'

    if (!settings.wordsOnly) {
      words = words.map(w => {
        if (_REGEX_QUOTED.test(w)) w = w.replace(/"/g, '\\s\\b')
        return w
      })
    }
    let pattern = '(' + words.join('|') + ')'
    if (settings.wordsOnly) {
      pattern = '\\s\\b' + pattern + '\\b\\s'
    }

    return new RegExp(pattern, flag)
  },
  highlight (term, node, settings) {
    settings = settings || {}
    const { nodeName, className, classNameStopWord, ignore } = settings

    settings.stopwords = false
    const rex1 = HL.rexText(term, settings) // build rex for normal terms
    if (rex1) HL._highlight(node, rex1, nodeName, className, ignore)

    settings.stopwords = true
    const rex2 = HL.rexText(term, settings) // build rex for stopwords
    if (rex2) HL._highlight(node, rex2, nodeName, classNameStopWord, ignore)
  },
  _highlight (node, re, nodeName, className, ignore) {
    nodeName = nodeName || 'span'
    className = className || 'highlight'
    if (node.nodeType === 3) {
      let match
      while ((match = re.exec(node.data)) !== null) {
        const highlight = document.createElement(nodeName)
        highlight.className = className

        const wordNode = node.splitText(match.index)
        node = wordNode.splitText(match[0].length)

        const wordClone = wordNode.cloneNode(true)
        highlight.appendChild(wordClone)
        wordNode.parentNode.replaceChild(highlight, wordNode)
      }
      return 1 // skip added node in parent
    } else if ((node.nodeType === 1 && node.childNodes) && // only element nodes that have children
      !/(script|style)/i.test(node.tagName) && // ignore script and style nodes
      !(node.tagName === nodeName.toUpperCase() && node.className === className) && // skip if already highlighted
      !node.classList.contains(ignore)) {
      const il = node.childNodes.length
      for (let i = 0; i < il; i++) {
        i += HL._highlight(node.childNodes[i], re, nodeName, className, ignore)
      }
    }
    return 0
  },
  unhighlight (target, className) {
    if (!target || !className) return

    const nodes = target.querySelectorAll('.' + className)
    if (!nodes) return

    const il = nodes.length
    for (let i = 0; i < il; i++) {
      const el = nodes[i]
      const parent = el.parentNode
      parent.replaceChild(el.firstChild, el)
      parent.normalize()
    }
  }
}

export let _Vue

export function install (Vue, options) {
  if (install.installed && _Vue === Vue) return
  install.installed = true
  _Vue = Vue

  // ## Default plugin options
  // Plugin defaults with options from Vue.use(VueHighlight, {options})
  const _options = Object.assign({}, _OPTIONS, options)

  Vue.prototype.$highlight = function (query, selector, copts) {
    const _o = Object.assign({}, _options, copts)
    selector = selector || _o.defaultSelector
    query = (query || '').trim()

    this.$nextTick(() => {
      HL.unhighlight(this.$el, _o.className)
      if (!query) return

      const nodes = this.$el.querySelectorAll(selector)
      if (!nodes) return

      const il = nodes.length
      for (let i = 0; i < il; i++) {
        HL.highlight(query, nodes[i], _o)
      }
    })
  }
  Vue.prototype.$highlight.parse = HL.parseFilter
  Vue.prototype.$highlight.rex = HL.rexText
}
