---
title: Difyが対応しているベクトルデータベース
id: miyanaga
date: 2024-10-07 13:30:00
categories:
  - ai
  - technology
ogp: /ogp/2024/dify-vector-stores.jpg
ads:
  - id: ai-coaching
---

Difyでナレッジを取り込むと、その内容はベクトルデータベースに格納される。

Difyは多種多様なベクトルデータベースに対応しているようで、[環境設定ファイル](https://github.com/langgenius/dify/blob/main/docker/.env.example)を眺めているだけでも興味深い。

Difyが対応していると思われるベクトルデータベースを調べてみた。

[[toc]]

---

## ベクトルデータベースとは

LLMには、文章などを例えば1024次元のような高次元ベクトルに変換する機能がある(Embedding)。いわば文章を言語空間における意味的な位置にマッピングする機能で、意味の近い文章はその位置が近くなるため曖昧検索に利用できる。

そのような高次元ベクトルの方向や距離を計算できるデータベースが、ベクトルデータベースである。

Difyにおいては、**Vector Store**という扱いになっている。要はベクトルをキーとしてコンテンツをインデックスできる構造だけあればよいので、複雑なデータベースというよりKVS(Key-Value Store)に近い。

## Difyが対応するVector Store

ひとつずつ検証したわけではないが、Difyの[環境設定ファイル](https://github.com/langgenius/dify/blob/main/docker/.env.example)を眺めていると、多種多様なデータベースへの対応が見て取れる。

この分野はまったく知見がないので、どんなデータベースに対応しているか調べてみた。

:::info
この記事の執筆時である2024年10月7日現在の状況。環境変数`VECTOR_STORE`に指定できる値から調査した。
:::

- weaviate
  - [Weaviate ベクトルデータベース | Weaviate](https://weaviate.io/ja)
  - オープンソース(修正BSD)
  - デフォルトのVector Store
- qdrant
  - [Qdrant - Vector Database - Qdrant](https://qdrant.tech/)
- milvus
  - [The High-Performance Vector Database Built for Scale | Milvus](https://milvus.io/)
  - オープンソース(Aapche 2.0)
- myscale
  - [MyScale | Run Vector Search with SQL](https://myscale.com/)
  - オープンソース(Apache 2.0)
- pgvector
  - [pgvector/pgvector: Open-source vector similarity search for Postgres](https://github.com/pgvector/pgvector)
  - PostgreSQLのベクトル拡張
  - オープンソース(PostgreSQL？)
- pgvecto-rs
  - [PGVecto.rs](https://pgvecto.rs/)
  - pgvectorとは別のPostgreSQLのベクトル拡張
  - オープンソース(Apache 2.0)
- analyticdb
  - [AnalyticDB](https://www.alibabacloud.com/help/en/analyticdb/)
  - Alibaba Cloudが推進するベクトルデータベース？
  - MySQL版とPostgreSQL版があるらしい
- tidb
  - [TiDB, Powered by PingCAP](https://www.pingcap.com/)
  - 最近名前をよく目にするNewSQL
  - オープンソース(Apache 2.0)
- Chroma
  - [Chroma](https://www.trychroma.com/)
  - オープンソース(Apache 2.0)
- Oracle
  - Oracle DB？
  - 情報が少なく詳細不明
- relyt
  - 詳細不明
  - LangChainでの紹介: [Relyt | 🦜️🔗 LangChain](https://python.langchain.com/docs/integrations/vectorstores/relyt/)
- opensearch
  - [OpenSearch](https://opensearch.org/)
  - AWSがフォークさせたElasticSearch起源のデータベース
  - オープンソース(Apache 2.0)
- tencent
  - [Tencent Cloud VectorDB | Tencent Cloud](https://www.tencentcloud.com/products/vdb)
  - Tencent Cloudのサービス？
- elasticsearch
  - [Elasticsearch | オフィシャルの分散型検索/分析エンジン | Elastic | Elastic](https://www.elastic.co/jp/elasticsearch)
  - オープンソース(<https://github.com/elastic/elasticsearch/blob/main/LICENSE.txt>)

生成AIブームの後押しで、どのクラウドサービスもベクトルデータベースに力を入れている。

しかし、AWSはOpenSearchのサポートは見られるが、AzureやGCPに合わせた対応は見られない。逆にAlibaba Cloud、Tencent Cloudへの対応が見られる。相対的に中国勢の強さが見られる対応状況だ。

## 本格利用に向けて

DifyのDocker ComposeプロジェクトにはWeaviateが含まれており、デフォルトでそれが使える状態になっている。

しかし本番運用ではスケーラビリティの点で不安がある。弾力性のあるクラウドサービスを選択するのが無難だろう。

Difyはストレージもいろいろと選択できる。その対応についても今後調査してみたい。
