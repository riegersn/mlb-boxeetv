/**
 * MlbItem.qml
 * mlb/components/MlbItem.qml
 */

import QtQuick 1.0

Item {
  height: 80
  width: parent.parent.contentWidth

  property int offset: 0
  property int labelVerticalOffset: 8
  property int pixelSize: 34
  property bool isSelectItem: false
  property alias wrapMode: itemLabel.wrapMode
  property alias clip: itemLabel.clip

  Row {
    x: 20 + offset
    spacing: 15
    height: parent.height
    width: parent.width

    Image {
      width: 30
      height: 30
      visible: isSelectItem
      source: (isSelected) ? "../media/radio-on.png" : "../media/radio-off.png"
      anchors.verticalCenter: parent.verticalCenter
    }

    MlbLabel {
      id: itemLabel
      text: name
      width: parent.width - 30
      height: parent.height - 26
      font.pixelSize: pixelSize
      anchors.verticalCenter: parent.verticalCenter
      anchors.verticalCenterOffset: labelVerticalOffset
    }
  }
}
