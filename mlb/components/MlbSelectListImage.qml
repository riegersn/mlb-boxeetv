/**
 * MlbSelectListImage.qml
 * mlb/components/MlbSelectListImage.qml
 */

import QtQuick 1.0

ListView {
  width: 400
  height: 720
  clip: true
  focus: false
  highlightFollowsCurrentItem: true
  orientation: ListView.Vertical

  signal clicked(int index)

  Keys.onUpPressed: decrementCurrentIndex();
  Keys.onDownPressed: incrementCurrentIndex();

  Keys.onReturnPressed: {
    if (model.get(currentIndex).isSelected)
      model.setProperty(currentIndex, "isSelected", false);
    else
      model.setProperty(currentIndex, "isSelected", true);

    clicked(currentIndex);
  }

  delegate: Item {
    height: 80
    width: 400
    property int offset: 0
    property int pixelSize: 34

    Row {
      x: 20 + offset
      spacing: 15
      height: parent.height
      width: parent.width

      Image {
        width: 30
        height: 30
        source: (isSelected) ? "../media/radio-on.png" : "../media/radio-off.png"
        anchors.verticalCenter: parent.verticalCenter
      }

      Image {
        width: 80
        height: 70
        source: "http://mlb.com/images/homepage/team/y2011/logos/" + abbrev + ".png"
        anchors.verticalCenter: parent.verticalCenter
      }

      MlbLabel {
        text: name
        font.pixelSize: pixelSize
        anchors.verticalCenter: parent.verticalCenter
        anchors.verticalCenterOffset: 3
      }
    }
  }
}
