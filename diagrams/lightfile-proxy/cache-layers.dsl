// 詳説 LightFile Proxy (7) の図。キャッシュの層。
workspace "キャッシュの層" "CDNの裏にもう一段置く" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"
    cf = softwareSystem "CloudFront" "短い期間で入れ替わる" "顧客" {
      tags "顧客"
    }
    origin = softwareSystem "オリジンサーバー" "" "顧客" {
      tags "顧客"
    }
    lfp = softwareSystem "LightFile Proxy" {
      tags "自社"
      proxy = container "プロキシ" "" "Go" {
        tags "自社"
      }
      cache = container "変換キャッシュ" "変換済みを持ち続ける" "" {
        tags "データ"
      }
    }

    viewer -> cf "画像をリクエスト"
    cf -> proxy "CloudFrontに無ければ"
    proxy -> cache "変換済みを探す"
    proxy -> origin "更新をHEADで確かめる"
  }

  views {
    container lfp "layers" "キャッシュの層" {
      include *
      autoLayout lr
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
