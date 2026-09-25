// 詳説 LightFile Proxy (1) の図。導入前と導入後を同じ形で2枚。
workspace "LightFile Proxy" "CloudFrontとオリジンの間に画像変換を挟む" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"

    cf = softwareSystem "CloudFront" "お客様のCDN" "顧客" {
      tags "顧客"
    }

    origin = softwareSystem "オリジンサーバー" "既存のWebサーバー・S3" "顧客" {
      tags "顧客"
    }

    lfp = softwareSystem "LightFile Proxy" "配信する画像だけWebPにする" {
      tags "自社"
    }

    viewer -> cf "画像をリクエスト"
    cf -> origin "JPEG/PNG/GIFを取りに行く"
    cf -> lfp "画像を取りに行く"
    lfp -> origin "オリジナルを取りに行く"
  }

  views {
    systemLandscape "before" "導入前" {
      include viewer cf origin
      autoLayout lr
    }

    systemLandscape "after" "導入後" {
      include viewer cf lfp origin
      exclude cf->origin
      autoLayout lr
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
