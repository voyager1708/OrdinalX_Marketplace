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
   // 署名コア（Phase 2 の出品・取り下げ）。鍵は端末の IndexedDB にあり、
   // 市場も BE も署名できないので、画面側にこれが要る。
   'nc-wallet.js',
   'nc-send.js',
   'nc-listing.js',
];

// 市場が自分で書く画面のコントローラ。キットの window.* を使うだけで、
// 暗号の実体は持たない（持つと「キットと市場で実装が 2 つ」になる）。
const OWN = [
   'market-sign.js',
   'market-sell.js',
   'market-mine.js',
   'market-buy.js',
];

const COMMON = {
   outdir: 'static/js',
   bundle: true,
   // キットは app/ の外（vendor/ の submodule）にあるので、esbuild は
   // キットの隣から node_modules を探して失敗する。市場の node_modules を
   // 明示する（@bsv/sdk などキットの依存はこちらに入れてある）。
   nodePaths: ['node_modules'],
   format: 'iife',
   // 署名コアは @bsv/sdk を通して BigInt を使う。es2019 ではビルドが落ちるので
   // es2020（Safari 14 / Chrome 80 以降）。PWA の対象はそれより新しい。
   target: ['es2020'],
   logLevel: 'info',
};

// **2 回に分ける**。入り口の根が 2 つ（キットと市場）あると esbuild が
// 共通の親からのディレクトリ構造を出力に残し、static/js/vendor/... のような
// 階層ができてしまう（シェルの {% static %} は平らな名前を指している）。
await build({ ...COMMON, entryPoints: ENTRIES.map((f) => `${KIT}/${f}`) });
await build({ ...COMMON, entryPoints: OWN.map((f) => `src/js/${f}`) });

// シェルのレイアウト CSS（safe-area・.app-header・ボトムタブ）。ビルドは要らず、
// キットのものをそのまま配る。シェルは app.css より**先**に読むので、
// 市場の pwa-head 上書きでも link の順序を変えない（CONTRACT.md §7）。
await mkdir('static/css', { recursive: true });
await copyFile(`${KIT}/../css/pwa.css`, 'static/css/pwa.css');
console.log('  static/css/pwa.css  (キットからコピー)');
