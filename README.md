# vue-highlight

## UNDER CONSTRUCTION - use at own risc and create issues

### Introduction

`vue-highlight` is a plugin for [Vue.js](http://vuejs.org). Features include:

- options for finetuning (initDelay, focusDelay, refocusDelay)
- option for debugging (logs highlighting workflow)

## Install

From npm:

``` sh
$ npm install @aburai/vue-autohighlight --save
$ yarn add @aburai/vue-autohighlight
```

### Usage

#### append plugin to Vue
``` js
import Vue from 'vue'
import VueHighlight from '@aburai/vue-autohighlight'
Vue.use(VueHighlight)
```

#### use plugin
``` js
mounted() {
    this.$highlight() // 
}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2019-present André Bunse (aburai)

## Special Thanks

to [vue-router](https://github.com/vuejs/vue-router) as a boilerplate for a good vue plugin template
