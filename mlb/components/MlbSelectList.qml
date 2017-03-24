/**
 * MlbSelectList.qml
 * mlb/components/MlbSelectList.qml
 */

import QtQuick 1.0
import boxee.components 1.0

ListView {
  id: view
  width: 400
  height: 640
  clip: true
  focus: false
  contentHeight: 124
  contentWidth: 400

  property bool showTeamImage: false
  property bool multiSelect: false

  signal clicked()

  Keys.onUpPressed: decrementCurrentIndex();
  Keys.onDownPressed: incrementCurrentIndex();

  Keys.onReturnPressed: {
    if (multiSelect) {
      if (model.get(currentIndex).isSelected)
        model.setProperty(currentIndex, "isSelected", false);
      else
        model.setProperty(currentIndex, "isSelected", true);
    }
    else {
      for (var i = 0; i < model.count; i++) {
        if (i === currentIndex)
          model.setProperty(i, "isSelected", true);
        else
          model.setProperty(i, "isSelected", false);
      }
    }

    clicked();
  }
}
