/**
 * MlbBrowserGames.qml
 * mlb/components/MlbBrowserGames.qml
 */

import QtQuick 1.1
import "../js/global.js" as Global
import "../js/mlb.js" as Mlb

FocusScope {
  id: browser
  width: 1206
  height: 924

  property bool focusAfterLoad: true
  property string lastRefreshed: "";
  property alias count: gameListModel.count
  property alias text: datelabel.text
  property alias currentIndex: gameList.currentIndex

  signal leftPressed
  signal escapePressed
  signal returnPressed(int index)

  onFocusChanged: {
    if (browser.activeFocus && !gameList.activeFocus) {
      if (noGamesButton.visible) forceFocus(noGamesButton);
      else forceFocus(gameList);
    }
  }

  function reset() {
    focusAfterLoad = false;
    noGames.visible = false;
    feeds.visible = false;
    gameList.visible = true;
    gameListModel.clear();
    datelabel.text = Qt.formatDate(new Date(), 'dddd, MMMM d, yyyy');
  }

  function fillGameData(data) {
    try {
      gameListModel.clear();

      for (var i = 0; i < data.length; i++) {
        var g = data[i];
        gameListModel.append(g);
      }

      focusAfterLoad = false;
      lastRefreshed = Qt.formatDateTime(new Date(), "MM/dd/yy hh:mm:ss ap");

      if (debugMode)
        Mlb.printf('Loaded %d game item(s)', gameListModel.count);

      if (gameListModel.count === 0) {
        noGamesLabel.text = (calendarMode) ? "Games on this date are still to be determined." : "There are no games scheduled for today.";
        noGames.visible = true;
      }
    }
    catch (e) {
      Mlb.printError(e);
      noGamesLabel.text = "There was an error loading games";
      noGames.visible = true;
    }
  }

  MlbLabel {
    id: datelabel
    font.pixelSize: 42
    text: Qt.formatDate(new Date(), 'dddd, MMMM d, yyyy')
  }

  Rectangle {
    id: separatorBar
    height: 16
    opacity: 0.1
    color: "white"
    width: parent.width
    anchors.topMargin: 5
    anchors.top: datelabel.bottom
  }

  Item {
    id: noGames
    visible: false
    anchors.fill: parent

    onVisibleChanged: {
      if (noGames.visible) {
        if (calendarMode) {
          noGamesButton.visible = true;
          forceFocus(noGamesButton);
        }
      }
    }

    MlbLabel {
      id: noGamesLabel
      font.pixelSize: 48
      anchors.verticalCenterOffset: -260
      anchors.verticalCenter: parent.verticalCenter
      anchors.horizontalCenter: parent.horizontalCenter
      text: "There are no games scheduled for today."
    }

    MlbItemHighlight {
      id: noGamesButton
      height: 80
      width: 300
      visible: false
      selected: activeFocus
      anchors.topMargin: 40
      anchors.top: noGamesLabel.bottom
      anchors.horizontalCenter: noGamesLabel.horizontalCenter
      Keys.onLeftPressed: leftPressed();
      Keys.onEscapePressed: escapePressed();
      Keys.onReturnPressed: escapePressed();

      MlbLabel {
        font.bold: true
        font.pixelSize: 32
        text: "Go Back"
        anchors.centerIn: parent
      }
    }
  }

  Item {
    id: feeds
    height: 670
    visible: false
    width: parent.width
    anchors.topMargin: 10
    anchors.top: separatorBar.bottom

    ListView {
      id: feedListGame
      clip: true
      focus: false
      visible: true
      height: 86
      width: parent.width
      delegate: MlbGameItem {}
      model: ListModel {
        id: feedListGameModel
      }
    }

    ListView {
      id: feedList
      clip: true
      focus: false
      visible: true
      height: 670
      width: parent.width
      anchors.topMargin: 14
      anchors.top: feedListGame.bottom
      section.property: "type"
      section.criteria: ViewSection.FullString
      Keys.onLeftPressed: leftPressed();

      Keys.onReturnPressed: {
        var game = feedListGameModel.get(0);
        Mlb.playVideo(feedListGameModel.get(0), feedListModel.get(currentIndex));
      }

      Keys.onEscapePressed: {
        if (initPlayback) {
          initPlayback = false;
          boxeeAPI.mediaPlayer().stop();
          Mlb.uiHideWait();
        }
        else {
          feeds.visible = false;
          gameList.visible = true;
          forceFocus(gameList);
        }
      }

      section.delegate: Item {
        height: 80
        MlbLabel {
          x: 5
          text: (section === 'video') ? 'Video' : 'Audio'
          anchors.verticalCenter: parent.verticalCenter
        }
      }

      delegate: Item {
        height: 80

        Image {
          x: 15
          y: 25
          width: 30
          height: 30
          source: "../media/arrow-off.png"
          mirror: true
        }

        MlbLabel {
          x: 60
          text: name
          anchors.verticalCenter: parent.verticalCenter
        }
      }

      highlight: MlbItemHighlight {
        height: 80
        width: 1205
        selected: true
        visible: feedList.activeFocus
      }

      model: ListModel {
        id: feedListModel
      }
    }
  }

  ListView {
    id: gameList
    clip: true
    height: 800
    width: 1305
    contentHeight: 80
    contentWidth: 1305
    anchors.topMargin: 10
    anchors.top: separatorBar.bottom
    preferredHighlightBegin: 320
    preferredHighlightEnd: 400
    highlightRangeMode: ListView.ApplyRange

    Keys.onLeftPressed: leftPressed();
    Keys.onEscapePressed: escapePressed();
    Keys.onReturnPressed: {
      var activeGame = gameListModel.get(gameList.currentIndex);

      if (activeGame.mediaState !== 'media_off' && activeGame.media) {
        var feedlst = activeGame.media;
        feedListModel.clear();
        feedListGameModel.clear();
        feedListGameModel.append(activeGame);

        for (var media in feedlst) {
          if (feedlst[media].state !== 'media_off') {
            if (feedlst[media].type === 'video')
              feedListModel.insert(0, feedlst[media]);
            else if (feedlst[media].type === 'audio' && feedlst[media].state === 'media_on')
              feedListModel.append(feedlst[media]);
          }
        }

        if (feedListModel.count > 0) {
          feedList.currentIndex = 0;
          gameList.visible = false;
          feeds.visible = true;
          forceFocus(feedList);
        }
        else Mlb.uiOkDialog('MLB.TV', 'There is currently no media available for this game.')
      }
      else Mlb.uiOkDialog(undefined, "This game is not currently available for playback.");
    }

    delegate: MlbGameItem {}

    highlight: MlbItemHighlight {
      height: 80
      width: 1205
      selected: true
      visible: gameList.activeFocus
    }

    model: ListModel {
      id: gameListModel;
    }
  }

  Image {
    id: arrowdown
    width: 45
    height: 18
    source: "../media/arrow-down.png"
    anchors.topMargin: 10
    anchors.top: gameList.bottom
    anchors.horizontalCenter: parent.horizontalCenter
    visible: gameList.visible && !gameList.atYEnd && (gameList.count > 0)
  }

  Timer {
    id: gameRefresh
    repeat: true
    running: scoreboardRefresh
    interval: scoreboardRefreshInterval;
    onTriggered: Mlb.loadGames(new Date(), fillGameData, true);
  }
}
