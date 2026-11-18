// UI キットの preset（vendor/wallet-ui/app/packages/wallet-kit/tailwind/preset.cjs）。
//
// ⚠ Tailwind 3 は **preset の content をマージしない**（設定側の content が
// 置き換える）。キットのパスを展開し忘れると、キットのシェルだけが使う
// ユーティリティが purge され、HTML は正しいのに CSS だけが静かに壊れる
// （ウォレット側の切り出しで実際に z-0 が消えた）。
const kit = require('../vendor/wallet-ui/app/packages/wallet-kit/tailwind/preset.cjs');

module.exports = {
  presets: [kit],
  content: [
    ...kit.content,
    './templates/**/*.html',
    './*/templates/**/*.html',
    './static/**/*.js',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('preline/plugin'),
  ],
};
