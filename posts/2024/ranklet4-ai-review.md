---
id: miyanaga
title: Ranklet4 アクセスランキングの AIレビュー登場！
date: 2024-12-15 20:43:00
---

弊社が提供するアクセスランキング機能運用サービス [Rankelt4](https://ranklet4.com/) に、**AIレビュー機能** を追加した。

CDTV(カウントダウンTV)のようなランキング形式の音楽番組をイメージしてほしい。先週のトップ10を振り返り、今週のトップ10を楽しみながらMCがコメントする。

AIレビュー機能はいわばそのようなレポート機能だ。Ranklet4に設定いただいたアクセスランキングを活用し、生成AIで上位記事とその推移に関するレビューを自動作成する。

レビューは毎週または毎月、メールで自動配信もできる。メディアやブログ運用のアシスタントとしてぜひ活用いただきたい。

[[toc]]

---

## 何ができるか

Ranklet4で作成済みのアクセスランキングについて、生成AIがその直近の推移に関するレビューを自動生成する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/ideamans-notes-ai-review-ranking-pv-analysis.png" alt="ideaman&#39;s NotesのAIレビュー記事ランキングとPV数、記事内容に関する分析結果" width="1600" height="1047" />

ランキングの推移とレビューは、簡単な設定で定期的にメール配信もされる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/12-11-dify-ranking.png" alt="12月と11月のDify関連の人気記事ランキング" width="800" />

あなたは毎週または毎月、ただ待っているだけで、人間が作成したかのようなアクセスランキングレポートを受信できる。

## 使い方

作成済みランキングの一覧から、`AIレビュー`を選択する。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/blog-list.png" alt="複数のブログ記事のリストが表示された画面" width="1600" height="1047" />

数秒から十数秒、しばらく待つと左側に週間ランキングの推移、右側にそのランキング推移に対する生成AIによる自動レビューが表示される。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/ideamans-notes-ai-review-ranking-pv-analysis.png" alt="ideaman&#39;s NotesのAIレビュー記事ランキングとPV数、記事内容に関する分析結果" width="1600" height="1047" />

ランキングやAIレビューは少しカスタマイズできる。

### ランキングの推移に関する設定

ランキングの推移は以下の設定を変更できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/dify-api-vector-database-self-host-ranking.png" alt="DifyのAPI連携方法、対応ベクトルデータベース、セルフホストに関するランキング" width="750" />

- **週間 | 月間** ランキングを計算する期間を選択する。
- **先週 | 今週** 今週と先週の推移か、先週と先々週の推移かを選択する。今週は進行中で日数が少ないが、先週は7日間を確保できる。(月間を選択した場合は今月と先月になる)
- **PVを考慮** ランキングの推移にPV数も加え、レビューでPV数の変化にも触れるかを選択する。

記事の更新が多く、アクセス数と順位の変動が多いメディアであれば週間、そこまで多くなければ月間がよいだろう。

:::info
なお、ランキングウィジェットの設定では表示する順位を指定できるが、AIレビューでは固定で10位までを対象とする。
:::

### AIレビューに関する設定

AIレビューについては以下の設定を変更できる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/dify-ranking-top.png" alt="Dify関連の記事がランキング上位を独占" width="750" />

- **記事形式 | 箇条書き** AIレビューを見出しと段落からなる記事形式で生成するか、シンプルな箇条書きにするかを選択できる。
- **少なめ | 標準 | 多め** AIレビューの分量を3段階で選択できる。

読みやすい形式と、内容がしっくりくる分量を選んでいただきたい。

### 定期メール配信

気に入ったランキング推移とAIレビューの設定が見つかったら、定期的なメール配信を設定しよう。

画面の下部に定期メール配信の設定がある。トグルボタンをONにすると配信先のメールアドレスを指定できるようになる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/ai-review-mail-setting.png" alt="AIレビューの定期メール配信設定画面" width="750" />

メールアドレスは改行区切りで複数できる。

:::info
設定を変更したら **メール配信設定を保存** ボタンを忘れず押すように注意されたい。
:::

週間ランキングの場合は毎週月曜日の午後0時ごろ、月間ランキングの場合は毎月1日の午後0時ごろに以下のようなHTMLメールが送信される予定である。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/12-11-dify-ranking.png" alt="12月と11月のDify関連の人気記事ランキング" width="800" />

なお、トグルボタンをOFFにすると一時的にメール配信を無効にできる。

### テストメール配信

定期的に配信されるメールがどのようなものか、テスト送信もできる。

<img src="https://assets.ideamans.com/miyanaga/images/2024/12/test-mail-send.png" alt="テストメール送信画面" width="750" />

メールアドレスを入力し、**テストメールを送信** ボタンを押すとメールが送信される。

## ランキング解析の提案

GA4によるアクセス解析は言うまでもなく大切だ。しかし見るべきポイントは多く難解でもある。

そこでもっとカジュアルに、多くの関係者にもサイト動向へ興味を持ってもらう方法がないか考えてきた。

そのアイデアのひとつが、アクセス解析から **ランキング解析** に単純化するという切り口だった。

人気コンテンツはアクセス解析の代表的なレポートであるし、ランキングをウォッチする行為は多くの人にメンタルモデルもある。きっと馴染みがあると期待している。

### 生成AI活用の悲願

前身のサービス **Ranklet** から、GA4に対応するタイミングで **Ranklet4** にリニューアルしたのが2023年7月。

ちょうど生成AIへの注目もうなぎのぼりの時期で、ランキング解析と組み合わせたら面白いのではないか、と当時から構想していた。

実用的かつリーズナブルな生成として [Gemini](https://gemini.google.com/?hl=ja) を用い、本機能をリリースできたことを大変嬉しく感じている。

ユーザーからの評価はこれから下されるが、フィードバックを大切にしながら有用性を高めていきたい。