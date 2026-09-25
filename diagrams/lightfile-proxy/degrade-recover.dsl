// 詳説 LightFile Proxy (6) の図。縮退と復旧。
workspace "縮退と復旧" "死活監視がCloudFrontの優先順を入れ替える" {

  model {
    ops = person "運用担当者" "" "エンドユーザー"
    watch = softwareSystem "死活監視" "5分ごとに動く" {
      tags "自社"
    }
    lfp = softwareSystem "LightFile Proxy" {
      tags "自社"
    }
    cf = softwareSystem "CloudFront" "お客様のアカウント" "顧客" {
      tags "顧客"
    }

    watch -> lfp "ping.jpgを6秒間隔で5回"
    lfp -> watch "応答なし"
    lfp -> watch "200 OK"
    watch -> cf "オリジングループの優先順を入れ替える"
    watch -> cf "優先順を元に戻す"
    watch -> ops "ダウンをメールで知らせる"
    watch -> ops "復旧をメールで知らせる"
  }

  views {
    dynamic * "degrade" "縮退: LightFile Proxyを経路から外す" {
      watch -> lfp "ping.jpgを6秒間隔で5回"
      lfp -> watch "応答なし"
      watch -> cf "オリジングループの優先順を入れ替える"
      watch -> ops "ダウンをメールで知らせる"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    dynamic * "recover" "復旧: 経路を元に戻す" {
      watch -> lfp "ping.jpgを6秒間隔で5回"
      lfp -> watch "200 OK"
      watch -> cf "優先順を元に戻す"
      watch -> ops "復旧をメールで知らせる"
      properties {
        "plantuml.sequenceDiagram" "true"
      }
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
