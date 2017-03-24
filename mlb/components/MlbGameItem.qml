/**
 * MlbGameItem.qml
 * mlb/components/MlbGameItem.qml
 */

import QtQuick 1.0

Item {
  height: 80
  width: 1305

  MlbLabel {
    x: 1205
    width: 100
    text: "FREE"
    font.bold: true
    font.pixelSize: 26
    horizontalAlignment: Text.AlignHCenter
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    visible: (isFree)
  }

  Image {
    id: teamlogo
    x: 20
    width: 70
    height: 58
    source: away.logo
    anchors.verticalCenter: parent.verticalCenter
  }

  Image {
    width: 32
    height: 32
    source: "../media/star.png"
    anchors.verticalCenter: teamlogo.top
    anchors.horizontalCenter: teamlogo.right
    anchors.verticalCenterOffset: 5
    anchors.horizontalCenterOffset: -5
    visible: away.favorite
  }

  MlbLabel {
    x: 108
    font.pixelSize: 40
    text: away.name
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
  }

  MlbLabel {
    x: 246
    font.pixelSize: 40
    text: away.score
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    visible: archiveSpoiler
  }

  Image {
    id: teamlogo2
    x: 405
    width: 70
    height: 58
    source: home.logo
    anchors.verticalCenter: parent.verticalCenter
  }

  Image {
    width: 32
    height: 32
    source: "../media/star.png"
    anchors.verticalCenter: teamlogo2.top
    anchors.horizontalCenter: teamlogo2.right
    anchors.verticalCenterOffset: 5
    anchors.horizontalCenterOffset: -5
    visible: home.favorite
  }

  MlbLabel {
    x: 498
    font.pixelSize: 40
    text: home.name
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
  }

  MlbLabel {
    x: 649
    font.pixelSize: 40
    text: home.score
    horizontalAlignment: Text.AlignRight
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    visible: archiveSpoiler
  }

  Item {
    x: 809
    width: 54
    height: 54
    anchors.verticalCenter: parent.verticalCenter
    visible: inProgress

    Image {
      id: base_second
      width: 24
      height: 24
      source: "../media/base.png"
      anchors.horizontalCenter: bases.horizontalCenter
      visible: runnerOn2b
    }

    Image {
      id: base_third
      width: 24
      height: 24
      source: "../media/base.png"
      anchors.verticalCenter: bases.verticalCenter
      visible: runnerOn3b
    }

    Image {
      id: base_first
      x: 30
      width: 24
      height: 24
      source: "../media/base.png"
      anchors.verticalCenter: bases.verticalCenter
      visible: runnerOn1b
    }

    Image {
      id: bases
      width: 54
      height: 54
      source: "../media/bases.png"
    }
  }

  MlbLabel {
    x: 901
    font.pixelSize: 40
    text: outs + " OUTS"
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    visible: inProgress
  }

  MlbLabel {
    x: 1088
    text: inning
    font.pixelSize: 40
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    visible: inProgress
  }

  Image {
    x: 1136
    width: 30
    height: 42
    source: (topInning) ? "../media/inning-top.png" : "../media/inning-bottom.png";
    anchors.verticalCenter: parent.verticalCenter
    visible: inProgress
  }

  MlbLabel {
    x: 809
    width: 370
    font.pixelSize: 40
    text: statusText
    anchors.verticalCenter: parent.verticalCenter
    anchors.verticalCenterOffset: 1
    horizontalAlignment: Text.AlignRight
    visible: !inProgress
  }
}
