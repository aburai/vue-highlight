/**
 * Augment the typings of Vue.js
 */

import Vue from 'vue'
import VueHighlight from './index'

declare module 'vue/types/vue' {
  interface Vue {
    $highlight: VueHighlight
  }
}
