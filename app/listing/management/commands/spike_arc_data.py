"""
Spike 0 ③: ARC がデータ出力（OP_FALSE OP_RETURN）をどこまで受けるかを実地で見る。

本体チャンクは「ordinal ではない純データ出力」で、**入力は市場の fee wallet**
だけ（データ出力に署名は要らない）。仕様 §9 はこれを 4 MB/tx 前提で設計して
いるが、受理されるかは ARC とマイナー次第なので、小さく出して確かめる。

    # 組むだけ（放送しない）。手数料と大きさが見える
    manage.py spike_arc_data --bytes 10240 --wif <WIF>

    # 実際に出す（**本物の BSV を使う**）
    manage.py spike_arc_data --bytes 10240 --wif <WIF> --broadcast

ARC のポリシー（2026-11-18 実測・TAAL）:
    maxtxsizepolicy 100,000,000 / maxscriptsizepolicy 100,000,000 /
    miningFee 100 sat per 1000 bytes / standardFormatSupported true
"""

import json
import math
import os

import requests
from django.core.management.base import BaseCommand, CommandError

WOC_UNSPENT = 'https://api.whatsonchain.com/v1/bsv/main/address/{address}/unspent'
WOC_TX_HEX = 'https://api.whatsonchain.com/v1/bsv/main/tx/{txid}/hex'
FEE_PER_KB = 100          # ARC の miningFee（100 sat / 1000 bytes）
DUST_LIMIT = 135          # これ未満のお釣りは作らない（出力ごと落として手数料に回す）


class Command(BaseCommand):
    help = 'ARC がデータ出力をどこまで受けるかを実地で確かめる（Spike 0 ③）'

    def add_arguments(self, parser):
        parser.add_argument('--bytes', type=int, default=10 * 1024,
                            help='データ出力の大きさ（既定 10 KiB）')
        parser.add_argument('--wif', default=os.environ.get('MARKET_FEE_WALLET_WIF', ''),
                            help='入力に使う鍵（既定は env の MARKET_FEE_WALLET_WIF）')
        parser.add_argument('--broadcast', action='store_true',
                            help='実際に ARC へ出す（**本物の BSV を使う**）')
        parser.add_argument('--arc-url', default=os.environ.get('ARC_URL', '').strip("'\""))
        parser.add_argument('--arc-token', default=os.environ.get('ARC_TOKEN', '').strip("'\""))

    def handle(self, *args, **options):
        from bsv import PrivateKey, P2PKH, Script, Transaction, TransactionInput, TransactionOutput
        from bsv.fee_models import SatoshisPerKilobyte

        if not options['wif']:
            raise CommandError('--wif か MARKET_FEE_WALLET_WIF が要る')

        key = PrivateKey(options['wif'])
        address = key.address()
        self.stdout.write(f'入力に使う address: {address}')

        # 1) UTXO を引く（WoC の公開 API）
        response = requests.get(WOC_UNSPENT.format(address=address), timeout=30)
        response.raise_for_status()
        utxos = sorted(response.json(), key=lambda row: row['value'])
        if not utxos:
            raise CommandError(f'{address} に未使用の UTXO が無い')

        payload = bytes(options['bytes'])            # 中身は 0x00 で十分（大きさだけが論点）
        data_script = Script(b'\x00\x6a' + _push(len(payload)) + payload)

        # 2) 手数料ぶんを見込んで UTXO を選ぶ（データ出力の分だけで決まる）
        rough_size = len(data_script.serialize()) + 400
        needed = math.ceil(rough_size / 1000) * FEE_PER_KB + DUST_LIMIT
        chosen = next((row for row in utxos if row['value'] >= needed), None)
        if chosen is None:
            raise CommandError(
                f'{needed} sat 以上の UTXO が無い（最大 {utxos[-1]["value"]} sat）')

        source_hex = requests.get(WOC_TX_HEX.format(txid=chosen['tx_hash']), timeout=60).text
        source = Transaction.from_hex(source_hex)

        # 3) 組む: 出力 0 = データ、出力 1 = お釣り
        tx = Transaction()
        tx.add_input(TransactionInput(
            source_transaction=source,
            source_output_index=chosen['tx_pos'],
            unlocking_script_template=P2PKH().unlock(key),
        ))
        tx.add_output(TransactionOutput(locking_script=data_script, satoshis=0))
        tx.add_output(TransactionOutput(locking_script=P2PKH().lock(address), change=True))
        tx.fee(SatoshisPerKilobyte(FEE_PER_KB))
        tx.sign()

        raw = tx.hex()
        size = len(raw) // 2
        change = tx.outputs[1].satoshis
        fee = chosen['value'] - change
        self.stdout.write(
            f'データ {options["bytes"]:,} B / tx {size:,} B / 手数料 {fee:,} sat '
            f'（{fee / (size / 1000):.1f} sat per kB）/ お釣り {change:,} sat')
        self.stdout.write(f'txid（未放送）: {tx.txid()}')

        if not options['broadcast']:
            self.stdout.write(self.style.WARNING(
                '組んだだけで放送していない。出すなら --broadcast'))
            return

        # 4) ARC へ出す
        if not options['arc_url']:
            raise CommandError('--arc-url か ARC_URL が要る')
        headers = {'Content-Type': 'application/json'}
        if options['arc_token']:
            headers['Authorization'] = f'Bearer {options["arc_token"]}'

        submit = requests.post(f'{options["arc_url"].rstrip("/")}/v1/tx',
                               headers=headers, data=json.dumps({'rawTx': raw}), timeout=120)
        self.stdout.write(f'ARC status={submit.status_code}')
        self.stdout.write(submit.text[:800])
        if submit.status_code >= 300:
            raise CommandError('ARC が受け付けなかった（上の本文が理由）')
        self.stdout.write(self.style.SUCCESS(f'受理された: {tx.txid()}'))


def _push(length: int) -> bytes:
    """データ長に応じた最小 push（OP_RETURN の後ろ）。"""
    if length <= 0x4b:
        return bytes([length])
    if length <= 0xff:
        return b'\x4c' + bytes([length])
    if length <= 0xffff:
        return b'\x4d' + length.to_bytes(2, 'little')
    return b'\x4e' + length.to_bytes(4, 'little')
