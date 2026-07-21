---
id: miyanaga
title: CrUXはどのくらいあてになるか - Chrome限定の実測値を全ブラウザRUMと突き合わせてみた
description: CrUXはChromeのオプトインユーザーだけの実測値で、iPhoneのSafariもEdgeも対象外だ。それでも現実のユーザー体験をどこまで映すのか。全ブラウザRUM「Speed is Money」と通販14サイトで突き合わせ、競合の順位やモバイルの水準は信用でき、デスクトップのLCPは楽観的に出る、と用途ごとに線引きした。
date: 2026-07-19 15:00:00
ogp: /ogp/2026/crux-vs-rum.jpg
categories:
  - sitespeed
  - research
  - technology
---

CrUX（Chrome User Experience Report）は、ChromeユーザーがWebサイトを閲覧したときのスピード指標を収集したビッグデータだ。このデータの素晴らしいところは、

1. 事前準備なしに、思いついたときにサイトスピードの状態を確認できる
2. 他のサイトも同様に確認し、競合サイトと比較できる

こういった点にある。

一方で弱点もある。Chromeユーザーの、さらにオプトインしたユーザーだけが対象であることだ。

スマホで言うと日本はiPhone利用者が多く、デスクトップもEdgeがシェアを伸ばしている。このように偏ったデータであることは否めない。

弊社では、より詳細なスピード体験を観測するため、RUM（Real User Monitoring）収集サービス「[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)」を運営している。[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)では、iPhone SafariやEdgeといったChrome以外の有力ブラウザからも、可能な限りスピードを収集している。

この記事では、この二つのデータにどんな違いがあるかを比較してみた。

CrUXはGoogleのおかげで手軽にアクセスできる貴重なデータだが、実際のユーザー体験とどんな誤差があるのか？　CrUXを見てサイトスピードに関する判断をするとき、何が正しくて、何が間違っているのか？

このような疑問に、一応の回答を示したい。

ただし、[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)もより多くのユーザーをカバーした標本ではあるが、真実（母数）ではない。また、今回は14の通販サイトを対象に調査を行ったが、これもネット全体からすると微小なサンプルだ。

そうした限界は承知のうえで、「CrUXって、サイトスピードに関する意思決定をする上で信用できるよね？」を、実データで再確認してみたい。

[[toc]]

---

## そもそもCrUXは誰を見ているのか

「Chromeユーザーだけ」と言うと軽く聞こえるが、実際にどれだけの人が抜け落ちるのか。まず、そこを日本のブラウザシェアで具体的に押さえておきたい。ここが、この記事のすべての土台になる。

