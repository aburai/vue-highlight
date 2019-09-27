/* @flow */

//  __     __          _   _ _       _     _ _       _     _
//  \ \   / /   _  ___| | | (_) __ _| |__ | (_) __ _| |__ | |_
//   \ \ / / | | |/ _ \ |_| | |/ _` | '_ \| | |/ _` | '_ \| __|
//    \ V /| |_| |  __/  _  | | (_| | | | | | | (_| | | | | |_
//     \_/  \__,_|\___|_| |_|_|\__, |_| |_|_|_|\__, |_| |_|\__|
//                             |___/           |___/

import { install } from './install'

export default class VueHighlight {
  static install: () => void
  static version: string

  init (app: any /* Vue component instance */) {
    if (process.env.NODE_ENV !== 'production')
      throw new Error(
        install.installed,
        `not installed. Make sure to call \`Vue.use(VueHighlight)\` ` +
        `before creating root instance.`
      )
  }
}

VueHighlight.install = install
VueHighlight.version = '__VERSION__'

if (window && window.Vue) window.Vue.use(VueHighlight)
