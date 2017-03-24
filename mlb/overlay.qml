/**
 * overlay
 * mlb/overlay.qml
 */

import QtQuick 1.1
import BoxeeRuntime 1.0
import boxee.components 1.0
import "components"
import "js/mlb.js" as Mlb
import "js/global.js" as Global

Window {
  id: rootOverlay
  focalItem: menuList

  property int selectedIndex: 0;
  property variant menuViews;

  Component.onCompleted: {
    var i;
    Mlb.uiShowWait();
    audioListModel.clear();
    inningsListModel.clear();
    eventsListModel.clear();
    runScoringModel.clear();

    if (Global.activeGame.gameData.innings.length) {
      for (i = 0; i < Global.activeGame.gameData.innings.length; i++)
        inningsListModel.append(Global.activeGame.gameData.innings[i]);
      menuListModel.append({
        name: "Innings",
        isSelected: ((menuListModel.count === 0) ? true : false)
      });
    }

    if (Global.activeGame.gameData.events.length) {
      for (i = 0; i < Global.activeGame.gameData.events.length; i++)
        eventsListModel.append(Global.activeGame.gameData.events[i]);
      menuListModel.append({
        name: "Game Events",
        isSelected: ((menuListModel.count === 0) ? true : false)
      });
    }

    if (Global.activeGame.gameData.runscoring.length) {
      for (i = 0; i < Global.activeGame.gameData.runscoring.length; i++)
        runScoringModel.append(Global.activeGame.gameData.runscoring[i]);
      menuListModel.append({
        name: "Run Scoring Plays",
        isSelected: ((menuListModel.count === 0) ? true : false)
      });
    }

    if (Global.activeGame.audio.length) {
      for (i = 0; i < Global.activeGame.audio.length; i++) {
        Global.activeGame.audio[i].abbrev = '';
        Global.activeGame.audio[i].isSelected = (i === Global.activeAudioTrack);
        audioListModel.append(Global.activeGame.audio[i]);
      }
      menuListModel.append({
        name: "Audio Track",
        isSelected: ((menuListModel.count === 0) ? true : false)
      });
    }

    noDataLabel.visible = (menuListModel.count === 0)
    Mlb.uiHideWait();
  }

  Keys.onPressed: {
    switch (event.key) {
      case Qt.Key_Escape:
        {
          windowManager.pop();
          break;
        }
    }
  }

  Item {
    width: 1920
    height: 1080

    MlbLabel {
      id: noDataLabel
      font.pixelSize: 48
      anchors.centerIn: parent
      text: "No game data available."
      visible: false
    }

    Image {
      id: badge
      y: 60
      x: 90
      width: 260
      height: 72
      source: "media/mlb-badge.png"
    }

    ListView {
      id: menuList
      focus: true
      y: 225
      width: 460
      height: 500
      highlightMoveDuration: 50
      highlightFollowsCurrentItem: true
      orientation: ListView.Vertical

      property string activeItemLabel: ''

      onCurrentIndexChanged: {
        selectedIndex = currentIndex;
        activeItemLabel = menuListModel.get(currentIndex).name
        for (var i = 0; i < menuListModel.count; i++)
          menuListModel.setProperty(i, "isSelected", (i === currentIndex));
      }

      Keys.onRightPressed: {
        switch (activeItemLabel) {
          case "Innings":
            forceFocus(inningsList);
            break;
          case "Game Events":
            forceFocus(eventsList);
            break;
          case "Run Scoring Plays":
            forceFocus(runScoring);
            break;
          case "Audio Track":
            forceFocus(audioList);
            break;
        }
      }

      delegate: Item {
        height: 80
        width: 460

        MlbItemHighlight {
          anchors.fill: parent
          selected: false
          width: 460
          visible: (isSelected && menuList.activeFocus && !parent.ListView.isCurrentItem) || (isSelected && !menuList.activeFocus)
        }

        MlbLabel {
          x: 75
          text: name
          font.pixelSize: 40
          anchors.verticalCenterOffset: 3
          anchors.verticalCenter: parent.verticalCenter
        }
      }

      highlight: MlbItemHighlight {
        height: 80
        width: 460
        selected: true
        visible: menuList.activeFocus
      }

      model: ListModel {
        id: menuListModel
      }
    }

    Item {
      id: menuListContainer
      y: 100
      width: 1200
      height: 720
      anchors.leftMargin: 110
      anchors.left: menuList.right

      Image {
        id: arrowup
        height: 18
        width: 45
        source: "media/arrow-up.png"
        anchors.bottomMargin: 20
        anchors.bottom: inningsList.top
        anchors.horizontalCenter: (inningsList.visible) ? inningsList.horizontalCenter : runScoring.horizontalCenter
        visible: (inningsList.visible && !inningsList.atYBeginning) ||
          (eventsList.visible && !eventsList.atYBeginning) ||
          (runScoring.visible && !runScoring.atYBeginning)
      }

      Image {
        id: arrowdown
        width: 45
        height: 18
        source: "media/arrow-down.png"
        anchors.topMargin: 20
        anchors.top: inningsList.bottom
        anchors.horizontalCenter: (inningsList.visible) ? inningsList.horizontalCenter : runScoring.horizontalCenter
        visible: (inningsList.visible && !inningsList.atYEnd && (inningsList.count > 0)) ||
          (eventsList.visible && !eventsList.atYEnd && (eventsList.count > 0)) ||
          (runScoring.visible && !runScoring.atYEnd && (runScoring.count > 0))
      }

      ListView {
        id: inningsList
        width: 400
        height: 880
        clip: true
        contentHeight: 80
        contentWidth: 400
        preferredHighlightBegin: 320
        preferredHighlightEnd: 480
        highlightRangeMode: ListView.ApplyRange
        visible: (menuList.activeItemLabel === "Innings")

        Keys.onLeftPressed: forceFocus(menuList);
        Keys.onReturnPressed: {
          var inning = inningsListModel.get(currentIndex);
          boxeeAPI.mediaPlayer().hlsChapter(inning.time);
          windowManager.pop();
        }

        model: ListModel {
          id: inningsListModel
        }
        delegate: MlbItem {}
        highlight: MlbItemHighlight {
          visible: (inningsList.activeFocus)
        }
      }

      ListView {
        id: eventsList
        clip: true
        focus: false
        width: 1206
        height: 873
        contentHeight: 97
        contentWidth: 1206
        preferredHighlightBegin: 388
        preferredHighlightEnd: 574
        highlightRangeMode: ListView.ApplyRange
        visible: (menuList.activeItemLabel === "Game Events")

        Keys.onLeftPressed: forceFocus(menuList);
        Keys.onReturnPressed: {
          var event = eventsListModel.get(currentIndex);
          boxeeAPI.mediaPlayer().hlsChapter(event.time);
          windowManager.pop();
        }

        section.property: "section"
        section.criteria: ViewSection.FullString
        section.delegate: Item {
          height: 97
          MlbLabel {
            x: 5
            opacity: 0.5
            text: section
            font.bold: true
            font.pixelSize: 32
            anchors.verticalCenter: parent.verticalCenter
          }
        }

        model: ListModel {
          id: eventsListModel
        }

        highlight: MlbItemHighlight {
          height: 97
          width: 1200
          visible: (eventsList.activeFocus);
        }

        delegate: MlbItem {
          pixelSize: 30
          width: 1200
          height: 97
          clip: true
          wrapMode: Text.Wrap
          labelVerticalOffset: 2
        }
      }

      ListView {
        id: runScoring
        clip: true
        focus: false
        width: 1206
        height: 873
        contentHeight: 97
        contentWidth: 1206
        preferredHighlightBegin: 388
        preferredHighlightEnd: 572
        highlightRangeMode: ListView.ApplyRange
        visible: (menuList.activeItemLabel === "Run Scoring Plays")

        Keys.onLeftPressed: forceFocus(menuList);
        Keys.onReturnPressed: {
          var event = runScoringModel.get(currentIndex);
          boxeeAPI.mediaPlayer().hlsChapter(event.time);
          windowManager.pop();
        }

        model: ListModel {
          id: runScoringModel
        }

        highlight: MlbItemHighlight {
          height: 97
          width: 1200
          visible: (runScoring.activeFocus);

        }
        delegate: MlbItem {
          pixelSize: 30
          width: 1200
          height: 97
          clip: true
          wrapMode: Text.Wrap
          labelVerticalOffset: 2
        }
      }


      MlbSelectList {
        id: audioList
        clip: true
        visible: (menuList.activeItemLabel === "Audio Track")
        Keys.onLeftPressed: forceFocus(menuList);

        onClicked: {
          if (currentIndex !== Global.activeAudioTrack) {
            Global.activeAudioTrack = currentIndex;
            boxeeAPI.mediaPlayer().setAudioTrack(Global.activeGame.audio[currentIndex].id);
            windowManager.pop();
          }
        }

        model: ListModel {
          id: audioListModel
        }
        delegate: MlbItem {
          isSelectItem: true;
        }
        highlight: MlbItemHighlight {
          visible: (audioList.activeFocus)
        }
      }
    }

    Image {
      width: 24
      height: 1080
      source: "media/divider-vert.png"
      anchors.leftMargin: 50
      anchors.left: menuList.right
      visible: !noDataLabel.visible
    }
  }
}
