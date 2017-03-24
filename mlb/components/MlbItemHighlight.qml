/**
 * MlbItemHighlight.qml
 * mlb/components/MlbItemHighlight.qml
 */

import QtQuick 1.0

Item {
  id: itemBackground
  height: 80
  width: 400

  property bool selected: true

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

  Rectangle {
    id: rectangle
    anchors.fill: itemBackground
    opacity: (selected) ? 1 : 0.12
    gradient: (selected) ? gradientActiveFocus : gradientActiveNoFocus
  }
}
