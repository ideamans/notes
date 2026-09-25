// 詳説 LightFile Proxy (6) の図。平常時と迂回時。
workspace "障害時の迂回" "止まっても画像は止まらない" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"
    cf = softwareSystem "CloudFront" "オリジングループを設定" "顧客" {
      tags "顧客"
    }
    origin = softwareSystem "オリジンサーバー" "優先2番目" "顧客" {
      tags "顧客"
    }
    lfp = softwareSystem "LightFile Proxy" "優先1番目" {
      tags "自社"
    }

    viewer -> cf "画像をリクエスト"
    cf -> lfp "まずここへ取りに行く"
    lfp -> origin "オリジナルを取りに行く"
    cf -> origin "503が返ったらこちらへ" {
      tags "迂回"
    }
  }

  views {
    systemLandscape "normal" "平常時" {
      include viewer cf lfp origin
      exclude cf->origin
      autoLayout lr
    }

    systemLandscape "failover" "LightFile Proxyが503を返したとき" {
      include viewer cf lfp origin
      autoLayout lr
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
