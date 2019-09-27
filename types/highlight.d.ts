import Vue, { PluginFunction } from 'vue'

export declare class VueHighlight {
  constructor(options?: HighlightOptions)

  app: Vue

  static install: PluginFunction<never>
}

export interface HighlightOptions {
}
