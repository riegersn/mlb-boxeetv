/**
 * MlbMonthSelector.qml
 * mlb/components/MlbMonthSelector.qml
 */

import QtQuick 1.1

FocusScope {
  id: focusScope
  width: 420
  height: 56

  property alias text: selector_monthLabel.text

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

  property Gradient gradientActiveNoFocus: Gradient {
    GradientStop {
      position: 0.0
      color: "#f8f8f8";
    }
    GradientStop {
      position: 1.0
      color: "#a9a9a9"
    }
  }

  Item {
    Row {
      height: 56
      spacing: 20

      Image {
        y: 13
        width: 30
        height: 30
        source: (focusScope.activeFocus) ? "../media/arrow-on.png" : "../media/arrow-off.png"
      }

      Item {
        width: 300
        height: parent.height

        Rectangle {
          width: parent.width
          height: parent.height
          gradient: (focusScope.activeFocus) ? gradientActiveFocus : gradientActiveNoFocus
          opacity: (focusScope.activeFocus) ? 1 : .12
        }

        MlbLabel {
          id: selector_monthLabel
          anchors.horizontalCenter: parent.horizontalCenter
          anchors.verticalCenter: parent.verticalCenter
        }
      }

      Image {
        y: 13
        width: 30
        height: 30
        mirror: true
        source: (focusScope.activeFocus) ? "../media/arrow-on.png" : "../media/arrow-off.png"
      }
    }
  }
}
