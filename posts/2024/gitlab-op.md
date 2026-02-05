---
id: miyanaga
date: 2024-09-09 07:26:00
title: GitLabのよくある操作を半自動化するCLIツール
categories:
  - infrastructure
  - development
ogp: /ogp/2024/gitlab-op.jpg
---

弊社ではクライアントとのソースコードやWikiによるドキュメント共有に、自前のGitLabを使うことがある。

よくある操作を毎回GUIから行うのが手間なので、Go言語によるCLIツールを作り、せっかくなのでオープンソースにした。

[[toc]]

---

## セットアップ

こちらから最新版をダウンロードし、

[gitlab-op - GitHub](https://github.com/ideamans/gitlab-op)

`/usr/local/bin/gitlab-op`などPATHの通ったディレクトリに実行権限付きで配置する。

```bash
sudo cp downloadeds/gitlab-op /usr/local/bin/gitlab-op
sudo chmod +x /usr/local/bin/gitlab-op
```

続いてアクセストークンを作成する。GitLabの管理画面から、アカウントの設定画面から、 `アクセストークン` - `パーソナルアクセストークン` - `新しいトークンを追加` を選択する。

最低限必要なスコープは `api`、`read_api`、`admin_mode`である。

![必要なスコープ](/posts/2024/gitlab-op/scopes.png)

作成したアクセストークンを控え、ホームディレクトリ(`/Users/miyanaga`など)の下に`.gitlab-op/credentials`ファイルを作成する。

```ini
[default]
url=https://<gitlabのURL>/
token=<作成したアクセストークン>
```

これでセットアップが完了だ。

## 操作方法

### グループの作成

`new-group`サブコマンドにグループのパスと名称を渡すとグループを作成できる。

```bash
gitlab-op new-group client-a クライアントA社
```

グループのパスは階層にも対応している(例 clients/client-a)。

### プロジェクトの作成

`new-project`サブコマンドにプロジェクトのパスと名称を渡すとプロジェクトを作成できる。

```bash
gitlab-op new-project client-a/project-alpha プロジェクトα
```

### メンバーの招待

`invite`サブコマンドにグループのパスとメールアドレス(複数可)を渡すと、グループへユーザーを招待する。

メールアドレスに対応するユーザーがまだ存在しない場合は、便宜的なユーザー名を付与してユーザーを作成する。

```bash
gitlab-op invite client-a メールアドレス1 メールアドレス2 ...
```

## 雑記

### CLIツールによる自動化

グループやプロジェクトの追加は頻繁にあるわけではない。しかしGUIからの操作は時間がかかり、集中力を削がれる。CLIで操作できるようにしたのは正解だった。

特にメンバーの招待は手間が多く、数が多いと面倒だ。この機能は大変重宝している。

### 既存のCLIツール

オフィシャルの `glab` (GitHubの`gh`コマンドに相当)をはじめ、GitLab操作用のCLIツールがないわけではない。

それらをシェルスクリプトで組み合わせて実現することも検討した。しかし、そこまで使い勝手のよいCLIツールがなかったので自作に至った。

例えばGitLabの内部では、プロジェクトやグループには人間にわかりやすいslug(ディレクトリ風のパス)の他に、数値によるIDが割り当てられている。

操作によって必要なパラメータがslugか数値IDかまちまちだったりするので、シンプルなシェルスクリプトによるワークフローで実装できるものではなかった。

### Go言語からのGitLab操作

モジュール `github.com/xanzy/go-gitlab` を利用した。

[go-gitlab](https://github.com/xanzy/go-gitlab)

このSDKライブラリはAPIの網羅性が非常に高く、APIとも素直に対応しているため、理解しやすい。大変使いやすかった。しかも頻繁にキャッチアップもされている模様だ。

おかげでGo言語によりSDKをスクリプティングし、シングルバイナリにするという負荷の低いアプローチを実現できた。
