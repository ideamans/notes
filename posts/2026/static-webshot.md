---
id: miyanaga
title: アニメーションを抑制したWebスクリーンショットを撮るCLIツール static-webshot
date: 2026-02-04 08:07:00
categories:
  - sitespeed
  - development
  - technology
ogp: /ogp/2026/static-webshot.jpg
ads:
  - id: pagespeed-rehearsal
---

Webページのビジュアルリグレッションテストを行う際、最大の敵はアニメーションだ。カルーセルスライダー、CSSアニメーション、フェードイン効果...これらの動的要素があると、撮影のたびにスクリーンショットが異なり、まともなピクセル比較ができない。

アニメーションを徹底的に抑制した静的なスクリーンショットを撮影するCLIツール static-webshot を開発し、MITライセンスのオープンソースとして公開した。

- [ideamans/static-webshot](https://github.com/ideamans/static-webshot)

[[toc]]

---

## ビジュアルリグレッションテストとは

まずは実際の出力を見てほしい。以下は [dummy-ec-site.ideamans.com](https://dummy-ec-site.ideamans.com/) というデモ用ECサイトを、異なるタイミングで2回撮影し、比較した結果だ。

![比較画像](/2026/static-webshot/diff.png)

static-webshotは、変更前後のスクリーンショットを撮影し、ピクセル単位で比較する。出力される差分画像は3分割されている。

- **左**: ベースライン（1回目の撮影）
- **中央**: 差分のハイライト（変化した箇所が赤く表示される）
- **右**: 現在（2回目の撮影）

この例では、右下のチャットアイコンの部分にわずかな差分（0.89%）が検出されている。一方、ページ上部にあるSwiperベースのカルーセルスライダーは、撮影タイミングが異なるにもかかわらず同じスライドが表示されている。static-webshotが自動的にスライダーを検出し、最初のスライドで停止させているからだ。

差分のピクセル数とパーセンテージも数値で出力されるため、機械的な判定が可能だ。

## なぜこのツールが必要だったのか

弊社ではWebサイトの表示スピード改善を提案している。画像の最適化、JavaScriptの遅延読み込み、CSSの軽量化...こうした施策を適用すると、意図せず表示が崩れることがある。

以前は、こうした副作用による表示崩れを目視で確認していた。しかし現在、AIエージェントによる自動改善を進める中で、目視ではなく機械的なレグレッションテストが必要になった。AIが加えた変更が表示に副作用を与えていないか、自動で検証したいからだ。

## 従来のスクリーンショットツールの問題

そこで既存のスクリーンショットツールを使ってみたが、アニメーションが問題になった。

冒頭で触れたとおり、カルーセルスライダーがあると撮影のタイミングによって表示されるスライドが変わってしまう。構造的には何も変わっていないのに、ピクセル比較では「大きな差分がある」と判定され、副作用による表示崩れと区別がつかない。

CSSアニメーションも同様だ。フェードイン途中で撮影されると、透明度が50%の状態がキャプチャされることもある。ローディングインジケーターが回転している途中かもしれない。

このようなアニメーションのタイミングによるノイズがあると、実際の表示崩れを見逃したり、逆に問題ないのにアラートが出たりして、レグレッションテストの信頼性が損なわれる。

## 基本的な使い方

### スクリーンショットの撮影

```bash
# 基本的な使い方（デスクトップ、1920x1080）
static-webshot capture https://example.com -o screenshot.png

# モバイル端末をエミュレート（iPhone相当）
static-webshot capture https://example.com -o mobile.png --preset mobile

# 特定の要素を非表示にする（広告やCookieバナーなど）
static-webshot capture https://example.com -o clean.png \
  --mask ".ad-banner" \
  --mask ".cookie-notice"
```

### スクリーンショットの比較

```bash
# 2つの画像を比較し、差分画像を生成
static-webshot compare baseline.png current.png -o diff.png

# 比較結果をJSONで出力（CI連携用）
static-webshot compare baseline.png current.png -o diff.png --digest-json result.json
```

出力例:

```
[Compare Result]
Baseline: baseline.png
Current: current.png
Output: ./diff.png
Diff Pixels: 100 / 2073600
Diff Percent: 0.0048%
```

JSONダイジェスト:

```json
{
  "pixelDiffCount": 100,
  "pixelDiffRatio": 0.000048,
  "diffPercent": 0.0048,
  "totalPixels": 2073600,
  "baselinePath": "baseline.png",
  "currentPath": "current.png",
  "diffPath": "./diff.png"
}
```

詳細なオプションについては[README](https://github.com/ideamans/static-webshot)を参照してほしい。

## アニメーション抑制の仕組み

ここからが技術的な核心部分だ。static-webshotは複数のレイヤーでアニメーションを抑制している。

### CSSによる抑制

まず、すべての要素に対してCSSアニメーションとトランジションを無効化する。

```css
*, *::before, *::after {
  animation: none !important;
  animation-duration: 0s !important;
  animation-delay: 0s !important;
  transition: none !important;
  transition-duration: 0s !important;
  transition-delay: 0s !important;
  caret-color: transparent !important;
}
html {
  scroll-behavior: auto !important;
}
```

`!important`フラグですべてのスタイルを上書きする。`caret-color: transparent`でテキストカーソルの点滅も消す。`scroll-behavior: auto`でスムーズスクロールも無効化だ。

### JavaScriptの決定論化

時間やランダム値に依存する処理も抑制する。

```javascript
// Date.now()を固定値に
const fixedTimestamp = new Date('2025-01-15T00:00:00Z').valueOf();
window.Date = class extends OriginalDate {
  constructor(...args) {
    if (args.length === 0) {
      super(fixedTimestamp);
    } else {
      super(...args);
    }
  }
  static now() {
    return fixedTimestamp;
  }
};

// Math.random()を常に0.5に
Math.random = function() {
  return 0.5;
};

// Performance.now()も固定
performance.now = function() {
  return 0;
};
```

これにより、「今日の日付」や「ランダムなバナー」といった要素も毎回同じ表示になる。

### 動画・音声の自動再生を無効化

```javascript
// play()を空実装に上書き
HTMLMediaElement.prototype.play = function() {
  this.pause();
  this.currentTime = 0;
  return Promise.resolve();
};

// autoplay属性を常にfalseに
Object.defineProperty(HTMLMediaElement.prototype, 'autoplay', {
  get() { return false; },
  set() {},
  configurable: true
});
```

動画が自動再生されると、再生位置によってスクリーンショットが変わってしまう。これを防ぐため、すべてのメディア要素を0秒の位置で停止させる。

### IntersectionObserverの即時発火

遅延読み込み（Lazy Loading）を使っているサイトでは、画像がスクロールしないと読み込まれない。これを解決するため、IntersectionObserverを上書きして、すべての要素を「表示されている」と判定させる。

```javascript
window.IntersectionObserver = class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe(element) {
    setTimeout(() => {
      this.callback([{
        target: element,
        isIntersecting: true,
        intersectionRatio: 1.0,
        // ...
      }], this);
    }, 0);
  }

  unobserve() {}
  disconnect() {}
};
```

これにより、ビューポート外の画像も即座に読み込まれる。

### カルーセルライブラリへの対応

ここが最も泥臭い部分だ。主要なカルーセルライブラリごとに、個別の停止処理を実装している。

```javascript
function freezeSliders() {
  // Swiper
  document.querySelectorAll('.swiper-container, .swiper').forEach(el => {
    if (el.swiper) {
      el.swiper.autoplay.stop();
      el.swiper.slideTo(0, 0);
    }
  });

  // Slick (jQuery)
  if (typeof jQuery !== 'undefined' && jQuery.fn.slick) {
    jQuery('.slick-initialized').slick('slickPause');
    jQuery('.slick-initialized').slick('slickGoTo', 0, true);
  }

  // Owl Carousel
  if (typeof jQuery !== 'undefined' && jQuery.fn.owlCarousel) {
    jQuery('.owl-carousel').trigger('stop.owl.autoplay');
    jQuery('.owl-carousel').trigger('to.owl.carousel', [0, 0]);
  }

  // Flickity
  if (typeof Flickity !== 'undefined') {
    document.querySelectorAll('.flickity-enabled').forEach(el => {
      const flkty = Flickity.data(el);
      if (flkty) {
        flkty.pausePlayer();
        flkty.select(0, false, true);
      }
    });
  }

  // Bootstrap 5 Carousel
  if (typeof bootstrap !== 'undefined' && bootstrap.Carousel) {
    document.querySelectorAll('.carousel').forEach(el => {
      const carousel = bootstrap.Carousel.getInstance(el);
      if (carousel) {
        carousel.pause();
        carousel.to(0);
      }
    });
  }
}
```

対応しているライブラリ:

- **Swiper** (swiper.js)
- **Slick** (slick.js + jQuery)
- **Owl Carousel** (owl.carousel.js + jQuery)
- **Flickity** (flickity.js)
- **Bootstrap 5 Carousel**

カスタム実装のスライダーには対応できないが、`--mask`オプションで該当要素を非表示にするか、`--inject-css`で個別に対処できる。

### setInterval/setTimeoutの追跡とクリア

ページ読み込み後、すべてのタイマーをクリアする。これにより、JavaScriptで実装されたアニメーションや自動スライドも停止する。

```javascript
const intervals = new Set();
const originalSetInterval = window.setInterval;

window.setInterval = function(...args) {
  const id = originalSetInterval.apply(this, args);
  intervals.add(id);
  return id;
};

window.addEventListener('load', () => {
  setTimeout(() => {
    intervals.forEach(id => clearInterval(id));
    intervals.clear();
  }, 100);
});
```

### Web Animations APIの無効化

CSSアニメーションだけでなく、JavaScriptからのアニメーションAPIも潰す。

```javascript
Element.prototype.animate = function() {
  return {
    cancel: () => {},
    finish: () => {},
    pause: () => {},
    play: () => {},
    playState: 'finished',
    // ...
  };
};

document.getAnimations = () => [];
```

## 比較機能の詳細

スクリーンショットの比較では、ピクセル単位で色の違いを検出する。

### 差分画像の構成

出力される差分画像は3パネル構成だ。

- **左パネル**: ベースライン画像（変更前）
- **中央パネル**: 差分の可視化（変化した箇所が赤くハイライト、ベースラインは50%の明るさで表示）
- **右パネル**: 現在の画像（変更後）

パネルのラベルはカスタマイズ可能だ。

```bash
static-webshot compare baseline.png current.png -o diff.png \
  --baseline-label "リニューアル前" \
  --diff-label "変更箇所" \
  --current-label "リニューアル後"
```

### 色差の閾値

`--color-threshold`オプションで、ピクセルごとの色差の閾値を設定できる。デフォルトは10だ。

```bash
# 厳密な比較（微細な違いも検出）
static-webshot compare baseline.png current.png --color-threshold 0

# 緩い比較（アンチエイリアスの差異を許容）
static-webshot compare baseline.png current.png --color-threshold 30
```

## インストール

[GitHubのReleases](https://github.com/ideamans/static-webshot/releases)からバイナリをダウンロードできる。

また、以下のページでイージーインストールをサポートしている。

- [static-webshot イージーインストール](https://bin.ideamans.com/pagespeed-quest/static-webshot)

Chromeがインストールされていない環境でも、Playwrightの機能により自動的にChromiumがダウンロードされる。

## 現時点での制限と今後

ここで紹介したアニメーション抑制の手法は、現時点でいくつかのサイトで動作確認した範囲で効果があったものだ。すべてのアニメーションを完全に抑制できるわけではない。

たとえば独自実装のカルーセルや、特殊なアニメーションライブラリを使っているサイトでは、抑制が効かないケースもありうる。そうした場合は`--mask`オプションで該当要素を非表示にするか、`--inject-css`で個別に対処することになる。

今後、アニメーションがうまく抑制できないケースが出てきたら、随時対応していく予定だ。

## まとめ

static-webshotは、ビジュアルリグレッションテストのための決定論的スクリーンショットを実現するツールだ。

- CSSアニメーション、トランジションの無効化
- 時間・乱数の固定による再現性の確保
- 主要カルーセルライブラリへの対応
- ピクセル単位の差分比較と可視化

Webサイトの表示スピード改善やリニューアルプロジェクトで、表示崩れがないことを機械的に検証したい場合に活用してほしい。

- [ideamans/static-webshot](https://github.com/ideamans/static-webshot)
