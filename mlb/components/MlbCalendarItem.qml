/**
 * MlbCalendarItem.qml
 * mlb/components/MlbCalendarItem.qml
 */

import QtQuick 1.0

Item {
  width: 163
  height: 139

  property GridView parentList: parent

  property Gradient gradientActiveNoFocus: Gradient {
    GradientStop {
      position: 0.0
      color: "#f8f8f8"
    }
    GradientStop {
      position: 1.0
      color: "#a9a9a9"
    }
  }
  
  property Gradient gradientActiveFocus: Gradient {
    GradientStop {
      position: 0.0
      color: "#800707"
    }
    GradientStop {
      position: 0.5
      color: "#ae1d1d"
    }
    GradientStop {
      position: 1.0
      color: "#800707"
    }
  }

  Rectangle {
    id: whiterec
    opacity: 0.12
    width: parent.width
    height: parent.height
    gradient: gradientActiveNoFocus
    visible: (games !== '0' && day && (!parent.GridView.isCurrentItem || !parentList.activeFocus))
  }

  Rectangle {
    opacity: 0.20
    width: parent.width
    height: parent.height
    gradient: gradientActiveFocus
    visible: (isDayToday)
  }

  Rectangle {
    width: parent.width
    height: parent.height
    gradient: gradientActiveFocus
    visible: (parent.GridView.isCurrentItem && parentList.activeFocus && !whiterec.visible)
  }

  MlbLabel {
    x: 6
    y: 6
    text: day
    font.pixelSize: 24
  }

  MlbLabel {
    text: games
    font.bold: true
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.bottomMargin: 50
    anchors.rightMargin: 20
    visible: (day !== '')
    opacity: (games == '0') ? 0.3 : 1.0
  }

  MlbLabel {
    text: "Games"
    font.pixelSize: 30
    font.bold: false
    anchors.right: parent.right
    anchors.bottom: parent.bottom
    anchors.bottomMargin: 15
    anchors.rightMargin: 20
    visible: (day !== '')
    opacity: (games == '0') ? 0.3 : 1.0
  }
}
