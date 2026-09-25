// 詳説 LightFile Proxy (7) の図。キャッシュの延命とクリアの流れ。
workspace "キャッシュの流れ" "使い回すときと、消すとき" {

  model {
    operator = person "サイト運用者" "" "エンドユーザー"
    cdn = softwareSystem "CloudFront" "" "顧客" {
      tags "顧客"
    }
    origin = softwareSystem "オリジンサーバー" "" "顧客" {
      tags "顧客"
    }

    sys = softwareSystem "LightFile Proxy" {
      tags "自社"
      proxy = container "中継機能" "" "" {
        tags "自社"
      }
      admin = container "管理機能" "" "" {
        tags "自社"
      }
      store = container "キャッシュ" "" "" {
        tags "データ"
      }
    }

    cdn -> proxy "転送"
    proxy -> store "変換済みを探す"
    store -> proxy "あるが期限切れ"
    proxy -> origin "HEADで更新を確かめる"
    origin -> proxy "etag / last-modified（変わっていない）"
    proxy -> cdn "変換済みのWebPを返す（長いキャッシュ）"
    proxy -> store "期限を延ばす"

    operator -> admin "消す条件を指定してクリアを実行"
    admin -> store "条件に当たる変換済みを削除"
    store -> admin "削除した件数"
    admin -> cdn "対応するパスの無効化をリクエスト"
    cdn -> admin "受け付けた"
    admin -> operator "結果を返す"
  }

  views {
    dynamic sys "revalidate" "期限が切れたキャッシュを延命して使い回す" {
      cdn -> proxy "転送"
      proxy -> store "変換済みを探す"
      store -> proxy "あるが期限切れ"
      proxy -> origin "HEADで更新を確かめる"
      origin -> proxy "etag / last-modified（変わっていない）"
      proxy -> cdn "変換済みのWebPを返す（長いキャッシュ）"
      proxy -> store "期限を延ばす"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic sys "clear" "ひとつの操作で両方のキャッシュを消す" {
      operator -> admin "消す条件を指定してクリアを実行"
      admin -> store "条件に当たる変換済みを削除"
      store -> admin "削除した件数"
      admin -> cdn "対応するパスの無効化をリクエスト"
      cdn -> admin "受け付けた"
      admin -> operator "結果を返す"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
