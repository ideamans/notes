// 詳説 LightFile Proxy (8) の図。1つのクラスタで複数サイトを捌く。
workspace "複数サイトの振り分け" "ヘッダとパスで行き先を決める" {

  model {
    cfA = softwareSystem "CloudFront A" "サイトA" "顧客" {
      tags "顧客"
    }
    cfB = softwareSystem "CloudFront B" "サイトB" "顧客" {
      tags "顧客"
    }
    originA = softwareSystem "オリジンA" "既存のWebサーバー" "顧客" {
      tags "顧客"
    }
    originB = softwareSystem "オリジンB" "S3バケット" "顧客" {
      tags "顧客"
    }

    lfp = softwareSystem "LightFile Proxy" "1つのクラスタ" {
      tags "自社"
    }

    cfA -> lfp "x-routing: site-a を付けて転送"
    cfB -> lfp "x-routing: site-b を付けて転送"
    lfp -> originA "Hostを付け替えて取得"
    lfp -> originB "S3から取得"
  }

  views {
    systemLandscape "routing" "1つのクラスタで複数サイト" {
      include *
      autoLayout lr
    }

    !include ../../../../.claude/skills/structurizr-diagram/lib/styles.dsl
  }
}
