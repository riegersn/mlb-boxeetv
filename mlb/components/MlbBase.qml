/**
 * MlbBase
 * mlb/components/MlbBase.qml
 */

import QtQuick 1.0

FocusScope {
  id: baseMenu
  width: 1920
  height: 1080

  property int selectedIndex: 0
  property alias user: user.text
  property alias motd: message.text
  property alias index: menuList.currentIndex

  signal rightPressed
  signal escapePressed
  signal returnPressed

  onActiveFocusChanged: {
    if (baseMenu.visible && baseMenu.activeFocus && !menuList.activeFocus)
      forceFocus(menuList);
  }

  function forceIndex(num) {
    menuList.currentIndex = num;
    for (var i = 0; i < model.count; i++)
      model.setProperty(i, "isSelected", (i === num));
  }

  Image {
    anchors.fill: baseMenu
    source: "../media/background.png"
  }

  Image {
    id: badge
    y: 60
    x: 90
    width: 260
    height: 72
    source: "../media/mlb-badge.png"
  }

  MlbLabel {
    id: user
    font.pixelSize: 26
    anchors.leftMargin: 6
    anchors.topMargin: 10
    anchors.top: badge.bottom
    anchors.left: badge.left
  }

  ListView {
    id: menuList
    focus: true
    y: 225
    width: 400
    height: 500
    highlightMoveDuration: 50
    highlightFollowsCurrentItem: true
    orientation: ListView.Vertical

    Keys.onRightPressed: rightPressed();
    Keys.onEscapePressed: escapePressed();
    Keys.onReturnPressed: {
      selectedIndex = currentIndex;
      returnPressed();

      for (var i = 0; i < model.count; i++)
        model.setProperty(i, "isSelected", (i === index));
    }

    delegate: Item {
      height: 80
      width: 400

      MlbItemHighlight {
        anchors.fill: parent
        selected: false
        visible: (isSelected && menuList.activeFocus && !parent.ListView.isCurrentItem) || (isSelected && !menuList.activeFocus)
      }

      MlbLabel {
        x: 95
        text: name
        font.pixelSize: 40
        anchors.verticalCenterOffset: 3
        anchors.verticalCenter: parent.verticalCenter
      }
    }

    highlight: MlbItemHighlight {
      height: 80
      width: 400
      selected: true
      visible: menuList.activeFocus
    }

    model: ListModel {
      id: model
      ListElement {
        name: "Daily Schedule";isSelected: true;
      }
      ListElement {
        name: "Calendar";isSelected: false;
      }
      ListElement {
        name: "Standings";isSelected: false;
      }
      ListElement {
        name: "Settings";isSelected: false;
      }
    }
  }

  Image {
    x: 435
    y: 0
    width: 24
    height: 1080
    source: "../media/divider-vert.png"
  }

  MlbLabel {
    id: message
    y: 600
    x: 95
    text: ""
    clip: true
    width: 300
    height: 100
    opacity: 0.7
    font.pixelSize: 28
    wrapMode: Text.Wrap
    horizontalAlignment: Text.AlignHCenter
  }
}
