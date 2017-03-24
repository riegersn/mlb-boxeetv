/**
 * main
 * mlb/main.qml
 */
import QtQuick 1.1
import BoxeeRuntime 1.0
import boxee.components 1.0
import "components"
import "js/global.js" as Global
import "js/mlb.js" as Mlb

Window {
  id: root

  property bool firstLaunch: true;
  property bool resourcesLoaded: false;
  property bool archiveSpoiler: false;
  property bool calendarMode: false;
  property bool qaMode: false;
  property bool debugMode: false;
  property bool initPlayback: false;
  property int mediaOpen: -1
  property bool scoreboardRefresh: true;
  property int scoreboardRefreshInterval: 900000;

  onDebugModeChanged: {
    Mlb.storeSetting('debug', debugMode);
  }

  onQaModeChanged: {
    Mlb.storeSetting('qa', qaMode);
  }

  onResourcesLoadedChanged: {
    if (resourcesLoaded)
      startApp();
  }

  onMediaOpenChanged: {
    if (mediaOpen === 2)
      initPlayback = false;
  }

  /**
   * Initiates auth identify/app ui after serviceCheck is completed
   */
  function serviceCheck_Callback() {
    if (debugMode)
      Mlb.print('App starting, service check complete');

    if (!Global.email || !Global.randAccount) {
      loggedOut.visible = true
      Global.accountLinked = false;
      boxeeAPI.appStarted(true);
      forceFocus(loggedOutButton);
    }
    else {
      Global.accountLinked = true;
      Mlb.authIdentify(handle_identify);
    }
  }

  /**
   * Executed first after the client successfuly loads the application.
   */
  Component.onCompleted: {
    if (debugMode)
      Mlb.print('App starting, initializing global data')

    var qa = Mlb.loadSetting('qa');
    var debug = Mlb.loadSetting('debug');
    qaMode = (qa === undefined || !qa) ? false : true;
    debugMode = (debug === undefined || !debug) ? false : true;

    firstLaunch = true;
    Mlb.loadTeams();
    Mlb.loadCalendar(undefined, calendarBrowser.fillCalendar);

    Global.email = Mlb.loadSetting('email');
    Global.randAccount = Mlb.loadSetting('rand_account');
    Global.videoQuality = Mlb.loadSetting('videoQuality');

    if (Global.videoQuality === undefined) {
      Global.videoQuality = 2;
      Mlb.storeSetting('videoQuality', parseInt(Global.videoQuality));
    }
    else Global.videoQuality = parseInt(Global.videoQuality)

    if (!Global.email || !Global.randAccount) {
      Global.email = '';
      Global.randAccount = '';
    }

    Mlb.loadServiceCheck(serviceCheck_Callback);
  }

  /**
   * Initiates the application UI once all required resources are loaded.
   */
  function startApp() {
    mainMenu.user = Global.email;
    mainMenu.visible = true;
    archiveSpoiler = Global.archiveSpoiler;
    scoreboardRefreshInterval = parseInt(Global.gridPoll) * 60000

    if (Global.launchAlert)
      mainMenu.motd = Global.launchAlert;

    settingsBrowser.loadSettings();
    Mlb.loadStandings(standingsBrowser.loadStandings);
    Mlb.loadTeams();
    Mlb.loadCalendar(undefined, calendarBrowser.fillCalendar);
    Mlb.loadGames(new Date(), gameBrowser.fillGameData);

    Mlb.monitorPlayer();

    boxeeAPI.saveAppSetting();
    boxeeAPI.appStarted(true);
    forceFocus(mainMenu);
  }

  /**
   * Displays Ok dialog when user isn't logged into MLB.TV
   */
  function notLoggedIn() {
    Mlb.uiOkDialog(undefined, "You must be logged in to access MLB.TV!", Mlb.reset);
  }

  /**
   * Handles result from authIdentify
   * @param    result  result from identifying user account
   * @param    message message to diaply to the user if link fails
   */
  function handle_identify(result, message) {
    if (Global.loggedin) {
      Mlb.getFavoriteTeams();
      Mlb.getArchiveSpoiler();
    }
    else {
      boxeeAPI.appStarted(true);
      Mlb.uiOkDialog(undefined, message, Mlb.reset);
    }
  }

  /**
   * Handles result from account linking process
   * @param    result  result from account linking
   * @param    message message to diaply to the user if link fails
   */
  function handle_link(result, message) {
    loggedOut.visible = false;

    if (result)
      Mlb.authIdentify(handle_identify);
    else
      Mlb.uiOkDialog(undefined, message, Mlb.reset);
  }

  /**
   * Stores password from login and initiates authLink
   * @param    resultPassword  User password address. String.
   */
  function handle_getPassword(resultPassword) {
    loggedOut.visible = false;
    Global.password = resultPassword;
    Mlb.authLink(handle_link);
  }

  /**
   * Stores email from login and opens the password keyboard dialog
   * @param    resultEmail User email address. String.
   */
  function handle_getEmail(resultEmail) {
    loggedOut.visible = false;
    Global.email = resultEmail;
    Mlb.storeSetting('lastEmail', resultEmail);
    Mlb.uiKeyboardDialog("Enter your MLB.TV password:", null, handle_getPassword, notLoggedIn, true);
  }

  Keys.onPressed: {
    switch (event.key) {
      case Qt.Key_H:
      case Qt.Key_Home:
      case Qt.Key_HomePage:
        {
          Mlb.exit();
          break;
        }
      case Qt.Key_Escape:
        {
          if (initPlayback) {
            initPlayback = false;
            boxeeAPI.mediaPlayer().stop();
            Mlb.uiHideWait();
            break;
          }
          else {
            Mlb.exit();
            break;
          }
        }
      case Qt.Key_Q:
        {
          Mlb.reset();
          qaMode = (qaMode) ? false : true;
          Mlb.loadServiceCheck();
          break;
        }
      case Qt.Key_D:
        {
          debugMode = (debugMode) ? false : true;
          break;
        }
    }
  }

  Item {
    id: loggedOut
    visible: false
    width: 1920
    height: 1080

    Image {
      width: 1920
      height: 1080
      source: "media/background.png"
    }

    MlbLabel {
      id: loggedOutLabel
      y: 260
      width: 1300
      height: 120
      font.pixelSize: 48
      text: "Got MLB.tv? Sign in now and start watching! No MLB.tv? Sign up at mlb.com/boxee and get a free game every day!"
      wrapMode: Text.WordWrap
      horizontalAlignment: Text.AlignHCenter
      anchors.horizontalCenter: parent.horizontalCenter
    }

    Row {
      spacing: 30
      anchors.topMargin: 310
      anchors.top: loggedOutLabel.bottom
      anchors.horizontalCenter: loggedOutLabel.horizontalCenter

      MlbItemHighlight {
        id: loggedOutButton
        height: 80
        width: 200
        selected: activeFocus
        KeyNavigation.right: exitButton
        Keys.onEscapePressed: Mlb.exit();
        Keys.onReturnPressed: {
          var lastEmail = Mlb.loadSetting('lastEmail');
          Mlb.uiKeyboardDialog("Enter your MLB.TV email:", lastEmail, handle_getEmail, Mlb.reset());
        }

        MlbLabel {
          font.bold: true
          font.pixelSize: 34
          text: "Login"
          anchors.centerIn: parent
        }
      }

      MlbItemHighlight {
        id: exitButton
        height: 80
        width: 200
        selected: activeFocus
        KeyNavigation.left: loggedOutButton
        Keys.onEscapePressed: Mlb.exit();
        Keys.onReturnPressed: Mlb.exit();

        MlbLabel {
          font.bold: true
          font.pixelSize: 34
          text: "Exit"
          anchors.centerIn: parent
        }
      }
    }
  }

  MlbBase {
    id: mainMenu
    focus: true
    visible: false
    onEscapePressed: Mlb.exit();

    function switchView(item) {
      gameBrowser.visible = (item === gameBrowser);
      standingsBrowser.visible = (item === standingsBrowser);
      settingsBrowser.visible = (item === settingsBrowser);
      calendarBrowser.visible = (item === calendarBrowser);
    }

    onReturnPressed: {
      switch (mainMenu.selectedIndex) {
        case 0:
          {
            gameBrowser.reset();
            Mlb.loadGames(new Date(), gameBrowser.fillGameData);
            calendarMode = false;
            scoreboardRefresh = true;
            switchView(gameBrowser);
            break;
          }
        case 1:
          {
            calendarMode = true;
            scoreboardRefresh = false;
            switchView(calendarBrowser);
            break;
          }
        case 2:
          {
            calendarMode = false;
            scoreboardRefresh = false;
            switchView(standingsBrowser);
            break;
          }
        case 3:
          {
            calendarMode = false;
            scoreboardRefresh = false;
            switchView(settingsBrowser);
            break;
          }
        case 4:
          {
            break;
          }
      }
    }

    onRightPressed: {
      if (gameBrowser.visible && (gameBrowser.count || calendarMode))
        forceFocus(gameBrowser);
      else if (calendarBrowser.visible)
        forceFocus(calendarBrowser);
      else if (standingsBrowser.visible)
        forceFocus(standingsBrowser);
      else if (settingsBrowser.visible)
        forceFocus(settingsBrowser);
    }
  }

  Item {
    y: 100
    x: 536
    visible: mainMenu.visible

    MlbBrowserGames {
      id: gameBrowser
      visible: true
      focusAfterLoad: true
      onLeftPressed: forceFocus(mainMenu);

      onEscapePressed: {
        if (calendarMode) {
          gameBrowser.visible = false;
          calendarBrowser.visible = true;
          forceFocus(calendarBrowser);
        }
        else {
          if (initPlayback) {
            initPlayback = false;
            boxeeAPI.mediaPlayer().stop();
            Mlb.uiHideWait();
          }
          else Mlb.exit();
        }
      }
    }

    MlbBrowserCalendar {
      id: calendarBrowser
      visible: false
      onEscapePressed: Mlb.exit();
      onLeftPressed: forceFocus(mainMenu);

      onAfterLoadData: {
        if (calendarMode)
          forceFocus(calendarBrowser);
      }

      onReturnPressed: {
        gameBrowser.reset();
        gameBrowser.text = calendarDay.calendarDayText;
        Mlb.loadGames(calendarDay.calendarDate, gameBrowser.fillGameData);
        gameBrowser.visible = true;
        calendarBrowser.visible = false;
        forceFocus(gameBrowser);
      }
    }

    MlbBrowserStandings {
      id: standingsBrowser
      visible: false
      onEscapePressed: Mlb.exit();
      onLeftPressed: forceFocus(mainMenu);
    }

    MlbBrowserSettings {
      id: settingsBrowser
      visible: false
      onEscapePressed: Mlb.exit();
      onLeftPressed: forceFocus(mainMenu);
    }
  }

  Label {
    text: 'MLB Version ' + boxeeAPI.runningAppVersion()
    color: '#f8f8f8'
    font.bold: true
    font.pixelSize: 28
    anchors.topMargin: 10
    anchors.leftMargin: 10
    anchors.top: parent.top
    anchors.left: parent.left
    visible: debugMode
  }

  Label {
    text: '_qa_ enabled'
    color: '#f8f8f8'
    font.bold: true
    font.pixelSize: 28
    anchors.topMargin: 10
    anchors.rightMargin: 10
    anchors.top: parent.top
    anchors.right: parent.right
    visible: qaMode
  }

  Label {
    text: '_debug_ enabled'
    color: '#f8f8f8'
    font.bold: true
    font.pixelSize: 28
    anchors.topMargin: 40
    anchors.rightMargin: 10
    anchors.top: parent.top
    anchors.right: parent.right
    visible: debugMode
  }

  MlbLabel {
    text: 'Refreshed: ' + gameBrowser.lastRefreshed
    color: '#f8f8f8'
    font.pixelSize: 18
    anchors.bottomMargin: 40
    anchors.rightMargin: 40
    anchors.bottom: parent.bottom
    anchors.right: parent.right
    visible: gameBrowser.visible && !calendarMode
  }
}
