// 詳説 LightFile Proxy (3) の図。事前変換・同期変換・半同期変換を同じ登場人物で3枚。
workspace "変換のタイミング" "いつ変換するかで3つに分かれる" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"
    operator = person "サイト運営者" "" "エンドユーザー"
    cdn = softwareSystem "CDN" "" "顧客" {
      tags "顧客"
    }
    origin = softwareSystem "オリジン" "" "顧客" {
      tags "顧客"
    }

    sys = softwareSystem "画像変換の仕組み" {
      tags "自社"
      proxy = container "中継機能" "" "" {
        tags "自社"
      }
      converter = container "変換機能" "" "" {
        tags "自社"
      }
      store = container "キャッシュ" "" "" {
        tags "データ"
      }
    }

    operator -> converter "全画像の変換を指示"
    converter -> origin "全画像を読む"
    converter -> store "全画像ぶんのWebPを置く"
    viewer -> cdn "画像をリクエスト"
    cdn -> store "変換済みを取りに行く"
    store -> cdn "WebP"
    cdn -> proxy "転送"
    cdn -> proxy "転送（短いキャッシュが切れている）"
    proxy -> origin "オリジナルを取りに行く"
    origin -> proxy "JPEG/PNG/GIF"
    proxy -> converter "その場で変換する"
    converter -> proxy "WebP"
    proxy -> converter "変換を依頼する"
    proxy -> converter "変換を依頼する（積むだけ）"
    proxy -> converter "変換を依頼する（バックグラウンド）"
    proxy -> store "変換済みを探す"
    store -> proxy "まだ無い"
    store -> proxy "WebP"
    converter -> store "WebPを置く"
    converter -> store "WebPを置く（応答の外）"
    proxy -> cdn "WebPを返す"
    proxy -> cdn "WebPを返す（長いキャッシュ）"
    proxy -> cdn "オリジナルを返す（短いキャッシュ）"
    cdn -> viewer "WebP"
    cdn -> viewer "JPEG/PNG/GIF"
  }

  views {
    dynamic sys "prebuild" "事前変換: 先に全部変換しておく" {
      operator -> converter "全画像の変換を指示"
      converter -> origin "全画像を読む"
      converter -> store "全画像ぶんのWebPを置く"
      viewer -> cdn "画像をリクエスト"
      cdn -> store "変換済みを取りに行く"
      store -> cdn "WebP"
      cdn -> viewer "WebP"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic sys "sync" "同期変換: リクエストの中で変換する" {
      viewer -> cdn "画像をリクエスト"
      cdn -> proxy "転送"
      proxy -> origin "オリジナルを取りに行く"
      origin -> proxy "JPEG/PNG/GIF"
      proxy -> converter "その場で変換する"
      converter -> proxy "WebP"
      proxy -> cdn "WebPを返す"
      cdn -> viewer "WebP"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic sys "semisync-first" "半同期変換 1回目: オリジナルを返し、変換は積むだけ" {
      viewer -> cdn "画像をリクエスト"
      cdn -> proxy "転送"
      proxy -> origin "オリジナルを取りに行く"
      origin -> proxy "JPEG/PNG/GIF"
      proxy -> cdn "オリジナルを返す（短いキャッシュ）"
      cdn -> viewer "JPEG/PNG/GIF"
      proxy -> converter "変換を依頼する（バックグラウンド）"
      converter -> store "WebPを置く"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic sys "semisync-second" "半同期変換 2回目以降: 変換済みを返す" {
      viewer -> cdn "画像をリクエスト"
      cdn -> proxy "転送（短いキャッシュが切れている）"
      proxy -> store "変換済みを探す"
      store -> proxy "WebP"
      proxy -> cdn "WebPを返す（長いキャッシュ）"
      cdn -> viewer "WebP"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
