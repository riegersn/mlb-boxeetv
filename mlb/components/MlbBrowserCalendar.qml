/**
 * MlbBrowserCalendar
 * mlb/components/MlbBrowserCalendar.qml
 */

import QtQuick 1.1
import "../js/global.js" as Global
import "../js/mlb.js" as Mlb

FocusScope {
  id: browser
  width: 1206
  height: 924

  property bool focusAfterLoad: false

  signal leftPressed
  signal escapePressed
  signal afterLoadData
  signal returnPressed(variant calendarDay)

  onFocusChanged: {
    if (browser.activeFocus && !calendarView.activeFocus)
      forceFocus(calendarView);
  }

  function reset() {
    noGamesLabel.visible = false;
    gameListModel.clear();
    focusAfterLoad = false;
    date = Qt.formatDate(new Date(), 'dddd, MMMM d, yyyy');
  }

  function fillCalendar() {
    var setIndex = false;
    calendarViewModel.clear();

    for (var i = 0; i < Global.calendar.length; i++) {
      calendarViewModel.append(Global.calendar[i]);
      if (!setIndex && parseInt(Global.calendar[i].games) > 0) {
        setIndex = true;
        calendarView.currentIndex = i;
      }
    }

    monthSelect.text = Qt.formatDate(Global.calendarDate, 'MMMM yyyy')
    afterLoadData();
  }

  MlbMonthSelector {
    id: monthSelect
    anchors.horizontalCenterOffset: -10
    anchors.horizontalCenter: calendarView.horizontalCenter
    Keys.onEscapePressed: escapePressed();
    Keys.onDownPressed: forceFocus(calendarView);
    Keys.onLeftPressed: Mlb.goLeft();
    Keys.onRightPressed: Mlb.goRight();
  }

  ListView {
    width: 1204
    height: 40
    focus: false
    orientation: ListView.Horizontal
    anchors.topMargin: 25
    anchors.top: monthSelect.bottom

    delegate: Item {
      width: 172
      height: 40

      MlbLabel {
        text: name
        font.bold: true
        font.pixelSize: 24
        anchors.horizontalCenter: parent.horizontalCenter
      }
    }

    model: ListModel {
      ListElement { name: "SUN" }
      ListElement { name: "MON" }
      ListElement { name: "TUE" }
      ListElement { name: "WED" }
      ListElement { name: "THU" }
      ListElement { name: "FRI" }
      ListElement { name: "SAT" }
    }
  }

  Image {
    id: arrowdown
    y: 1015
    height: 18
    width: 45
    visible: calendarView.visible && (calendarView.count > 35 && calendarView.currentIndex < 35)
    source: "../media/arrow-down.png"
    anchors.horizontalCenter: calendarView.horizontalCenter
  }

  GridView {
    id: calendarView
    width: 1211
    height: 745
    clip: true
    focus: true
    cellWidth: 173
    cellHeight: 149
    anchors.topMargin: 80
    anchors.top: monthSelect.bottom
    snapMode: GridView.SnapOneRow

    Keys.onEscapePressed: escapePressed();
    Keys.onReturnPressed: {
      var calendarItem = calendarViewModel.get(currentIndex);
      if (parseInt(calendarItem.games) > 0) {
        Global.activeCalDate = calendarItem.date
        returnPressed({
          calendarDate: calendarItem.date,
          calendarDayText: Qt.formatDate(calendarItem.date, 'dddd, MMMM d, yyyy')
        });
      }
      else Mlb.uiOkDialog(undefined, "There are currently no games available for playback on this date.");
    }

    Keys.onRightPressed: {
      var index = currentIndex + 1;
      for (index; index < calendarViewModel.count; index++) {
        if (parseInt(calendarViewModel.get(index).games) > 0) {
          calendarView.currentIndex = index;
          break;
        }
      }
    }

    Keys.onUpPressed: {
      if (currentIndex < 7) {
        forceFocus(monthSelect)
      }
      else {
        var index = currentIndex - 7;
        for (index; index >= 0; index -= 7) {
          if (parseInt(calendarViewModel.get(index).games) > 0) {
            calendarView.currentIndex = index;
            break;
          }
          if (index < 7) {
            forceFocus(monthSelect)
            break;
          }
        }
      }
    }

    Keys.onLeftPressed: {
      if (currentIndex % 7 === 0) {
        leftPressed();
      }
      else {
        var index = currentIndex - 1;
        for (index; index < calendarViewModel.count; index--) {
          if (parseInt(calendarViewModel.get(index).games) > 0) {
            calendarView.currentIndex = index;
            break;
          }
          if (index % 7 === 0) {
            leftPressed();
            break;
          }
        }
      }
    }

    Keys.onDownPressed: {
      var index = currentIndex + 7;
      for (index; index < calendarViewModel.count; index += 7) {
        if (parseInt(calendarViewModel.get(index).games) > 0) {
          calendarView.currentIndex = index;
          break;
        }
      }
    }

    delegate: MlbCalendarItem {
      parentList: calendarView;
    }
    model: ListModel {
      id: calendarViewModel
    }
  }
}
