---
id: miyanaga
title: WebP変換の適切なタイミングについて
date: 2025-02-14 19:38:00
categories:
  - image-fitness
  - sitespeed
  - technology
  - development

---

Web 画像データを WebP や AVIF などの次世代画像フォーマットにすると、同じ画質でもそのデータ量を大幅に削減できる。AWS などの海外クラウドサービスではデータ送信料金を削減でき、ユーザーの通信負担も軽くなる。その効果は小さくない。

しかし、将来的には次世代画像フォーマットの全面移行もあるだろうが、従来フォーマット(JPEG・PNG・GIF)はその活躍期間が長すぎた。供給側のスキルやシステム仕様がすぐには追いつかないし、次世代画像フォーマット自体への信頼感の醸成(WebP や AVIF は本当に次の標準になるのか？)にもまだ当面の時間を要すると考える。

したがって当面の間は、元画像は従来フォーマット(JPEG・PNG・GIF)で供給しつつ、次世代フォーマットへの変換は配信目的に留まる体制が続くと踏んでいる。

この記事では次世代画像フォーマットの代表を仮に WebP とし、従来フォーマットの画像をどのタイミングで WebP に変換するのがよいか論じてみたい。

[[toc]]

---

## 事前変換かオンデマンド変換か

先に述べたように、従来フォーマット（JPEG・PNG・GIF）を WebP などの次世代フォーマットに変換することで、通信コストを抑え、ユーザー体験を向上させることができる。

では次に「どのタイミングで変換するか」だが、大きく次の 2 つのアプローチに大別されるだろう。

1. **事前変換（Pre-transformation / Eager transformation）**  
   バッチ処理などでまとめて WebP に変換しておき、配信時にはすでに変換済みの WebP を返す方法。

2. **オンデマンド変換（On-demand transformation / Lazy transformation）**  
   ユーザーからのリクエストがあった段階で変換を開始し、変換完了された WebP を返す方法。

## メリットとデメリット

事前変換とオンデマンド変換のメリットとデメリットを挙げてみよう。

|                | 事前変換                                                                               | オンデマンド変換                                                                               |
| :------------- | :------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| **メリット**   | 配信時点ですでに WebP が用意されているため、レスポンスが安定して速い                   | 必要なタイミングだけ変換を行うので、不要な変換を避けられる                                     |
| **デメリット** | アクセスされない画像まで変換され、従来フォーマットと WebP の二重でストレージを消費する | 初回アクセスは変換待ちが生じて応答が遅く、アクセスが集中すると変換処理がサーバーを強く圧迫する |

これを踏まえると、事前変換は画像の種類が少ない小規模サイトであれば変換ロスは小さくストレージの消費も小さい。しかし、EC サイトのように画像の種類が多いサイトではそれらが制約となり、おのずとオンデマンド変換の一択となるだろう。

一方でオンデマンド変換は小規模サイトに適用してもなんら問題はない。オンデマンド変換の方が潰しの効く方式と言える。

### オンデマンド変換の功罪

オンデマンド変換の方が一見、メリットが多いように思えるが、愚直に実装すると次の問題が生じる。

- **初回ユーザー体験の悪化**
  変換済みの WebP はキャッシュするとしても初回アクセスは変換を待つ間、画像の表示(レイテンシー)が遅れる。
- **性能弾力性の低下**
  WebP への変換はそれなりに負荷の高い処理なのでアクセスが集中するとサーバーリソースをすぐに圧迫する。

小規模サイトであればキャッシュがすぐに有効に機能するが、EC サイトはロングテール上にアクセスの少ない多数のページが分布する傾向がある。全体として画像への初回アクセスが多いので、キャッシュが効くからと割り切ることはできない。

それより深刻なのはサーバーリソースの圧迫の問題だ。アクセスが集中するとすぐにサーバーがダウン状態に陥る恐れがある。

## オンデマンド遅延変換

そこでオンデマンド変換のメリットを活かしつつ、デメリットを抑える工夫が**オンデマンド遅延変換**だ。オンデマンド遅延変換では WebP への変換が大まかに次の流れで行われる。

1. **初回アクセス**

   - 即時変換は行わず、ひとまずユーザーには従来フォーマットの画像を返す。
   - 同時に変換ジョブをキューに登録し、バックグラウンドで WebP 変換を行う。

2. **変換処理**

   - WebP への変換ジョブは所定の並列度でワーカーが逐次処理する。

3. **次回以降のアクセス**
   - すでに変換済みでキャッシュされている WebP があればそのデータを返す。

以上のように初回アクセスはいち早く従来フォーマットで応答しておくことで、画像軽量化の恩恵を受けられないものの表示が著しく遅れることはない。

また、変換処理も所定の数のワーカーが逐次処理するためアクセスに応じて極度に集中することがない。

図で比較すると以下のようになる。

<img src="https://assets.ideamans.com/miyanaga/images/2025/02/ondemand-conversion-diagram.png" alt="オンデマンド変換とオンデマンド遅延変換、2回目以降のリクエストの処理を図解" width="1600" height="1335" />

## LightFile Proxy はオンデマンド遅延変換を採用

弊社が提供する CloudFront 向けの次世代画像フォーマット対応サービス LightFile Proxy は上記のオンデマンド遅延変換を採用している。

- [LightFile Proxy - AWS CloudFront でシームレスに WebP 対応・通信コスト削減](https://www.lightfile-proxy.net/)

おかげで非常に安定して稼働しており、本番運用を開始してから設計仕様に起因する障害は皆無である。
