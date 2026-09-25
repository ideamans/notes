// 詳説 LightFile Proxy (6) の図。死活監視がCloudFrontの設定を入れ替える様子を4枚に分ける。
workspace "縮退と復旧の経路" "死活監視がCloudFrontのオリジングループを入れ替える" {

  model {
    viewer = person "エンドユーザー" "" "エンドユーザー"
    ops = person "運用担当者" "" "エンドユーザー"
    cf = softwareSystem "CloudFront" "オリジングループを設定" "顧客"
    origin = softwareSystem "オリジンサーバー" "" "顧客"
    lfp = softwareSystem "LightFile Proxy" "" "自社"
    watch = softwareSystem "死活監視" "5分ごとに動く" "自社"

    viewer -> cf "画像をリクエスト" "" "リクエスト"
    cf -> lfp "1番目のオリジン" "" "通常経路"
    lfp -> origin "オリジナルを取得" "" "通常経路"
    cf -> origin "直接取りに行く" "" "迂回経路,迂回"
    cf -> lfp "経路から外れている" "" "切り離し"
    watch -> lfp "ping.jpgが返らない" "" "監視NG,迂回"
    watch -> cf "優先順を入れ替える" "" "切り戻し,迂回"
    watch -> ops "ダウンを知らせる" "" "通知NG,迂回"
    watch -> lfp "ping.jpgが返る" "" "監視OK"
    watch -> cf "優先順を元に戻す" "" "復帰"
    watch -> ops "復旧を知らせる" "" "通知OK"
    watch -> lfp "5分ごとに確かめる" "" "監視中"
  }

  views {
    systemLandscape "degrade-detect" "監視と切り戻し" {
      include viewer ops cf lfp origin watch
      exclude "relationship.tag==迂回経路"
      exclude "relationship.tag==切り離し"
      exclude "relationship.tag==監視OK"
      exclude "relationship.tag==復帰"
      exclude "relationship.tag==通知OK"
      exclude "relationship.tag==監視中"
      autoLayout lr
    }

    systemLandscape "degrade-bypass" "迂回経路" {
      include viewer cf lfp origin watch
      exclude "relationship.tag==通常経路"
      exclude "relationship.tag==監視NG"
      exclude "relationship.tag==切り戻し"
      exclude "relationship.tag==監視OK"
      exclude "relationship.tag==復帰"
      autoLayout lr
    }

    systemLandscape "recover-detect" "監視と復帰" {
      include viewer ops cf lfp origin watch
      exclude "relationship.tag==通常経路"
      exclude "relationship.tag==監視NG"
      exclude "relationship.tag==切り戻し"
      exclude "relationship.tag==通知NG"
      exclude "relationship.tag==監視中"
      autoLayout lr
    }

    systemLandscape "recover-path" "経路の復旧" {
      include viewer cf lfp origin watch
      exclude "relationship.tag==迂回経路"
      exclude "relationship.tag==切り離し"
      exclude "relationship.tag==監視NG"
      exclude "relationship.tag==切り戻し"
      exclude "relationship.tag==監視OK"
      exclude "relationship.tag==復帰"
      autoLayout lr
    }

    styles {
      element "Element" {
        background #ffffff
        color #1f2937
        stroke #9ca3af
        strokeWidth 2
        fontSize 24
        shape RoundedBox
      }
      element "Person" {
        shape Person
        background #f3f4f6
        color #1f2937
        stroke #9ca3af
      }
      element "自社" {
        background #1168bd
        color #ffffff
        stroke #0b4884
      }
      element "顧客" {
        background #64748b
        color #ffffff
        stroke #475569
      }
      relationship "Relationship" {
        color #4b5563
        fontSize 22
        thickness 2
      }
      relationship "迂回" {
        color #b91c1c
        thickness 3
      }
      relationship "切り離し" {
        color #94a3b8
        thickness 2
      }
      relationship "監視中" {
        color #6b7280
        thickness 2
      }
    }
  }
}