CrUXに体験が集計されるのは、Googleの[公式メソドロジー](https://developer.chrome.com/docs/crux/methodology)によれば、次を満たすChromeユーザーだけだ。

**対象**
- デスクトップ版Chrome（Windows / macOS / ChromeOS / Linux）
- **Android版**Chrome

**対象外（公式が明記して除外）**
- **iOS版のChrome**
- Android アプリ内の WebView
- **その他のChromium系ブラウザ（Microsoft Edge を明示）**

そのうえで、利用統計レポートを有効化し、閲覧履歴を同期している（オプトインした）人だけがカウントされる。

:::warning 「モバイルのChromeは全部CrUXに入る」は誤り
iPhoneではAppleの制約で、Chromeを含む**すべてのブラウザがSafariと同じWebKitエンジンで動く**。CrUXの計測機構はChromiumのBlinkエンジン上でしか働かないため、**iOS版のChromeはまるごと対象外**だ。CrUX対象のモバイルChromeは、実質「Android版Chrome」だけと考えてよい（[web.dev: CrUXとRUMの違い](https://web.dev/articles/crux-and-rum-differences)）。
:::

### デスクトップ：CrUXが見ているのは3分の2だけ

日本のデスクトップ・ブラウザシェアに、CrUXが拾う範囲を重ねてみる。上段が各ブラウザの内訳、下段は**CrUX対応（緑）と対象外（グレー）**に分けたもので、横軸はいずれもシェア（%）だ。赤い破線がCrUX対応の境界を示す。

<img src="/posts/2026/crux-vs-rum/jp-browser-desktop.png" alt="日本のデスクトップ・ブラウザシェアの2段積み上げ横棒グラフ。上段はChrome約65%（緑）・Edge約22%・Safari/Firefox各約4%などの内訳、下段はCrUX対応のChrome 65.4%（緑）と対象外34.6%（グレー）。赤破線がCrUX対応の境界" width="1000" height="277" />

CrUXが拾うのは **Chromeの65.4%だけ**（StatCounter, 2026年6月）。次点の **Edge（22.2%）はChromium系でも対象外**で、SafariやFirefoxも当然入らない。つまり**デスクトップ来訪のおよそ3分の1を、CrUXは一切見ていない**。後で「デスクトップのLCPが実測と大きくズレる」ことを確かめるが、その根っこは、この**見えていない3分の1**にある。

### モバイル：iPhoneが過半なのに丸ごと不可視

モバイルは非対称がさらに極端だ。同じく上段が各ブラウザの内訳、下段が**CrUX対応の上限（Android・緑）と対象外（iOS等・グレー）**で、横軸はシェア（%）である。

<img src="/posts/2026/crux-vs-rum/jp-browser-mobile.png" alt="日本のモバイル・ブラウザシェアの2段積み上げ横棒グラフ。上段はChrome約55%・Safari約40%などの内訳、下段はCrUX対応の上限＝Android 41.24%（緑）と対象外＝iOS等58.76%（グレー）。赤破線がCrUX対応の境界" width="1000" height="277" />

まず日本のモバイルOSは **iOS 58.7% / Android 41.2%**。iPhoneのほうが多い。そして前述のとおり **iOSはSafari・Chromeともに同じWebKit＝丸ごとCrUX対象外**だ。グラフのChrome 55%はAndroid版とiOS版の合算で、**そのうちCrUXに入るのはAndroid版だけ**。Safari 40%も当然入らない。

結局、**CrUXのモバイル値は「Android Chromeの体験」**であって、iPhoneが過半を占める日本のモバイル実体験の代表ではない。この前提を頭の隅に置いて、以降のデータを見てほしい。

:::info 出典
ブラウザ・OSシェアはいずれも [StatCounter GlobalStats（日本・2026年6月）](https://gs.statcounter.com/browser-market-share/japan)。内訳は[デスクトップ・ブラウザ](https://gs.statcounter.com/browser-market-share/desktop/japan)／[モバイル・ブラウザ](https://gs.statcounter.com/browser-market-share/mobile/japan)／[モバイルOS](https://gs.statcounter.com/os-market-share/mobile/japan)を参照した。CrUXの対象範囲は[Chrome公式のメソドロジー](https://developer.chrome.com/docs/crux/methodology)による。
:::

## CrUXのデータはどんな数字でできているか

対象ブラウザを理解したところで、CrUXが保持している数字の意味も確認しておこう。

まず、ユーザーの体験スピードは、同じページであってもかなりのばらつきが生じる。端末や回線が人それぞれだからだ（このばらつきは[「ページスピードは一定ではない？」](/posts/2026/speed-variance.html)で詳しく書いた）。したがって、単純に「何秒」とひとつの数字では表現できない。そこでCrUXは、体験のばらつきを次の2つの形にまとめて持つ。

- **p75（75パーセンタイル）** — 大多数（訪問者の75%）の体験が、何秒以内に収まっているか。たとえばLCPのp75が2.5秒なら「4人に3人は2.5秒以内に表示できていた」を意味する。
- **Good（良い）／ Needs improvement（要改善）／ Poor（悪い）の比率** — 指標ごとに良い・悪いの基準線を設け、全体験が3グループに分かれる。その構成比だ。PageSpeed Insightsの緑・黄・赤の帯がこれで、LCPなら2.5秒以下ならGood（良い）、4秒超ならPoor（悪い）。

この記事で特に見るのは、次の3つの指標だ。あわせて、どちらの向きがよいかも押さえておきたい。

- **p75** — 小さいほどよい
- **Good（良い）** — 大きいほどよい
- **Poor（悪い）** — 小さいほどよい

## デバイスは分けて見る

CrUXは、端末を **phone（スマホ）／ desktop（PC）／ tablet（タブレット）** の3種類に分けて集計している。

PCはスマホより端末性能が高い。だから全体的によい数値が出やすい。両者を混在させると互いにノイズになり、データの意味が曖昧になる。したがって、**デバイス別に集計するのが基本**となる。

なお、タブレットはごく少数で、分析に足る母数がない。そこで[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)では、タブレットをPCに含めている。本記事でも、タブレットは分析対象から外している。

## データの取り出し方——CrUX APIとBigQuery

CrUXには、データの取り出し方がふたつある。

- **CrUX API**：直近28日のスナップショット。現在のスピードを速報として知りたいときに使う。ドメイン単位・ページ単位それぞれのデータを得られ、数値の精度も高い（1ミリ秒精度）。
- **BigQuery**：過去のアーカイブで、毎月中旬くらいに前月分までの集計が出揃う。ドメイン単位に集約される。

イメージとしては、売上の速報値と、月次決算で締めた確定値といったところだろうか。普段おなじみのPageSpeed InsightsやSearch Consoleに表示される数値は、CrUX APIのほうだ。

BigQueryには過去のデータが何年分も蓄積されている。特別なトラッキングなしでも、サイトスピードの長期的な推移を分析できるわけだ。BigQueryにはいくつかデータセットがある。弊社では、デバイスごとに集計された `device_summary` をよく使う。

BigQueryの難点は、反映の遅さと、p75の値が丸められることだ（LCPは100ミリ秒、INPは25ミリ秒刻み）。

そこで今回は、一致の精度をまず1ミリ秒精度のAPIで確かめ、そのうえで実運用で頼る月次アーカイブ（`device_summary`）が13か月×14サイト＝182点でどれだけ実測と合うかも検証した。

## 用途の線引き：参考になるケース／注意が必要なケース

先に結論を、用途別に整理する。「正しい使い方」と「間違えやすい使い方」の切り分けだ。

ただし、この「正しい／間違い」という物言いには留保がいる。**正確には、今回の14サイト横断調査で「その読み方を否定する材料が見つかったか、そうでなかったか」を述べているにすぎない**。14サイトはネット全体からすればごく小さな標本で、真偽を証明したわけではない。それでも、数字を扱って意思決定をする以上、どこかで何らかの態度を決める必要はある。**弊社としては、今回支持された仮説をひとまず採用したうえで、今後のサイトスピード改善提案に活かしていく所存だ**。以下の「正しい／間違い」は、その立場からの表現だと受け取ってほしい。

**参考にしてよい（CrUXが当てになる）**

- ✅ **競合と自社の速度の順位付け**——「A社とB社、どちらが速いか」
- ✅ **モバイルの速度水準**——スマホのLCPなら、CrUXの数字はほぼ実測どおり
- ✅ **モバイルの「良し悪しの割合」**——Good（良い）率が何割か、はモバイルなら信頼できる
- ✅ **INP（操作の反応性）**——これはモバイル・デスクトップを問わず当てになる
- ✅ **月々の大きな変化**——例えばLCPの数百ミリ秒単位の変動。ただしp75で追うよりGood（良い）率のほうが正確

**注意が必要（CrUXを鵜呑みにしない）**

- ⚠️ **デスクトップの絶対値、とくにLCP**——実測よりかなり楽観的に出る
- ⚠️ **「デスクトップがどれだけ悪いか」**——遅い層を捉えきれず、Poor（悪い）を過小に見せる
- ⚠️ **月々の小さな変動**——誤差やp75の丸めに埋もれる
- ⚠️ **アクセス数の少ないサイト**——そもそもデータが生成されず欠測しやすい

以下、なぜこう言えるのかを、突き合わせの実データで一つずつ示す。

## 検証（1）順位はよく当たる

ここから検証（3）までのグラフは、精度の高い**CrUX API（直近28日のスナップショット・1ミリ秒精度）**の数字を使い、[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)の同じ28日と突き合わせている。

まず、CrUXと[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)のLCPを14サイト分プロットする。**横軸・縦軸ともにLCPのp75（ミリ秒・小さいほど速い）**で、横軸がCrUX、縦軸が[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)だ。破線は両者が完全一致する位置（y=x）を示す。

<img src="/posts/2026/crux-vs-rum/lcp-scatter-all.png" alt="14サイトのLCP p75をCrUX（横軸）と自前RUM（縦軸）でプロットした散布図。点はおおむね右肩上がりに並ぶが、y=xの基準線より上に偏っており、RUMのほうが遅い傾向を示す" width="1000" height="620" />

点は右肩上がりに並ぶ。**速いサイトはCrUXと実測のどちらでも速く、遅いサイトも同様に遅い**。順位の一致度を数値で見ると高く、LCPで順位相関0.96、INPで0.87、TTFBで0.93、FCPで0.96。**「競合と比べてどちらが速いか」の相対評価に、CrUXは十分使える**。

INP（こちらも横軸・縦軸ともにp75・ミリ秒）でも同じで、順位はよく当たる。

<img src="/posts/2026/crux-vs-rum/inp-scatter-all.png" alt="14サイトのINP p75をCrUX（横軸）と自前RUM（縦軸）でプロットした散布図。点は右肩上がりに並ぶが、y=xの基準線より下に寄っている" width="1000" height="620" />

ただし、どちらの散布図も点は完全一致の線（破線）から外れている。LCPは線の**上**（実測のほうが遅い＝中央値で27%遅い）、INPは線の**下**（CrUXのほうが大きめに出る）に寄る。**順位は当たるのに、絶対値はズレる。** しかも指標で外れる向きが逆——これは単なる測定誤差ではなく、構造的な要因があることを示唆する。

## 検証（2）モバイルは一致しデスクトップはずれる

その答えは**デバイス**にある。軸は変わらずLCPのp75（ミリ秒）で、同じ点を**モバイル（青丸）とデスクトップ（橙の三角）に塗り分けて**プロットすると、二つの層がくっきり分かれる。

<img src="/posts/2026/crux-vs-rum/lcp-scatter-device.png" alt="LCP p75をモバイル（青丸）とデスクトップ（橙三角）に分けてCrUXと自前RUMでプロットした散布図。青は完全一致の線に張り付き、橙は線より大きく上に跳ねている" width="1000" height="620" />

- **デスクトップ（橙）は完全一致の線から上に外れる。** 実測のほうが中央値で46%遅く、相関は r=0.640。前に見たとおり、CrUXはデスクトップでもChromeしか拾わず、Edge・Safariを含む約3分の1を計測していない。対象がブラウザの一部に限られる以上、ここにズレが出るのは想定の範囲だ。
- **モバイル（青）は完全一致の線に乗る。** CrUXのモバイル値と実測の差は中央値で+1.6%、相関 r=0.985。14サイトすべてがほぼ線上に並ぶ。検証（1）で見た「全体で27%ズレる」のは、このデスクトップ側のズレが全体値に混ざったためだ。

ここで思い出したいのが、CrUXのモバイルは**Android Chromeだけ**の数値であることだ。日本ではモバイルの過半数がiPhoneで、Android Chromeのサンプルは半数に満たない。それでもCrUXと[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)の実測でp75がここまで一致するなら、iPhoneとAndroidも近いスピード分布を持つ、と推測できる。

この仮説の検証は今後の研究に譲る。現時点でも、CrUXモバイルのp75は全体像に近く、実測の参考として使える可能性が高い。

## 検証（3）INPはデスクトップでも一致する

次に、**INP（操作してから画面が反応するまでの速さ）**も同じ軸で見る。散布図はINPのp75（ミリ秒）で、モバイル（青丸）とデスクトップ（橙三角）に分けている。

<img src="/posts/2026/crux-vs-rum/inp-scatter-device.png" alt="INP p75をモバイル（青丸）とデスクトップ（橙三角）に分けてCrUXと自前RUMでプロットした散布図。青も橙も完全一致の線の近くに集まっている" width="1000" height="620" />

**LCPでは外れたデスクトップ（橙）が、INPでは線の近くに収まる**（r=0.925）。モバイル（r=0.964）と合わせ、**INPはデバイスを問わず実測とそろう**。モバイルで反応が遅めの領域（右上）ではCrUXがやや大きめに出るが、その差は小さい。

つまり——**INPに関しては、CrUXはLCP以上に「全体の実態に近い」データを見せている**と言ってよさそうだ。読み込みの速さ（LCP）はデスクトップの見えない層に引っ張られたが、操作の反応（INP）はそうした層の影響を受けにくく、Android Chromeだけを見ても全体の姿とほとんど変わらない。**INPで「このサイトは反応がよい/悪い」を読むなら、デバイスを問わずCrUXを信じてよいだろう。**

## 検証（4）月次アーカイブでもモバイルのLCPは誤差が小さい

**ここまでの検証（1）〜（3）は、1ミリ秒精度のCrUX APIでの話だった。** だが実務で過去をさかのぼるとき見るのは、丸められた月次アーカイブ（BigQueryの`device_summary`）のほうだ。**ここから検証（6）までは、このアーカイブの数字**を使う。そこで、**13か月×14サイト＝182点**をすべて打って、アーカイブが実測とどれだけ合うかを確かめた。まずは水準——**LCPのp75（ミリ秒）**——の散布図から。

<img src="/posts/2026/crux-vs-rum/archive-lcp-scatter.png" alt="月次アーカイブのLCP p75と自前RUMを、13か月×14サイト分すべてプロットした散布図。青（モバイル）は完全一致の線に沿い、橙（デスクトップ）は上に散らばる" width="1000" height="600" />

APIのときと同じ構図だ。モバイルは完全一致の線に近い分布を描き、デスクトップにはやや大きなばらつきが見られる。**過去の月をさかのぼっても、モバイルの速い/遅いは正しく読める**。p75の系統差は[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)が約1割遅め（全ブラウザぶんの上振れ＋丸めで速めに出るぶん）で、これは目安として織り込めばよい。

同じp75でも、**INPはアーカイブだと緩くなる**。

<img src="/posts/2026/crux-vs-rum/archive-inp-scatter.png" alt="月次アーカイブのINP p75と自前RUMを、13か月×14サイト分すべてプロットした散布図。25ミリ秒刻みの丸めで縦縞状になり、モバイル（青）は線の周りに散らばる。デスクトップ（橙）は小さい値に固まる" width="1000" height="600" />

デスクトップ（橙）はINPが小さく（25〜75ms）低い位置に固まる。モバイル（青）は縦縞状に散らばっている。アーカイブのINP p75は**25ミリ秒刻みに丸められる**ため、連続値の実測との間に階段状のズレが出る。相関もモバイルで r=0.83と、LCPの0.96より緩い。**アーカイブのINP p75は水準の目安どまり**と見ておきたい。「p75は丸めに弱い」というこの性質が、月々の変動をGood（良い）率で追うべき理由（検証6）でもある。

## 検証（5）割合で見てもモバイルは一致する

p75だけでなく、Good（良い）／Poor（悪い）の**割合**でも突き合わせる。

具体的な数値が得られるp75は意味を解釈しやすい反面、丸めのぶん若干精度に劣る。イメージしやすければ、**Good（良い）率——その指標の「良い」基準を満たした割合——を追うほうが、より正確**だ。

まず、182点それぞれ（CrUX＝横軸、実測＝縦軸）を散布図にする。点が完全一致の線に寄るほど、CrUXと実測は近い。**LCP**から見る。左にGood（良い）率、右にPoor（悪い）率を並べた（各軸＝判定に入った割合%）。

<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:1.2rem 0">
<figure style="margin:0"><img src="/posts/2026/crux-vs-rum/archive-lcp-good-scatter.png" alt="LCPのGood（良い）率を、モバイル（青）とデスクトップ（橙）に分けてプロットした散布図。青は完全一致の線に沿い、橙は線の下側に寄る" width="620" height="620" style="width:100%;height:auto" /><figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.3em">LCP Good（良い）率</figcaption></figure>
<figure style="margin:0"><img src="/posts/2026/crux-vs-rum/archive-lcp-poor-scatter.png" alt="LCPのPoor（悪い）率を、モバイル（青）とデスクトップ（橙）に分けてプロットした散布図。青は完全一致の線に密集し、橙は上側に散らばる" width="620" height="620" style="width:100%;height:auto" /><figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.3em">LCP Poor（悪い）率</figcaption></figure>
</div>

モバイル（青）はどちらも完全一致の線に寄る（Good（良い）率の相関0.98、Poor（悪い）率0.95）。一方デスクトップ（橙）は線から外れる。CrUXがGood（良い）を約5ポイント多く、Poor（悪い）は約3ポイント少なく見せるためだ。**デスクトップのLCPは「良く」見えやすい**——水準の話と同じ癖だ。実務でひとつ覚えておくなら、これくらいでよい。

**INP**も同じ2枚で見る（左＝Good（良い）率、右＝Poor（悪い）率）。

<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin:1.2rem 0">
<figure style="margin:0"><img src="/posts/2026/crux-vs-rum/archive-inp-good-scatter.png" alt="INPのGood（良い）率を、モバイル（青）とデスクトップ（橙）に分けてプロットした散布図。両デバイスとも完全一致の線に沿う" width="620" height="620" style="width:100%;height:auto" /><figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.3em">INP Good（良い）率</figcaption></figure>
<figure style="margin:0"><img src="/posts/2026/crux-vs-rum/archive-inp-poor-scatter.png" alt="INPのPoor（悪い）率を、モバイル（青）とデスクトップ（橙）に分けてプロットした散布図。ほぼすべての点が原点付近に集まる" width="620" height="620" style="width:100%;height:auto" /><figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.3em">INP Poor（悪い）率</figcaption></figure>
</div>

Good（良い）率を見ると、デスクトップ（橙）は95%超に固まって線に近い。モバイル（青）は、とくにGood率が低めの左下で散らばりも見られるものの、おおむね線に沿う。相関はモバイル・デスクトップとも0.86前後だ。Poor（悪い）率は、どのサイトもほぼ0%に張り付く。点が集中するため相関係数は小さく出る。とはいえ「揃ってほぼ0%」という一致だ。CrUXで「INPが悪いサイトは少ない」と判断してよい。

最後に、指標ごとに数値でまとめる。device_summary と実測の Good（良い）率・Poor（悪い）率について、相関係数と両者の差（実測−CrUX・pt）を並べた。

<table>
<thead><tr><th>指標</th><th>判定</th><th colspan="2">モバイル</th><th colspan="2">デスクトップ</th></tr>
<tr><th></th><th></th><th>相関 r</th><th>差(pt)</th><th>相関 r</th><th>差(pt)</th></tr></thead>
<tbody>
<tr><td rowspan="2">LCP</td><td>Good（良い）</td><td>0.98</td><td>-1.5</td><td style="color:#94a3b8">0.89</td><td style="color:#94a3b8">-4.9</td></tr>
<tr><td>Poor（悪い）</td><td>0.95</td><td>+0.6</td><td style="color:#94a3b8">0.67</td><td style="color:#94a3b8">+3.3</td></tr>
<tr><td rowspan="2">FCP</td><td>Good（良い）</td><td>0.99</td><td>-1.2</td><td style="color:#94a3b8">0.97</td><td style="color:#94a3b8">-5.2</td></tr>
<tr><td>Poor（悪い）</td><td>0.99</td><td>+0.2</td><td style="color:#94a3b8">0.93</td><td style="color:#94a3b8">+2.8</td></tr>
<tr><td rowspan="2">TTFB</td><td>Good（良い）</td><td>0.95</td><td>+4.1</td><td style="color:#94a3b8">0.88</td><td style="color:#94a3b8">-2.0</td></tr>
<tr><td>Poor（悪い）</td><td>0.97</td><td>-0.9</td><td style="color:#94a3b8">0.91</td><td style="color:#94a3b8">+0.7</td></tr>
<tr><td rowspan="2">INP</td><td>Good（良い）</td><td>0.86</td><td>-1.2</td><td style="color:#94a3b8">0.86</td><td style="color:#94a3b8">-1.4</td></tr>
<tr><td>Poor（悪い）</td><td>0.56</td><td>+0.8</td><td style="color:#94a3b8">0.59</td><td style="color:#94a3b8">+0.6</td></tr>
</tbody>
</table>

モバイルはどの指標もGood（良い）率の相関が高く、差も数pt以内におさまる。一方**デスクトップはGood（良い）の差が開きやすい**（LCPで-4.9pt、FCPで-5.2pt）。Poor（悪い）率も傾向は同じだ。INPのPoor（悪い）は相関こそ低い。ただし値がほぼ0%に固まるためで、不一致ではない。

## 検証（6）月次トレンドは方向を追えるが乖離も残る

引き続き月次アーカイブ（`device_summary`）で「経緯」を見る。ここで確かめたいのは、**月ごとに上がった/下がったという変動が、どこまで実際のスピード変化を映すか**だ。CrUXの履歴を見て「今月このサイトは速くなった（遅くなった）」と判断してよいものか。

実際に動きのあった4サイトについて、モバイルのLCP p75の月次推移を、**実測（実線）とCrUX（破線）**で重ねた。**縦軸はLCPのp75（ミリ秒）、横軸は月**だ。

<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 18px;margin:1.3rem 0">
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-lcp-c.png" alt="Site CのLCP p75月次推移。2025年8〜9月に約1.5秒から3.4秒へ急悪化し、実測とCrUXがほぼ重なって動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site C：夏に約1.5秒→3.4秒へ急悪化。実測とCrUXが連動</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-lcp-k.png" alt="Site KのLCP p75月次推移。同じく2025年夏に約1.8秒から3.4秒へ悪化し、実測とCrUXが重なって動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site K：同じく急悪化。CrUXも追随</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-lcp-j.png" alt="Site JのLCP p75月次推移。1.7〜1.9秒あたりでほぼ横ばいに推移し、実測とCrUXが近い位置で動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site J：ほぼ横ばい</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-lcp-n.png" alt="Site NのLCP p75月次推移。約1.8秒から1.3秒前後へ下降トレンドを描くが、実測がCrUXより一段高く、月ごとの位置は必ずしも重ならない" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site N：下降方向は一致するが、実測とCrUXに一段の乖離</figcaption>
</figure>
</div>

方向はおおむね合っている。Site C・Kは2025年夏にLCPが1.5〜1.8秒台から3.4秒前後へ悪化した。実線と破線はそろって跳ね上がる。Site Jはほぼ横ばい。Site Nは改善だ。**大きめの変化なら、CrUXの履歴でも向きは読める。** 14サイトの月次連動は、サイト別相関の中央値0.74（14サイト中13が正）だった。

ただし、水準が一段ずれるサイトもある。改善したSite N（最後の図）がその例だ。実測とCrUXは同じ下降トレンドを描くものの、実測が一段高い位置にある。p75は100ミリ秒刻みに丸められるため、こうしたずれが出やすい。

同じ4サイトを、今度は**Good（良い）率（Good（良い）判定の割合・%）**で見る。

<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 18px;margin:1.3rem 0">
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-good-c.png" alt="Site CのLCP Good（良い）率月次推移。2025年夏に約92%から48%前後へ急落し、実測とCrUXがほぼ重なって動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site C：急落も密に一致</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-good-k.png" alt="Site KのLCP Good（良い）率月次推移。夏に約88%から50%前後へ低下し、実測とCrUXが重なって動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site K</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-good-j.png" alt="Site JのLCP Good（良い）率月次推移。約90%で高止まりし、実測とCrUXがほぼ一致する" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site J</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-good-n.png" alt="Site NのLCP Good（良い）率月次推移。約87%から94%へ改善し、実測とCrUXが重なって動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site N：改善も一致</figcaption>
</figure>
</div>

実線と破線が、p75よりもさらに密に重なる。Site C・Kの急落や、Site Nの改善を、実測とCrUXがほぼ同じ軌跡でなぞる。Good（良い）率は割合で出るぶん丸めに強く、月々の変化を素直に映す。

最後に**Poor（悪い）率（%）**を見る。

<div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px 18px;margin:1.3rem 0">
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-poor-c.png" alt="Site CのLCP Poor（悪い）率月次推移。3%から12〜16%へ上昇するが、CrUXは実測より2〜3ポイント小さめに出る" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site C：CrUXが小さめ</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-poor-k.png" alt="Site KのLCP Poor（悪い）率月次推移。夏に上昇し、CrUXが実測よりやや小さめに出る" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site K：CrUXが小さめ</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-poor-j.png" alt="Site JのLCP Poor（悪い）率月次推移。2〜3%で低く安定し、実測とCrUXが近い位置で動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site J</figcaption>
</figure>
<figure style="margin:0">
<img src="/posts/2026/crux-vs-rum/trend-poor-n.png" alt="Site NのLCP Poor（悪い）率月次推移。5%から2〜3%へ低下し、実測とCrUXが近い位置で動く" width="560" height="340" style="width:100%;height:auto" />
<figcaption style="font-size:.85em;color:#64748b;text-align:center;margin-top:.35em">Site N</figcaption>
</figure>
</div>

こちらは実測とCrUXの開きが目立つ。CrUXはPoor（悪い）を実測より小さめに見せ（Site C・Kで顕著）、値も小さいぶん揺れやすい。悪化の向きこそ捉えるが、水準を月次で細かく追うのは心もとない。

整理すると、月次で追うときの信頼性は **Good（良い）率 ＞ p75 ＞ Poor（悪い）率** の順になる。**月々の変動を追うなら、まず見るべきはGood（良い）率だ。** p75は直感的だが、丸めで一段ずれる。Poor（悪い）率は数字が小さく、揺れやすい。

それでも、追えるのは方向までだ。**本物の変化かどうかの確証が要るなら、CrUXで見当をつけ、最後はRUMで実測したい。**

## まとめ：CrUXが使える範囲と注意点

最初の問いに戻ろう。「CrUXって、サイトスピードの意思決定に信用できるよね？」——答えは、**用途を選べばイエス**だ。

CrUXの守備範囲は狭い。日本で見ているのは**デスクトップChrome（65%）とAndroid Chromeだけ**で、デスクトップのEdge・Safari・Firefox（約3分の1）も、**iPhoneのSafari（モバイルの過半）**も含まない。それでも、**モバイルのLCPは14サイトすべてで実測とそろい、INPはデスクトップまで一致した**。対象が限られていても、モバイルの水準はおおむね言い当てられていた。

だから、**競合との順位、モバイルの水準と割合、INP、大きな変化の履歴**は、全ブラウザのRUMと突き合わせても十分に信頼できる。裏を返せば、CrUXが実態からはっきりズレるのは、対象が構造的に狭いことに起因する一点——**デスクトップの絶対値、とくにLCPの「どれだけ悪いか」**——にほぼ絞られる。そこだけ割り引いて読めば、CrUXは「地図」として相当に正確だ。

CrUXを疑う必要はないし、盲信する必要もない。**地図と実測の縮尺の違いを知って使い分ける**。それが、フィールドデータと正しく付き合うということだと思う。

なお冒頭で断ったとおり、突き合わせに使った[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)自身も全数ではなく標本で、対象は14サイトという小さなサンプルだ。ここで引いた線は「決定版」ではなく、あくまで**一つの実測に基づく目安**として受け取ってほしい。

## 全ブラウザで実測するには

冒頭で触れた「[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)」は、サイトスピードに特化したシンプルな無料アクセス解析サービスだ。Safari・Edgeも含めた全ブラウザ・全訪問者の速度を取りこぼさず記録するので、CrUXでは見えないデスクトップの実態や、iPhoneユーザーの体験、実来訪の本当のデバイス構成まで把握できる。

この記事のデータも、[Speed is Money](https://speedis.money/?utm_source=notes.ideamans.com&utm_medium=owned_media&utm_campaign=regular&utm_content=crux-vs-rum)を利用中の通販サイト14サイトに協力をいただいた。CrUXの数字だけで物足りなくなった方は、ぜひ実測を試してみてほしい。

なお、速度がCVRにどう効くのかについては、[「通販サイトが遅いと損失はどのくらい？」](/posts/2026/speed-opportunity-loss.html)でも機会損失の見える化として詳しく扱っている。あわせて読んでいただけると幸いだ。
