/**
 * MlbBrowserStandings.qml
 * mlb/components/MlbBrowserStandings.qml
 */

import QtQuick 1.1
import "../js/global.js" as Global
import "../js/mlb.js" as Mlb

FocusScope {
  id: browser
  width: 1206
  height: 924

  signal leftPressed
  signal escapePressed

  onFocusChanged: {
    if (browser.activeFocus && !standingsList.activeFocus)
      forceFocus(standingsList);
  }

  function updateFavorites() {
    for (var i = 0; i < standingsListModel.count; i++) {
      var fav = Mlb.isFavorite(standingsListModel.get(i).file_code);
      standingsListModel.setProperty(i, 'favorite', fav);
    }
  }

  function loadStandings() {
    try {
      standingsListModel.clear();
      var data = Global.standings;
      for (var i = 0; i < data.length; i++) {
        data[i].favorite = Mlb.isFavorite(data[i].file_code);
        standingsListModel.append(data[i]);
      }
    }
    catch (e) {
      Mlb.printError(e);
    }
  }

  Image {
    id: arrowup
    height: 18
    width: 45
    source: "../media/arrow-up.png"
    anchors.bottomMargin: 10
    anchors.bottom: standingsList.top
    anchors.horizontalCenter: standingsList.horizontalCenter
    visible: standingsList.visible && (!standingsList.atYBeginning)
  }

  Image {
    id: arrowdown
    height: 18
    width: 45
    source: "../media/arrow-down.png"
    anchors.topMargin: 10
    anchors.top: standingsList.bottom
    anchors.horizontalCenter: standingsList.horizontalCenter
    visible: standingsList.visible && (!standingsList.atYEnd)
  }

  ListView {
    id: standingsList
    focus: true
    clip: true
    width: 1206
    height: 880
    contentHeight: 80
    contentWidth: 1206
    preferredHighlightBegin: 320
    preferredHighlightEnd: 480
    highlightRangeMode: ListView.ApplyRange
    section.property: "section"
    section.criteria: ViewSection.FullString
    Keys.onLeftPressed: leftPressed();
    Keys.onEscapePressed: escapePressed();

    section.delegate: Item {
      height: 80

      MlbLabel {
        x: 5
        opacity: 0.5
        text: section
        font.bold: true
        font.pixelSize: 32
        anchors.verticalCenter: parent.verticalCenter
      }

      MlbLabel {
        x: 280
        opacity: 0.2
        font.bold: true
        font.pixelSize: 28
        text: "W\t    L\t       GB\t    PCT\t   LT\t       HOME\t         AWAY"
        anchors.verticalCenter: parent.verticalCenter
      }
    }

    delegate: Row {
      x: 20
      width: 1206
      height: 80
      spacing: 48

      Item {
        height: 80
        width: 200

        Image {
          id: teamlogo
          width: 70
          height: 58
          source: "http://mlb.com/images/homepage/team/y2011/logos/" + file_code.toLowerCase() + ".png"
          anchors.verticalCenter: parent.verticalCenter
          anchors.verticalCenterOffset: -2
        }

        Image {
          width: 32
          height: 32
          source: "../media/star.png"
          anchors.verticalCenter: teamlogo.top
          anchors.horizontalCenter: teamlogo.right
          anchors.verticalCenterOffset: 5
          anchors.horizontalCenterOffset: -5
          visible: favorite
        }

        MlbLabel {
          x: 80
          text: team_abbrev
          font.pixelSize: 38
          anchors.verticalCenter: parent.verticalCenter
        }
      }

      MlbLabel {
        width: 60
        text: w
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 60
        text: l
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 80
        text: gb
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 100
        text: pct
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 80
        text: last_ten
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 120
        text: home
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }

      MlbLabel {
        width: 120
        text: away
        font.pixelSize: 38
        anchors.verticalCenter: parent.verticalCenter
        horizontalAlignment: Text.AlignHCenter
      }
    }

    highlight: MlbItemHighlight {
      height: 80
      width: 1206
      selected: true
      visible: standingsList.activeFocus
    }

    model: ListModel {
      id: standingsListModel;
    }
  }
}
