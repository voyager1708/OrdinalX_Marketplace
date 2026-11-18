/**
 * シェルが読む JS を、版を固定したキットのソースからビルドする。
 *
 * 実行時にウォレットのビルド成果物を読まない（S009 §15 の禁止事項 2）ため、
 * 市場は同じソースから自分でバンドルする。出力名はシェルの {% static %} が
 * 指す名前に合わせる。
 *
 * 署名コア（nc-wallet / nc-send / nc-nft-create / nc-biometric）は Phase 2 で
 * 出品・購入を実装するときに足す。今は画面のシェルに要るものだけ。
 */
import { copyFile, mkdir } from 'node:fs/promises';

import { build } from 'esbuild';

const KIT = '../vendor/wallet-ui/app/packages/wallet-kit/js';

const ENTRIES = [
   'backend-status.js',
   'nc-auth.js',
   'gaudi.js',
   'gaudi-nav.js',
   'localtime.js',
];

await build({
   entryPoints: ENTRIES.map((f) => `${KIT}/${f}`),
   outdir: 'static/js',
   bundle: true,
   format: 'iife',
   target: ['es2019'],
   logLevel: 'info',
});

// シェルのレイアウト CSS（safe-area・.app-header・ボトムタブ）。ビルドは要らず、
// キットのものをそのまま配る。シェルは app.css より**先**に読むので、
// 市場の pwa-head 上書きでも link の順序を変えない（CONTRACT.md §7）。
await mkdir('static/css', { recursive: true });
await copyFile(`${KIT}/../css/pwa.css`, 'static/css/pwa.css');
console.log('  static/css/pwa.css  (キットからコピー)');
