---
id: miyanaga
title: 自前アクセスランキング実現のつらみ
date: 2024-11-02 19:44:00
---

アクセスランキングはWebサイトの人気機能のひとつであるが、弊社ではGA4を活用したアクセスランキング表示のWebサービス [Ranklet4](https://ranklet4.com/) を提供している。

- [Ranklet4 \[無料\] GA4から人気ページランキングをかんたん表示](https://ranklet4.com/)

「どのサイトでもGoogle Analyticsでアクセス解析をしているのだから、そのデータを活用してアクセスランキングを簡単に表示できるようにしよう」というアイデアから始めた無料サービスだ。

Google Analytics(以下GA4)のデータを使うのは、単に「せっかくデータを取っているから」といった受け身な理由に限らない。アクセスランキングを自前で実現するのはなかなか大変なのだ。

そんなアクセスランキング実現のつらみと、GA4を活用することの意義について話をしたい。

[[toc]]

---

## 自前で実装する場合のよくあるパターン

アクセスランキング自体はシンプルなデータ処理である。ページが閲覧されたらそれを記録し、ページごとの閲覧数を集計して表示する、それだけである。

例えばWordPressにはプラグイン [WordPress Popular Posts](https://wordpress.org/plugins/wordpress-popular-posts/) があり、インストールするだけでアクセスランキングを実現できる。

WordPressと同じデータベースに、ページビューも記録して、それを集計してランキングを表示する仕組みのようである。

:::info
ざっとコードを眺めての推測なので間違っていたら申し訳ないが、ここではその前提で話を進める。
:::

自前で実装する場合も、データベースを備えたシステムではおおよそ同じ仕組みになるだろう。

### 本番環境にリリースすると…

さて、開発環境で動作確認をして問題がなかった。

対象サイトはそれなりのアクセス数があるメディアサイトだ。いよいよ本番環境にもリリースしたところ、サイトも管理画面もまったく応答しなくなってしまった！

筆者も以前に似たような経験をしたことがある。要は本番のアクセス数では、データベースへの負荷が高くなりすぎたのだ。

## なぜ負荷が高くなりすぎたのか

普段は同じアクセス数も問題なく捌いているのに、なぜシンプルなアクセスランキングを追加しただけで負荷に耐えられなくなったのか？

### 書き込み処理は愚直に行われる

普段はデータベースからコンテンツを読み込み、それをアクセスに応じてユーザーに表示する。

データの読み込み処理はキャッシュをしやすい。メモリやデータベースより軽量なファイルに記録し、毎回愚直にデータベースを参照しなくてもよい仕組みを作りやすい。

一方、アクセス数の記録はアクセスのたびに毎回愚直にデータベースを操作する。これが負荷でパンクした原因だった。

また、記録したアクセス数が増えるとランキング集計の処理も重くなる。こちらも高負荷の要因になるであろう。

### キャッシュやストリーミングデータサービスを使う

ひとつは読み込み処理と同じようにキャッシュを活用することだ。

一旦、処理が軽量なファイルにアクセスを追記で記録しておき、ある程度集計したデータを定期的にデータベースに投入する。これで負荷をかなり下げることができる。

あるいは、AWSで言えば [Kinesis](https://aws.amazon.com/jp/kinesis/) など、ストリーミングデータを扱うマネージドサービスも多い。これらを活用するのも安定化につながる。

### データベースをアップグレードする？

もうひとつは強力なデータベースにアップグレードすることだが、データベースは総じて単価の高いコンポーネントである。

アクセスランキングの実現のためにデータベースを強化することにそこまで経済的合理性があるだろうか。

また、アクセスランキングのような補助的な機能に引っ張られてデータベースの性能が決まるのは、設計上、不健全な状態と言わざるを得ない。

## だからGA4を使う

言いたかったのは「アクセス数のような弾力性のある事象に対応してデータを記録するのは案外大変」ということだ。

アクセスランキング表示の機能自体はシンプルでも、スケーラビリティの問題は大きい。

しかしよく考えたら、アクセス数のような弾力性のあるデータを、絶えず安定的に記録してくれているサービスがすでにあるではないか。GA4である。

[Ranklet4](https://ranklet4.com/) は、以上の理由でアクセスランキング表示の最適解であると自負している。

### Ranklet4が向かないサイト

技術的な手軽さの面でアクセスランキング表示の最適解を自負するRanklet4であるが、もちろん弱点もある。それがリアルタイム性である。

GA4ではアクセスの記録から集計まで数時間のタイムラグがある。メディアサイトであればギリギリ許容できるかもしれないが、SNSのように情報鮮度の高いサイトでは要件を満たせない場合もあるだろう。

また、アクセスデータを元に「この情報は⚪︎⚪︎人の人が見ています」といった、もっとダイレクトな販促に用いられるケースも増えている。

このようにアクセスストリームデータの高度な活用がなされるサイトでは、アクセスランキングはその一部として実装すべきだろう。