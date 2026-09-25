// 詳説 LightFile Proxy (2) の図。対応ブラウザと非対応ブラウザで何が届くか。
workspace "配信経路" "オリジナルは変えず、通り道でだけ差し替える" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"
    cf = softwareSystem "CloudFront" "" "顧客" {
      tags "顧客"
    }
    origin = softwareSystem "オリジン" "オリジナルはそのまま" "顧客" {
      tags "顧客"
    }
    lfp = softwareSystem "LightFile Proxy" {
      tags "自社"
    }

    viewer -> cf "GET /image.jpg（Accept: image/webp）"
    viewer -> cf "GET /image.jpg（Acceptにwebpなし）"
    cf -> lfp "転送"
    lfp -> origin "オリジナルを取りに行く"
    origin -> lfp "JPEG/PNG/GIF"
    lfp -> cf "Content-Type: image/webp"
    lfp -> cf "Content-Typeはそのまま"
    cf -> viewer "中身はWebP・URLは.jpgのまま"
    cf -> viewer "中身はJPEG/PNG/GIFのまま"
  }

  views {
    dynamic * "supported" "WebPに対応したブラウザ" {
      viewer -> cf "GET /image.jpg（Accept: image/webp）"
      cf -> lfp "転送"
      lfp -> origin "オリジナルを取りに行く"
      origin -> lfp "JPEG/PNG/GIF"
      lfp -> cf "Content-Type: image/webp"
      cf -> viewer "中身はWebP・URLは.jpgのまま"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic * "unsupported" "WebPに対応していないブラウザ" {
      viewer -> cf "GET /image.jpg（Acceptにwebpなし）"
      cf -> lfp "転送"
      lfp -> origin "オリジナルを取りに行く"
      origin -> lfp "JPEG/PNG/GIF"
      lfp -> cf "Content-Typeはそのまま"
      cf -> viewer "中身はJPEG/PNG/GIFのまま"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
