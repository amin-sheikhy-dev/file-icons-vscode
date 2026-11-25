/**
 * Bundler-specific file-name lists (replacement for the source project's
 * `data/bundler.ts`). Spread into the file-name map with:
 *   make(webpack, "webpack")
 */

export const webpack = [
  "webpack.config.js", "webpack.config.cjs", "webpack.config.mjs", "webpack.config.ts",
  "webpack.config.base.js", "webpack.config.base.cjs", "webpack.config.base.ts",
  "webpack.config.common.js", "webpack.config.common.cjs", "webpack.config.common.ts",
  "webpack.config.dev.js", "webpack.config.dev.cjs", "webpack.config.dev.ts",
  "webpack.config.development.js", "webpack.config.development.cjs", "webpack.config.development.ts",
  "webpack.config.prod.js", "webpack.config.prod.cjs", "webpack.config.prod.ts",
  "webpack.config.production.js", "webpack.config.production.cjs", "webpack.config.production.ts",
  "webpack.config.staging.js", "webpack.config.staging.ts",
  "webpack.config.main.js", "webpack.config.main.ts",
  "webpack.config.renderer.js", "webpack.config.renderer.ts",
  "webpack.config.client.js", "webpack.config.client.ts",
  "webpack.config.server.js", "webpack.config.server.ts",
  "webpack.config.test.js", "webpack.config.test.ts",
  "webpack.config.babel.js", "webpack.config.babel.mjs", "webpack.config.babel.ts",
  "webpack.dev.js", "webpack.dev.cjs", "webpack.dev.ts",
  "webpack.prod.js", "webpack.prod.cjs", "webpack.prod.ts",
  "webpack.common.js", "webpack.common.cjs", "webpack.common.ts",
  "webpack.mix.js",
];
