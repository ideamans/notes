---
id: miyanaga
title: Googleスプレッドシートを簡易データベースにするNPMモジュールを公開
date: 2025-04-25 15:15:00
---

TypeScriptによるプログラムで、Zodで型を規定しつつ、Googleスプレッドシートを簡易的なデータベースとして利用できるモジュールを開発した。

- [ideamans/node-google-spreadsheet-tables](https://github.com/ideamans/node-google-spreadsheet-tables)
- [日本語README](https://github.com/ideamans/node-google-spreadsheet-tables/blob/main/README.ja.md)
- [google-spreadsheet-tables - npm](https://www.npmjs.com/package/google-spreadsheet-tables)

[[toc]]

---

## データベース面倒くさい問題

プログラムでは永続化されたデータを扱いたいことが多い。極めて小規模であればシンプルなファイルを用い、大規模になればデータベースを用いる。問題はその中間だ。ファイルではシンプルすぎるが、データベースを用意するほどでもないことがある。

データベースを用意するとそれを維持することも考えなければいけない。RDBMSだとスキーマ管理も別に必要になる。それが面倒で気が重い。

先日作成した以下のプログラムがまさにそのようなケースだった。

- [AIエージェント × MCP × スプレッドシートで寝ている間に仕事をしてくれる「小人のくつ屋さん」を実現する | ideaman's Notes](https://notes.ideamans.com/posts/2025/agent-mcp-batch.html)

このプログラムでZodでスキーマを規定しつつGoogleスプレッドシートをデータベース代わりに使ってみたところ、思った以上に開発体験がよかった。そこで独立したモジュールとして機能を分離した。

## 使い方

まずはGCPでサービスアカウントを作成し、Googleスプレッドシートをサービスアカウントのメールアドレスに対し、編集権限付きで共有する。

JSONの鍵ファイルを`service-account.json`としてダウンロードすると、次のようなプログラムでスプレッドシートをドキュメントデータベースのように利用できる。

```typescript
import { useWorksheetWithServiceAccountFile, useDocumentsSheet } from 'google-spreadsheet-tables'
import { z } from 'zod'

// スキーマを定義
const userSchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  gender: z.enum(['male', 'female', 'other']),
  company: z.string().optional(),
})

// スプレッドシート接続を初期化
// 'YOUR_SPREADSHEET_ID' を実際のファイルIDに置き換えてください。例：1vob8zYwa2p9mLDaczN_Egn-01QjC-tC80-Y83yYMCR0
const { doc } = useWorksheetWithServiceAccountFile('YOUR_SPREADSHEET_ID', './service-account.json')

// ドキュメントシートを作成
const { append, get, patch, snapshot, clear } = await useDocumentsSheet(
  doc,
  'Users',
  userSchema
)

// 新しいユーザーを追加
const newUser = await append({
  name: 'John Doe',
  age: 30,
  gender: 'male',
  company: 'Acme Inc.'
})

// すべてのユーザーを取得
const { documents: allUsers } = await snapshot()

// 特定のユーザーを取得
const user = await get(newUser.rowKey)

// ユーザーを更新
await patch(newUser.rowKey, {
  age: 31,
  company: 'New Company'
})
```

詳しくは[日本語README](https://github.com/ideamans/node-google-spreadsheet-tables/blob/main/README.ja.md)をご覧いただきたい。

## まとめ

もちろん性能は低いし、クリティカルな要件は満たすことができないが、小規模のゆるいデータ管理であればこれで十分だ。

データベースとしてのGoogleスプレッドシートは利点も多い。

- **リモートデータベース** ローカルファイルだと実行中の端末からしかアクセスできないが、Googleスプレッドシートであれば複数の実行環境からも接続できる。
- **GUI完備** データを総覧しやすく、データの変更も直感的にできる。
- **関数やスクリプト** そのまま関数やGASで全体的なデータ加工ができる。
- **前後の工程との接続** プログラムが全体の業務の一部である場合、前後の工程との受け渡しがある。スプレッドシートならデータ変換の手間が省けることがある。

個人的にはこれからも積極的に利用していきたい。
