Vibe Coding (ヴァイブコーディング)が賑わっている。生成AIを積極的に利用し、自然言語によるVibe(雰囲気)でコーディングを進行する潮流だ。

まさにこのネットミームが相応しい。

<img src="https://assets.ideamans.com/miyanaga/images/2025/05/coding-wakaranai-man.png" alt="コーディングが全然わからない男性" width="600" height="360" />

- [雰囲気で株をやっているジェネレーター](https://potato4d.github.io/huniki_generator/?text=%E3%82%B3%E3%83%BC%E3%83%87%E3%82%A3%E3%83%B3%E3%82%B0)

自分も古いプログラマーなので、中身がよくわからないものを残す勇気は未だない。しかし使い捨てのプログラム、PoC的なプロトタイプ、個性のない小さなライブラリ開発などには今後、積極的に使っていこうと思う。

[[toc]]

---

## Go言語のKVSをベンチマークする

近々、Go言語でローカルKVSを利用する予定があるのだが、実にいろいろなライブラリがある。一例を挙げるだけでも、

- **LevelDB** - Googleが開発したLSM-treeベースのKVS
- **BBolt** - BoltDBのフォーク、B+treeベースのKVS
- **Badger** - DGraphが開発したLSM-treeベースのKVS
- **Pebble** - CockroachDBが開発したLSM-treeベースのKVS（RocksDBインスパイア）

これらに加え、データの保守性を考えるとSQLiteでシンプルなテーブルを作るのもいいかもしれないと考えていた。

そこで、それぞれのライブラリについて共通ユースケースの実装を得るとともに、性能を調べるためベンチマークプロジェクトをVibe Codingで作ってみた。

## Claude Code で Vibe Coding

今回はClaude Codeを利用した。

- [Claude Code 概要 - Anthropic](https://docs.anthropic.com/ja/docs/claude-code/overview)

先日発表されたGoogleのJules(ベータ版)も試したのだが、途中から進まなくなってしまった。GeminiもどんどんよいLLMになっているので、今後に期待したい。

- [Jules - An Asynchronous Coding Agent](https://jules.google/)

とりあえずClaude Codeに以下のプロンプトを投げてみる。

```
golangで以下のファイル永続化が可能なKVSライブラリの性能を比較するため、ラフなベンチマークをしたいです。

- leveldb
- bbolt
- badger
- pebble
- sqlite (テーブルkvsを作成し、インデックス付きkeyとjsonからなるテーブルで実現)

## 方針

- プログラムファイルの構成は任せます
- ライブラリを後で追加しやすいようにファイルを設計してください

## 下準備

- data/keys.tsvを作成し、i=0〜99999をループ、sha256ハッシュ値と乱数からなる10万件のTSVテストデータを作成

## ライブラリベンチマーク

対象のライブラリについて、共通で次の処理を行います。それぞれの処理の最後に、サマリーを表示してください。

1. data以下にデータディレクトリを再作成(例: data/leveldb)。あれば削除。なければ作成
2. KVSストレージを初期化
3. ベンチマーク1 append
 1. 下準備で用意したkeys.tsvを全て走査
 2. key=sha256ハッシュ、value={ single: 乱数値 }をKVSに保存
4. ベンチマーク2 update
 1. 下準備で用意したkeys.tsvを全て走査
 2. key=sha256ハッシュ、value={ double: 乱数値 * 2 }をKVSに差分保存
5. ベンチマーク3 get
 1. 下準備で用意したkeys.tsvを全て走査
 2. key=sha256ハッシュで値を取得
 3. value = { single: 乱数値, double: 乱数値 * 2 }となっているか検証
  1. もし相違があれば処理を中断
6. ベンチマーク4 占有ファイルサイズ
 1. データディレクトリ(例: leveldb) を走査し、ファイルサイズを合計

# レポーティング

各ライブラリのベンチマーク結果をタブ区切りの表として出力してください。

- 列方向: ベンチマーク1(append)の所要時間(ms) ベンチマーク2(update)の所要時間(ms) ベンチマーク3(get)の所要時間(ms) ベンチマーク4の占有ファイルサイズ(bytes)
- 行方向: ライブラリ
```

Claudeがみるみるトークンを消費していったが、欲しいものが大体できてしまった。

- [Claude codeで生成 · miyanaga/go-kvs-vibe-benchmark@bddb891](https://github.com/miyanaga/go-kvs-vibe-benchmark/commit/bddb8915be25bbf0d509d4c85422ac715d734e6d)

## 追加指示をプロンプト

今回、`fsync`(バッファをせず直接ファイルに書き込む)は不要と思っていたが、当初のプロンプトで忘れていた。それを指示する。

```
internal/kvs以下の実装について、fsyncが有効になっていないか確認し、有効になっている場合は無効にしてください。
```

最後に使い方を`README.md`にまとめるようにお願いした。

Claude Codeは生成したコードの使い方もプロンプトへの応答で丁寧に解説してくれる。それを「これまでの説明」と指示に加えた。

```
これまでの説明を含め、日本語でREADME.mdを作ってください。
```

最終的にこのようなコードベースになった。

- [miyanaga/go-kvs-vibe-benchmark at claude-code](https://github.com/miyanaga/go-kvs-vibe-benchmark/tree/claude-code)

## 実行してみる

READMEにあるように、`go run cmd/generate-data/main.go`を実行するとベンチマークが走り出す。

```
Running benchmark for leveldb...
leveldb append: 191ms
leveldb update: 193ms
leveldb get: 169ms
leveldb file size: 13480961 bytes
leveldb benchmark completed

Running benchmark for bbolt...
bbolt append: 1598ms
bbolt update: 1579ms
bbolt get: 104ms
bbolt file size: 33570816 bytes
bbolt benchmark completed

Running benchmark for badger...
badger append: 573ms
badger update: 625ms
badger get: 182ms
badger file size: 2282750000 bytes
badger benchmark completed

Running benchmark for pebble...
pebble append: 141ms
pebble update: 175ms
pebble get: 603ms
pebble file size: 23924128 bytes
pebble benchmark completed

Running benchmark for sqlite...
sqlite append: 19631ms
sqlite update: 20781ms
sqlite get: 647ms
sqlite file size: 27295744 bytes
sqlite benchmark completed

Benchmark Results:
Library Append(ms)      Update(ms)      Get(ms) FileSize(bytes)
leveldb 191     193     169     13480961
bbolt   1598    1579    104     33570816
badger  573     625     182     2282750000
pebble  141     175     603     23924128
sqlite  19631   20781   647     27295744
```

最後の6行がタブ区切りの表になっているので、コピペでスプレッドシートに貼り付けると分析ができる。

10万件の書き込み・更新・読み込みの計測結果だが、KVSはいずれも非常に速い。SQLiteはいわゆる`fsync`であるためか、KVSに比べると書き込みが遅い。

SQLiteの利用は見送るが、次回のKVSの利用はそこまで速度を求めないので、あとはライブラリの書き味によって選ぼうと判断できた。

## 論よりRun・書くより「頼む」

実はこのKVS選定はしばらくウジウジ悩んでいた。そこで軽くベンチマークを書いて手応えを得ようと思っていたが、実際にやるとなると一日がかりになりそうで敬遠していた。

それでVibe Codingに任せてみたが、結果的に大正解だった。プロンプトを練るのに30分くらいかかったが、その後は本を読んでいたら終わってしまった。

冒頭にも書いたが、使い捨てのプログラム、コンセプト検証のプロトタイプ、要件が小さなライブラリなどはVibe Codingを活かしていこうと思った。
