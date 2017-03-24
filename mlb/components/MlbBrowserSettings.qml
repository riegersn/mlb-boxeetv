/**
 * MlbBrowserSettings.qml
 * mlb/components/MlbBrowserSettings.qml
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
    if (browser.activeFocus && !settingsList.activeFocus)
      forceFocus(settingsList);
  }

  function loadSettings() {
    try {
      var teams = Global.teams;

      for (var i = 0; i < teams.length; i++) {
        var selected = Global.favoriteTeams.contains(teams[i]._team_id);
        settingsFavoriteTeamsModel.append({
          name: teams[i]._name_display_short,
          teamid: teams[i]._team_id,
          isSelected: selected,
          abbrev: teams[i]._name_abbrev.toLowerCase()
        });
      }

      gameScoresModel.clear()
      gameScoresModel.append({
        name: "Hide Scores",
        isSelected: !Global.archiveSpoiler,
        abbrev: ''
      });
      gameScoresModel.append({
        name: "Show Scores",
        isSelected: Global.archiveSpoiler,
        abbrev: ''
      });

      videoQualityModel.clear()
      videoQualityModel.append({
        name: "Low",
        isSelected: (Global.videoQuality == 0),
        abbrev: ''
      });
      videoQualityModel.append({
        name: "High",
        isSelected: (Global.videoQuality == 1),
        abbrev: ''
      });
      videoQualityModel.append({
        name: "Adaptive",
        isSelected: (Global.videoQuality == 2),
        abbrev: ''
      });
    }
    catch (e) {
      Mlb.printError(e);
      return;
    }
  }

  ListView {
    id: settingsList
    y: 125
    clip: true
    focus: true
    width: 400
    height: 670
    contentWidth: 400
    contentHeight: 124
    delegate: MlbItem {}

    Keys.onEscapePressed: escapePressed();
    Keys.onLeftPressed: leftPressed();
    Keys.onReturnPressed: {
      if (currentIndex === 3)
        Mlb.uiConfirmDialog('Are you sure you want to log out of this application?', Mlb.reset);
    }
    Keys.onRightPressed: {
      var views = [settingsFavoriteTeams, gameScores, videoQuality];
      forceFocus(views[currentIndex]);
    }

    highlight: MlbItemHighlight {
      height: 80
      width: 400
      selected: settingsList.activeFocus
    }

    model: ListModel {
      ListElement {
        name: "Favorite Teams"
        isSelected: false
      }
      ListElement {
        name: "Hide / Reveal Scores"
        isSelected: false
      }
      ListElement {
        name: "Set Video Quality"
        isSelected: false
      }
      ListElement {
        name: "Logout"
        isSelected: false
      }
    }
  }

  Image {
    width: 24
    height: 1080
    source: "../media/divider-vert.png"
    anchors.leftMargin: 50
    anchors.left: settingsList.right
  }

  Image {
    height: 18
    width: 45
    source: "../media/arrow-down.png"
    anchors.topMargin: 5
    anchors.top: settingsListContainer.bottom
    anchors.horizontalCenter: settingsListContainer.horizontalCenter
    visible: settingsFavoriteTeams.visible && (!settingsFavoriteTeams.atYEnd)
  }

  Image {
    height: 18
    width: 45
    source: "../media/arrow-up.png"
    anchors.topMargin: 5
    anchors.bottom: settingsListContainer.top
    anchors.horizontalCenter: settingsListContainer.horizontalCenter
    visible: settingsFavoriteTeams.visible && (!settingsFavoriteTeams.atYBeginning)
  }

  Item {
    id: settingsListContainer
    y: 125
    width: 400
    height: 720
    anchors.leftMargin: 110
    anchors.left: settingsList.right

    MlbSelectListImage {
      id: settingsFavoriteTeams
      visible: (settingsList.currentIndex === 0)
      preferredHighlightBegin: 320;
      preferredHighlightEnd: 400;
      highlightRangeMode: ListView.ApplyRange;

      Keys.onLeftPressed: forceFocus(settingsList);
      Keys.onEscapePressed: Mlb.exit(forceFocus(settingsFavoriteTeams));

      model: ListModel {
        id: settingsFavoriteTeamsModel
      }

      highlight: MlbItemHighlight {
        visible: (settingsFavoriteTeams.activeFocus)
      }

      onClicked: {
        var fteams = [];
        for (var i = 0; i < settingsFavoriteTeamsModel.count; i++) {
          if (settingsFavoriteTeamsModel.get(i).isSelected)
            fteams.push(settingsFavoriteTeamsModel.get(i).teamid);
        }

        Global.favoriteTeams = fteams;
        standingsBrowser.updateFavorites();
        Mlb.setFavoriteTeams();
      }
    }

    MlbSelectList {
      id: gameScores
      visible: (settingsList.currentIndex === 1)

      Keys.onLeftPressed: forceFocus(settingsList);
      Keys.onEscapePressed: Mlb.exit(forceFocus(gameScores));

      model: ListModel {
        id: gameScoresModel
      }

      delegate: MlbItem {
        isSelectItem: true;
      }

      highlight: MlbItemHighlight {
        visible: (gameScores.activeFocus)
      }

      onClicked: {
        archiveSpoiler = Global.archiveSpoiler = (currentIndex);
        Mlb.setArchiveSpoiler(Global.archiveSpoiler);
      }
    }

    MlbSelectList {
      id: videoQuality
      visible: (settingsList.currentIndex === 2)

      Keys.onLeftPressed: forceFocus(settingsList);
      Keys.onEscapePressed: Mlb.exit(forceFocus(videoQuality));

      model: ListModel {
        id: videoQualityModel
      }

      delegate: MlbItem {
        isSelectItem: true;
      }

      highlight: MlbItemHighlight {
        visible: (videoQuality.activeFocus)
      }
      
      onClicked: {
        Global.videoQuality = currentIndex
        Mlb.storeSetting('videoQuality', currentIndex);
      }
    }
  }
}
