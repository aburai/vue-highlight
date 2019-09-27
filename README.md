# vue-highlight

## UNDER CONSTRUCTION - use at own risc and create issues

### Introduction

`vue-highlight` is a plugin for [Vue.js](http://vuejs.org). Features include:

- options for finetuning (see default options)
- option for debugging (logs highlighting workflow)

## Install

From npm:

``` sh
$ npm install @aburai/vue-highlight --save
$ yarn add @aburai/vue-highlight
```

### Usage

#### append plugin to Vue
``` js
import Vue from 'vue'
import VueHighlight from '@aburai/vue-highlight'
Vue.use(VueHighlight)
```
#### default options
``` js
{
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
```

#### use plugin
``` js
onInput(value) {
    this.$highlight(value, 'td', {
      wordsOnly: false,
      caseSensitive: false,
      notGlobal: true
    })
}
```
``` css
.v-highlight {
    padding: 0 1px;
    font-size: 105%;
    font-weight: 500;
    color: #000;
    background: yellow;
    &.v-highlight--stopword {
        background: red;
    }
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present André Bunse (aburai)

## Special Thanks

to [vue-router](https://github.com/vuejs/vue-router) as a boilerplate for a good vue plugin template
