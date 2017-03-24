// Qt.include('date.js');
Qt.include('utility.js');
Qt.include('mixpanel.js');

/**
 * HTTP request object
 * @param    _code       http request result code
 * @param    _response   http request response
 * @return   MlbRequest object
 */
function MlbResult(_code, _response) {
  this.httpCode = _code;
  this.isOk = (_code === 200 && _response !== undefined && _response) ? true : false;
  this.response = _response;
}

/**
 * Stores key=value pair settings to the client
 * @param    key         Setting key
 * @param    value       Setting key value
 * @param    dontSave    True to supress execution of saveSettings()
 */
function storeSetting(key, value, dontSave) {
  boxeeAPI.setAppSetting(key, value);
  print(key + ": " + value + " (" + arguments.callee.caller.name + ")");
  if (dontSave === undefined)
    saveSettings();
}

/**
 * Loads the specified setting from the client
 * @param    key Specific key for setting
 * @return   value of setting key stored in the client
 */
function loadSetting(key) {
  print("loading setting: " + key + " (" + arguments.callee.caller.name + ")");
  return boxeeAPI.appSetting(key);
}

/**
 * Saves any stored client settings
 * @return   True if saveAppSetting() was successful
 */
function saveSettings() {
  printf("saving app settings (%s)", arguments.callee.caller.name);
  return boxeeAPI.saveAppSetting();
}

/**
 * Clears and resets all client/app settings
 */
function resetSettings() {
  printf("clearing app settings (%s)", arguments.callee.caller.name);

  resourcesLoaded = false;
  calendarMode = false;
  scoreboardRefresh = true;

  Global.id = null;
  Global.fingerprint = null;
  Global.sessionKey = null;
  Global.videoQuality = 2;
  Global.calendarDate = 0;
  Global.archiveSpoiler = 0;

  Global.favoritesLoaded = false;
  Global.archiveSpoilerLoaded = false;

  gameBrowser.reset();

  gameBrowser.visible = true;
  standingsBrowser.visible = false;
  settingsBrowser.visible = false;
  calendarBrowser.visible = false;

  mainMenu.forceIndex(0);

  var email = loadSetting('lastEmail');

  boxeeAPI.resetAppSetting();

  storeSetting('qa', qaMode);
  storeSetting('debug', debugMode);

  if (email !== undefined)
    storeSetting('lastEmail', email);
}

/**
 * Prints anything to the log, only specify a message and the calling functions name will be used
 * @param    item1   Message or function name. See function description
 * @param    item2   Message. Optional if message specified as item1
 */
function print(item1, item2) {
  if (item2 === undefined)
    boxeeAPI.logInfo('mlb [' + arguments.callee.caller.name + '] ' + item1);
  else
    boxeeAPI.logInfo('mlb [' + item1 + '] ' + item2);
}

/**
 * Same as print(). Prints anything to the log but uses sprintf
 * @param    message Message to print
 */
function printf(message) {
  var args = Array.prototype.slice.call(arguments);
  if (args.length === 1)
    boxeeAPI.logInfo('mlb [' + arguments.callee.caller.name + '] ' + message);
  else if (args.length > 1)
    boxeeAPI.logInfo('mlb [' + arguments.callee.caller.name + '] ' + vsprintf(message, args.slice(1)));
}

/**
 * Processes an error object and prints to log
 * @param    e   error object
 */
function printError(e) {
  boxeeAPI.logError(sprintf('mlb [%s] Error: %s [%s:%d]', arguments.callee.caller.name, e.message, e.fileName, e.lineNumber));
}

/**
 * Checks whether item passes is a valid function
 * @param    obj object to test for type
 * @return   true if object passed is of type function
 */
function isFunction(obj) {
  return (typeof obj === 'function');
}

/**
 * Monitors the media player
 */
function monitorPlayer() {
  var mediaPlayer = boxeeAPI.mediaPlayer();
  mediaPlayer.onOpened = onOpenChanged;
}

/**
 * Monitors the media player for OpenChaned event, assigns value to external QML property
 */
function onOpenChanged() {
  mediaOpen = boxeeAPI.mediaPlayer().isOpen();
}

/**
 * Displays the client Wait Dialog
 * @param    callbasck    Callback function. Optional.
 */
function uiShowWait(callback) {
  if (!Global.waitVisible) {
    Global.waitVisible = true;
    boxeeAPI.showWaitDialog(isFunction(callback), callback);
  }
}

/**
 * Hides the client Wait Dialog
 */
function uiHideWait() {
  Global.waitVisible = false;
  boxeeAPI.hideWaitDialog();
}

/**
 * Displays the client OK Dialog
 * @param    title       Title of dialog, pass undefined for default.
 * @param    message     Dialog message.
 * @param    callback    Callback if true
 * @param    callback2   Callback on back
 */
function uiOkDialog(title, message, callback, callback2) {
  if (!isFunction(callback2))
    callback2 = callback;

  title = (title || 'MLB.TV');

  boxeeAPI.showOkDialog('MLB.TV', message, callback, callback2, 'OK', true, boxeeAPI.runningAppPath() + '/media/background.png');
}

/**
 * Displays the client Confirm Dialog
 * @param    message     Dialog message.
 * @param    callback    Callback if true
 * @param    callback2   Callback if false
 * @param    cancel      Cancel button label. Optional.
 * @param    ok          OK button label. Optional.
 */
function uiConfirmDialog(message, callback, callback2, cancel, ok) {
  ok = (ok || 'OK');
  cancel = (cancel || 'Cancel');
  boxeeAPI.showConfirmDialog('MLB.TV', message, callback, callback2, ok, cancel, true, boxeeAPI.runningAppPath() + '/media/background.png');
}

/**
 * Displays the client Keyboard Dialog
 * @param    message     Dialog message.
 * @param    initval     Initial value. Optional.
 * @param    callback    Callback if true
 * @param    callback2   Callback on back
 * @param    password    True for password mask. Optional.
 */
function uiKeyboardDialog(message, initval, callback, callback2, password) {
  boxeeAPI.showKeyboardDialog(message, callback, (password || false), initval, undefined, true, callback2, boxeeAPI.runningAppPath() + '/media/background.png');
}

/**
 * Handles an HTTP request response
 * @param    type            DataType (0, 1, 2)
 * @param    responseText    Response string from HTTP request
 */
function handleResponse(type, responseText) {
  if (type === Global.DataType.XML) {
    responseText = boxeeAPI.xmlToJson(responseText)
    responseText = eval('(' + responseText + ')');
  }
  else if (type === Global.DataType.JSON)
    responseText = eval('(' + responseText + ')');

  return responseText;
}

/**
 * Handles an HTTP requests
 * @param    url             URL to request
 * @param    type            DataType (0, 1, 2)
 * @param    callback        Callback on request completion. Optional.
 * @param    callbackData    Data to be passed with the callback. Optional.
 * @param    blockWait       True to supress wait dialog during request. Optional.
 */
function get(url, type, callback, callbackData, blockWait) {
  if (debugMode)
    printf("type=%d, url=%s", type, url);

  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (request.readyState === 4) {

      if (blockWait === undefined)
        uiHideWait();

      var response = handleResponse(type, request.responseText);
      var result = new MlbResult(request.status, response);

      if (isFunction(callback))
        callback(result, callbackData)
    }
  }

  if (blockWait === undefined)
    uiShowWait();

  url = url.replace('MediaService2%5F0', 'MediaService2_0');

  if (debugMode)
    printf("test_url: %s", url);

  request.open("GET", url, true);
  request.send();
}

/**
 * Handles all post soap requests for connecting to mlb.tv
 * @param    url             Request URL.
 * @param    action          SOAP action.
 * @param    data            Data to be passed in the SOAP request
 * @param    callback        Callback function. Optional.
 * @param    callbackData    Data to be passed to Callback function. Optional.
 */
function authRequest(url, action, data, callback, callbackData) {
  var request = new XMLHttpRequest();

  if (debugMode)
    printf("url=%s, action=%s, data=%s", url, action, data);

  request.onreadystatechange = function() {
    if (request.readyState === 4) {
      var response = handleResponse(Global.DataType.XML, request.responseText);
      if (isFunction(callback))
        callback(response, request.status, callbackData);
    }
  }

  request.open("POST", url, true);
  request.setRequestHeader("SOAPAction", action);
  request.setRequestHeader("Content-type", "text/xml; charset=utf-8");
  request.setRequestHeader("Content-Length", data.length);
  request.send(data);
}

/**
 * Creates a random user string to be used for account linking, user string will be used
 * until the user unlinks the device
 * @return   Random user string
 */
function authRandAccount(user) {
  var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ";
  var string_length = 5;
  var randomstring = '';

  for (var i = 0; i < string_length; i++) {
    var rnum = Math.floor(Math.random() * chars.length);
    randomstring += chars.substring(rnum, rnum + 1);
  }

  return sprintf('%s_%s', randomstring, user);
}

/**
 * Handles mlb.tv login identification for application login & media service requests
 * user must first be logged in via authLink() before they can identify with their credentials
 * @param    callback    Optional callback function.
 */
function authIdentify(callback) {
  if (!Global.accountLinked || !Global.randAccount) {
    Global.loggedin = false;
    callback(false, 'An error occurred while attempting to login. Please check your internet connection or try again later.')
    return;
  }

  var idType = (qaMode) ? 'boxee' : 'boxee';

  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.2'>" + "<soapenv:Header/>" + "<soapenv:Body>" + "<ns:identityPoint_identify_request>" + "<ns:identification type='" + idType + "'>" + "<ns:profileProperty>" + "<ns:name>boxeeId</ns:name>" + "<ns:value>" + Global.randAccount + "</ns:value>" + "</ns:profileProperty>" + "</ns:identification>" + "</ns:identityPoint_identify_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";
  authRequest(Global.identityPointService, 'http://services.bamnetworks.com/registration/identityPoint/identify', request, handle_authIdentify, callback);
}

/**
 * Handles result from authIdentify request
 * @param    result      Data resulting from request.
 * @param    code        HTTP request result code.
 * @param    callback    Callback function. Optional.
 */
function handle_authIdentify(result, code, callback) {
  if (debugMode)
    print(pjson(result));

  if (code !== 200) {
    printf('ERROR: request failed! (http code %s)', code);
    Global.loggedin = false;

    if (isFunction(callback))
      callback(false, 'An error occurred while attempting to login. Please check your internet connection or try again later.');

    return;
  }

  result = result.soapenv_Envelope.soapenv_Body.identityPoint_identify_response;

  if (result.status.code !== '1') {
    Global.loggedin = false;
    printf('ERROR: mlb request returned error! (%s, %s)', code, result.message);

    if (isFunction(callback))
      callback(false, 'Login failed. (' + result.status.code + ')')

    return;
  }

  Global.id = result.identification.id;
  Global.fingerprint = result.identification.fingerprint;
  Global.loggedin = true;

  if (isFunction(callback))
    callback();
}

/**
 * Handles mlb.tv account linking to user email, stores data locally for auto login
 * @param    callback    Optional callback function.
 */
function authLink(callback) {
  if (Global.password === undefined || Global.email === undefined) {
    callback(false, 'Account linking failed.');
    return false;
  }

  var ruser = boxeeAPI.deviceId();
  var rand_account = authRandAccount(ruser);
  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.2'>" + "<soapenv:Body>" + "<ns:profile_save_request>" + "<ns:identification type='boxeeLink'>" + "<ns:email>" + "<ns:address>" + Global.email + "</ns:address>" + "</ns:email>" + "<ns:password>" + Global.password + "</ns:password>" + "<ns:profileProperty>" + "<ns:name>boxeeId</ns:name>" + "<ns:value>" + rand_account + "</ns:value>" + "</ns:profileProperty>" + "</ns:identification>" + "<ns:profile>" + "<ns:profileProperty>" + "<ns:name>boxeeId</ns:name>" + "<ns:value>" + rand_account + "</ns:value>" + "</ns:profileProperty>" + "</ns:profile>" + "</ns:profile_save_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";

  Global.randAccount = rand_account;
  Global.loggedin = false;
  Global.accountLinked = false;
  authRequest(Global.profileService, "http://services.bamnetworks.com/registration/profile/save", request, handle_authLink, callback);
}

/**
 * Handles result from authLink request
 * @param    result      Data resulting from request.
 * @param    code        HTTP request result code.
 * @param    callback    Callback function. Optional.
 */
function handle_authLink(result, code, callback) {
  if (code !== 200) {
    printf('ERROR: request failed! (http code %s)', code);
    callback(false, 'Login failed! Please check your internet connection or try again later.');
    return;
  }

  var status = result.soapenv_Envelope.soapenv_Body.profile_save_response.status;

  if (status.code !== '1') {
    resetSettings();
    print(pjson(result));
    printf('ERROR: mlb request returned error! (%s, %s)', code, result.message);
    callback(false, 'Login failed! Please double check your username and password, then try again. (' + status.code + ')');
    return;
  }

  Global.accountLinked = true;
  storeSetting('email', Global.email);
  storeSetting('rand_account', Global.randAccount);

  callback(true);
}

/**
 * Loads user stored favorite teams (stored on mlb.tv) must be identified
 */
function getFavoriteTeams() {
  if (Global.fingerprint === undefined || Global.id === undefined) {
    print('User must be logged in to acces this service.');
    return false;
  }

  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.3'>" + "<soapenv:Header/>" + "<soapenv:Body>" + "<ns:profile_find_request>" + "<ns:identification type='fingerprint'>" + "<ns:id>" + Global.id + "</ns:id>" + "<ns:fingerprint>" + Global.fingerprint + "</ns:fingerprint>" + "</ns:identification>" + "<ns:profileFilter>" + "<ns:propertyName>favoriteTeam</ns:propertyName>" + "</ns:profileFilter>" + "</ns:profile_find_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";
  authRequest(Global.profileService, "http://services.bamnetworks.com/registration/profile/find", request, handle_getFavoriteTeams);
}

/**
 * Handles result from getFavoriteTeams request
 * @param    result  Data resulting from request
 * @param    code    HTTP request result code
 */
function handle_getFavoriteTeams(result, code) {
  if (code !== 200) {
    printf('ERROR: request failed! (http code %s)', code);
    return;
  }

  result = result.soapenv_Envelope.soapenv_Body.profile_find_response;

  if (result.status.code !== '1') {
    printf('ERROR: mlb request returned error! (%s, %s)', code, result.message);
    return;
  }

  Global.favoriteTeams = [];

  try {
    result = result.profile.profileProperty.value;

    if (typeof result !== 'object')
      result = [result];

    Global.favoriteTeams = result;
  }
  catch (e) {
    printError(e);
    print('User has no favorites saved with mlb.com');
  }

  Global.favoritesLoaded = true;

  if (Global.archiveSpoilerLoaded)
    resourcesLoaded = true;
}

/**
 * Loads user stored archive spoiler setting (stored on mlb.tv) must be identified
 */
function getArchiveSpoiler() {
  if (Global.fingerprint === undefined || Global.id === undefined) {
    print('User must be logged in to acces this service.');
    return;
  }

  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.3'>" + "<soapenv:Header/>" + "<soapenv:Body>" + "<ns:profile_find_request>" + "<ns:identification type='fingerprint'>" + "<ns:id>" + Global.id + "</ns:id>" + "<ns:fingerprint>" + Global.fingerprint + "</ns:fingerprint>" + "</ns:identification>" + "<ns:profileFilter>" + "<ns:propertyName>archiveSpoiler</ns:propertyName>" + "</ns:profileFilter>" + "</ns:profile_find_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";

  authRequest(Global.profileService, "http://services.bamnetworks.com/registration/profile/find", request, handle_getArchiveSpoiler);
}

/**
 * handles result from getArchiveSpoiler request
 * @param    result  Data resulting from request
 * @param    code    HTTP request result code
 */
function handle_getArchiveSpoiler(result, code) {
  if (code !== 200) {
    printf('ERROR: request failed! (http code %s)', code);
    return;
  }

  result = result.soapenv_Envelope.soapenv_Body.profile_find_response;

  if (result.status.code !== '1') {
    printf('ERROR: mlb request returned error! (%s, %s)', code, result.message);
    return;
  }

  try {
    result = result.profile.profileProperty.value;
    Global.archiveSpoiler = (result === 'F') ? false : true;
  }
  catch (e) {
    printError(e);
    Global.archiveSpoiler = true;
  }

  archiveSpoiler = Global.archiveSpoiler;
  printf('archive spoiler:  %s', Global.archiveSpoiler);

  Global.archiveSpoilerLoaded = true;

  if (Global.favoritesLoaded)
    resourcesLoaded = true;
}

/**
 * Handles the result from setArchiveSpoiler & setFavoriteTeams
 * @param    result  Data resulting from request
 * @param    code    HTTP request result code
 */
function hanlde_storeSetting(result, code) {
  if (code !== 200) {
    printf('ERROR: request failed! (http code %s)', code);
    return;
  }

  result = result.soapenv_Envelope.soapenv_Body.profile_save_response.status;

  if (result.code !== '1') {
    printf('ERROR: mlb request returned error! (%s, %s)', code, result.message);
    return;
  }
}

/**
 * Saves archive spoiler data on mlb.tv, must be identified
 * @param    archiveSpoiler   Boolean. True to display scores.
 */
function setArchiveSpoiler(archiveSpoiler) {
  if (Global.fingerprint === undefined || Global.id === undefined) {
    print('User must be logged in to acces this service.');
    return;
  }

  archiveSpoiler = (archiveSpoiler) ? "T" : "F";

  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.3'>" + "<soapenv:Header/>" + "<soapenv:Body>" + "<ns:profile_save_request>" + "<ns:identification type='fingerprint'>" + "<ns:id>" + Global.id + "</ns:id>" + "<ns:fingerprint>" + Global.fingerprint + "</ns:fingerprint>" + "</ns:identification>" + "<ns:profile>" + "<ns:profileProperty>" + "<ns:name>archiveSpoiler</ns:name>" + "<ns:value>" + archiveSpoiler + "</ns:value>" + "</ns:profileProperty>" + "</ns:profile>" + "</ns:profile_save_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";

  authRequest(Global.profileService, "http://services.bamnetworks.com/registration/profile/save", request, hanlde_storeSetting);
}

/**
 * Saves favorite team data on mlb.tv, must be identified
 */
function setFavoriteTeams() {
  if (Global.fingerprint === undefined || Global.id === undefined) {
    print('User must be logged in to acces this service.');
    return false;
  }

  var value = '';
  for (var i = 0; i < Global.favoriteTeams.length; i++)
    value += "<ns:value>" + Global.favoriteTeams[i] + "</ns:value>";

  var request = "<soapenv:Envelope xmlns:soapenv='http://schemas.xmlsoap.org/soap/envelope/' xmlns:ns='http://services.bamnetworks.com/registration/types/1.3'>" + "<soapenv:Header/>" + "<soapenv:Body>" + "<ns:profile_save_request>" + "<ns:identification type='fingerprint'>" + "<ns:id>" + Global.id + "</ns:id>" + "<ns:fingerprint>" + Global.fingerprint + "</ns:fingerprint>" + "</ns:identification>" + "<ns:profile>" + "<ns:profileProperty>" + "<ns:name>favoriteTeam</ns:name>" + value + "</ns:profileProperty>" + "</ns:profile>" + "</ns:profile_save_request>" + "</soapenv:Body>" + "</soapenv:Envelope>";
  authRequest(Global.profileService, "http://services.bamnetworks.com/registration/profile/save", request, hanlde_storeSetting);
}

/**
 * Builds a new grid url for requesting games
 * @param    d1      Date array (year, month, day). Default is current day. Optional.
 * @param    grid    Url template for grid request. Default is gamedayRoot. Optional.
 * @return   Complete URL for grid request
 */
function buildGridDate(d1, grid) {
  var date = {
    year: zeroPad(d1.getFullYear(), 4),
    month: zeroPad(d1.getMonth() + 1, 2),
    day: zeroPad(d1.getDate(), 2)
  };

  // if grid isn't defined use global.grid
  var url = Global.gamedayRoot;
  url += (grid !== undefined) ? grid : Global.grid;

  if (debugMode)
    printf('grid_url=%s', url);

  return sprintf(url.toLowerCase(), date);
}

/**
 * Builds a new grid url for requesting games
 * @param    id      Game ID
 * @param    games   Array of TGames
 * @return   Game object where id == game._id
 */
function getTGameFromId(id, games) {
  try {
    if (games !== undefined) {
      for (var i = 0; i < games.length; i++) {
        if (games[i]._id === id)
          return games[i];
      }
    }
  }
  catch (e) {
    printError(e);
  }

  if (debugMode)
    printf('no game matching id (%s)', id);

  return null;
}

/**
 * Processes the result of a grid request, builds an array of sorted games to display in the client
 * @param    request     Results of a grid request
 * @param    _handler    Request handler object (contains calling function, callback, and other data. see loadGames())
 */
function processGames(request, _handler) {
  if (!request.isOk && request.response.games.game !== undefined) {
    print('ERROR. Unable to load data. http_code=%d', request.httpCode);
    if (isFunction(_handler.callback))
      _handler.callback(false);
    return false;
  }

  var gamelist = [];
  var favorites = [];
  var result = (request.response.games.game || []);

  /* must make sure we have an array here */
  result = [].concat(result);

  for (var i = 0; i < result.length; i++) {
    var game = result[i];

    if (game._media_state === 'media_dead')
      continue;

    var tg = (getTGameFromId(game._id, _handler.miniGrid) || {});

    var _status_text = Global.statusCodes[game._ind][0];
    var sortOrder = Global.statusCodes[game._ind][2];

    var newGame = {
      id: game._id,
      eventId: game._calendar_event_id,
      mediaState: game._media_state,
      status: game._ind,
      statusText: Global.statusCodes[game._ind][0],
      sortOrder: Global.statusCodes[game._ind][2],
      inProgress: (game._media_state === 'media_on' && game._ind === 'I'),
      isFree: false,
      inning: (game._inning),
      topInning: (game._top_inning === 'Y'),
      runnerOn1b: (tg._runner_on_1b) ? true : false,
      runnerOn2b: (tg._runner_on_2b) ? true : false,
      runnerOn3b: (tg._runner_on_3b) ? true : false,
      outs: (tg._outs || 0),
      media: {}
    }

    if (game._ind === "S" || game._ind === "P")
      newGame.statusText += " (" + game._event_time + ")";

    newGame.away = {
      name: game._away_name_abbrev,
      score: (game._away_score === '' || game._ind === "P") ? '-' : game._away_score,
      favorite: isFavorite(game._away_file_code),
      logo: sprintf("%s%s.png", Global.teamLogosUri, game._away_name_abbrev.toLowerCase())
    }

    newGame.home = {
      name: game._home_name_abbrev,
      score: (game._home_score === '' || game._ind === "P") ? '-' : game._home_score,
      favorite: isFavorite(game._home_file_code),
      logo: sprintf("%s%s.png", Global.teamLogosUri, game._home_name_abbrev.toLowerCase())
    }

    try {
      //checking for media
      var media = [].concat(game.game_media.homebase.media);

      for (var n = 0; n < media.length; n++) {
        var s = media[n];
        var scenario = s._playback_scenario;

        if (debugMode)
          print(pjson(s));

        if (scenario !== 'HTTP_CLOUD_WIRED' && scenario !== 'AUDIO_FMS_32K')
          continue;

        var homeAway = (s._type.indexOf('away') !== -1) ? 'Away' : 'Home';
        var feedStream = (scenario === 'HTTP_CLOUD_WIRED') ? 'Feed' : 'Stream';

        newGame.media[s._id] = {
          id: s._id,
          type: (scenario === 'HTTP_CLOUD_WIRED') ? 'video' : 'audio',
          state: s._state.toLowerCase(),
          name: sprintf('%s %s %s', s._display, homeAway, feedStream)
        };

        if (s._free === 'ALL')
          newGame.isFree = true;
      }
    }
    catch (e) {
      printError(e);
    }

    if (newGame.away.favorite || newGame.home.favorite)
      favorites.push(newGame);
    else
      gamelist.push(newGame);
  }

  var sortedGameList = gamelist.sort((function(a, b) {
    return (a.sortOrder - b.sortOrder)
  }));
  var sortedFavoriteList = favorites.sort((function(a, b) {
    return (a.sortOrder - b.sortOrder)
  }));

  gamelist = sortedFavoriteList;
  gamelist = gamelist.concat(sortedGameList);

  if (debugMode)
    print(pjson(gamelist));

  if (isFunction(_handler.callback))
    _handler.callback(gamelist);
}

/**
 * Loads a list of games for a specific date
 * @param    date        Date of games to return. Optional. If no date is specified, current day's date is used.
 * @param    callback    Callback on request completion. Optional.
 * @param    blockWait   True to supress wait dialog during request. Optional.
 */
function loadGames(date, callback, blockWait) {
  var _url;
  var _handler = {
    callback: callback,
    date: (date === undefined) ? new Date() : date,
    isToday: (date === undefined),
    callback: callback,
    blockWait: blockWait
  }

  _url = buildGridDate(date, (_handler.isToday) ? Global.miniscoreboard : undefined);
  get(_url, Global.DataType.XML, handle_loadGames, _handler, blockWait);
}

/**
 * Handles the result of a grid request response
 * @param    request     Results of a grid request
 * @param    _handler    Request handler object (contains calling function, callback, and other data. see loadGames())
 */
function handle_loadGames(request, _handler) {
  if (!request.isOk) {
    print('ERROR. Unable to load data. http_code=%d', request.httpCode);
    if (isFunction(_handler.callback))
      _handler.callback(false);
    return false;
  }

  if (_handler.isToday) {
    print(pjson(_handler));
    _handler.miniGrid = request.response.games.game;
    var _url = buildGridDate(_handler.date);
    get(_url, Global.DataType.XML, processGames, _handler, _handler.blockWait);
  }
  else {
    processGames(request, _handler);
  }
}

/**
 * Loads a list of MLB teams and sends result to handle_loadTeams
 * @param    callback    Callback on request completion. Callback passed to handle_loadTeams. Optional.
 */
function loadTeams(callback) {
  get(Global.teamsUri, Global.DataType.XML, handle_loadTeams, callback);
}

/**
 * Processes standings result from loadTeams
 * @param    request     Result from loadTeams() request
 * @param    callback    Callback on request completion. Optional.
 */
function handle_loadTeams(request, callback) {
  if (!request.isOk) {
    print('ERROR. Unable to load data. http_code=%d', request.httpCode);
    if (isFunction(callback))
      callback(false);
    return false;
  }

  Global.teams = request.response.team_all.queryResults.row;

  if (isFunction(callback))
    callback(true);
}

/**
 * Loads current MLB standings and sends result to handle_loadStandings
 * @param    callback    Callback on request completion. Callback passed to handle_loadStandings. Optional.
 */
function loadStandings(callback) {
  var d1 = new Date();
  // get(Global.standingsUri + d1.toString('yyyy'), Global.DataType.JSON, handle_loadStandings, callback);
  get(Global.standingsUri + d1.getFullYear(), Global.DataType.JSON, handle_loadStandings, callback);
}

/**
 * Processes standings result from loadStandings
 * @param    request     Result from loadStandings() request
 * @param    callback    Callback on request completion. Optional.
 */
function handle_loadStandings(request, callback) {
  if (!request.isOk) {
    print('ERROR. Unable to load data. http_code=%d', request.httpCode);
    if (isFunction(callback))
      callback(false);
    return false;
  }

  var tmp = {
    al: {
      east: [],
      west: [],
      central: []
    },
    nl: {
      east: [],
      west: [],
      central: []
    }
  };

  for (var i = 0; i < 2; i++) {
    var data = request.response.standings_all_league_repeater.standings_all[i];
    data = data.queryResults.row;

    for (var x = 0; x < data.length; x++) {
      var team = data[x];
      var div = parseInt(team.division_id);
      var division = 'east';
      var league = (div >= 203) ? 'nl' : 'al';

      if (div === 202 || div === 205)
        division = 'central';
      else if (div === 200 || div === 203)
        division = 'west';

      team.section = league.toUpperCase() + " " + division.capitalize();

      tmp[league][division].push(team);
    }
  }

  var standings = [];

  standings = standings.concat(tmp.al.east);
  standings = standings.concat(tmp.al.central);
  standings = standings.concat(tmp.al.west);
  standings = standings.concat(tmp.nl.east);
  standings = standings.concat(tmp.nl.central);
  standings = standings.concat(tmp.nl.west);

  Global.standings = standings;

  if (isFunction(callback))
    callback(true);
}

/**
 * Loads MLB schedule calendar for specified date, passes result to handle_loadCalendar
 * @param    d1          Date object. Optional. Current month is used if undefined.
 * @param    callback    Callback on request completion. Callback passed to handle_loadCalendar. Optional.
 */
function loadCalendar(d1, callback) {
  Global.lock = true;

  uiShowWait();

  d1 = (d1 || new Date());
  var season = zeroPad(d1.getUTCFullYear(), 4);
  var start = Qt.formatDate(firstDayInMonth(d1), "yyyy-M-d");
  var end = Qt.formatDate(lastDayInMonth(d1), "yyyy-M-d");
  var url = Global.calendarUri.replace('%(season)', season);

  url = url.replace('%(start)', start);
  url = url.replace('%(end)', end);

  get(url, Global.DataType.XML, handle_loadCalendar, callback);
}

/**
 * Processes standings result from loadCalendar
 * @param    request     Result from loadCalendar() request
 * @param    callback    Callback on request completion. Optional.
 */
function handle_loadCalendar(request, callback) {
  if (!request.isOk || request.response.schedule_game_count_by_date === undefined) {
    uiHideWait();
    printf('ERROR. Unable to load data. http_code=%d', request.httpCode);
    Global.lock = false;
    if (isFunction(callback))
      callback(false);
    return false;
  }

  try {
    Global.calendar = [];
    var month = request.response.schedule_game_count_by_date.queryResults.row;

    for (var i = 0; i < month.length; i++) {
      var item = {
        date: month[i]._game_date,
        games: month[i]._games,
        isDayToday: false
      }

      var m = item.date.match(/^(\d+)-(\d+)-(\d+)T/i);
      item.date = new Date(sprintf("%s/%s/%s", m[2], m[3], m[1]));
      item.day = item.date.getUTCDate();
      item.season = item.date.getUTCFullYear();
      item.isDayToday = isToday(item.date);

      if (i === 0) {
        Global.calendarDate = item.date
        var startPad = item.date.getUTCDay();
      }

      if (i === month.length - 1)
        var endPad = 6 - item.date.getUTCDay();

      Global.calendar.push(item)
    }

    for (i = 0; i < startPad; i++)
      Global.calendar.unshift({
        day: '',
        games: '',
        isDayToday: false
      });

    for (i = 0; i < endPad; i++)
      Global.calendar.push({
        day: '',
        games: '',
        isDayToday: false
      });

    Global.lock = false
    if (isFunction(callback))
      callback(true);
  }
  catch (e) {
    printError(e);
    if (isFunction(callback))
      callback(false);
  }

  uiHideWait();
}

/**
 * Goto previous month in calendar view
 */
function goLeft() {
  if (!Global.lock) {
    var d1 = new Date(Global.calendarDate.getUTCFullYear(), Global.calendarDate.getUTCMonth() - 1);
    loadCalendar(d1, calendarBrowser.fillCalendar);
  }
}

/**
 * Goto next month in calendar view
 */
function goRight() {
  if (!Global.lock) {
    var d1 = new Date(Global.calendarDate.getUTCFullYear(), Global.calendarDate.getUTCMonth() + 1);
    var d2 = new Date();
    if (d1.getUTCFullYear() <= d2.getFullYear())
      loadCalendar(d1, calendarBrowser.fillCalendar);
  }
}

/**
 * Check if team is in favorites list
 * @param    fileCode    Team file code
 * @return   True if specified team file code is of favorite team
 */
function isFavorite(fileCode) {
  var teams = Global.teams;
  var favorites = Global.favoriteTeams;

  for (var i in teams) {
    if (teams[i]._file_code === fileCode) {
      for (var n in favorites) {
        if (favorites[n] === teams[i]._team_id)
          return true;
      }
      return false;
    }
  }
  return false;
}

/**
 * Query request to find teams
 * @param    key     Key to search for
 * @param    value   Key value to match
 * @param    result  Specify key value to return from matching Team object. Optional.
 * @return   Returns result value or team object
 */
function getTeamBy(key, value, result) {
  try {
    var teams = Global.teams;

    for (var i in teams) {
      if (teams[i][key] === value) {
        if (result !== undefined)
          return teams[i][result];
        else
          return teams[i];
      }
    }
    return false;
  }
  catch (e) {
    printError(e);
  }
  return false;
}

/**
 * Converts eventDate str to date object
 * @param    d   date string
 */
function eventDateToDate(d) {
  try {
    d = d.replace(/T|:/g, '-').split('-');

    for (var i = 0; i < d.length; i++)
      d[i] = parseInt(d[i]);

    d[1]--;

    return new Date(d[0], d[1], d[2], d[3], d[4]);
  }
  catch (e) {
    printError(e);
  }
  return '';
}

/**
 * Processes xml of Innings Index with correlating hls timestamps
 * storing the results globally for the Overlay window
 * @param    request Response from innings index request
 */
function populateInnings(request) {
  // make sure we start with an empty list
  Global.activeGame.gameData.innings = [];

  // print the response to log if we are in debug mode
  if (debugMode)
    print(pjson(request.response));

  // if the request is bad, or failed, return now
  if (!request.isOk)
    return;

  try {
    var innings = [].concat(request.response.game.inningTimes);

    //process each inning
    for (var i = 0; i < innings.length; i++) {
      var inning = {
        name: ((innings[i]._top === 'true') ? "Top " : "Bottom ") + "of the " + Mlb.ordinal_suffix_of(innings[i]._inning_number),
        time: innings[i].inningTime[0]._start,
        isSelected: false
      }

      if (inning.time.length <= 8)
        inning.time = buildHlsTimestamp(inning.time, Global.activeGame.eventId);

      // store the inning
      Global.activeGame.gameData.innings.push(inning);
    }
  }
  catch (e) {
    // if we fail for any reason, clear the play list and message out
    printError(e);
    Global.activeGame.gameData.innings = [];
  }

  // dump the play list
  if (debugMode)
    print(pjson(Global.activeGame.gameData.innings));
}

function processDate(str) {
  var m = str.match(/^(\d+)-(\d+)-(\d+)T(.*?)Z/i);
  var date = new Date(sprintf("%s/%s/%s %s UTC", m[2], m[3], m[1], m[4]));

  // we need to output time in EST, even if local time is not in EST
  // so we manually remove 4 hours from the UTC time.
  var epoch = date.valueOf() - 14400000;
  date = new Date(epoch);

  var format = "%d-%s-%sT%s:%s:%s";
  return sprintf(format, date.getUTCFullYear(), zeroPad(date.getUTCMonth() + 1, 2), zeroPad(date.getUTCDate(), 2), zeroPad(date.getUTCHours(), 2), zeroPad(date.getUTCMinutes(), 2), zeroPad(date.getUTCSeconds(), 2));
}

/**
 * Processes plist of Run Scoring plays with correlating hls timestamps
 * storing the results globally for the Overlay window
 * @param    request Response from run scoring play request
 */
function populateRunScoringPlays(request) {
  // make sure we start with an empty list
  Global.activeGame.gameData.runscoring = [];

  // print the response to log if we are in debug mode
  if (debugMode)
    print(pjson(request.response));

  // if the request is bad, or failed, return now
  if (!request.isOk)
    return;

  try {
    // push list of run soring plays into new array
    var plays = [].concat(request.response.plist.dict.array.dict);

    // process each play
    for (var i = 0; i < plays.length; i++) {
      var play = {
        name: plays[i].string[2].replace("  ", " "),
        time: plays[i].date[0],
        isSelected: false
      }

      if (play.time.length <= 8)
        play.time = buildHlsTimestamp(play.time, Global.activeGame.eventId);

      // if we are using the oldTimestamp method (pre-2013), we need to convert the UTC timestamp to EST
      if (Global.activeGame.oldTimestamp)
        play.time = processDate(play.time);

      // store the newly created play item
      Global.activeGame.gameData.runscoring.push(play);
    }
  }
  catch (e) {
    // if we fail for any reason, clear the play list and message out
    printError(e);
    Global.activeGame.gameData.runscoring = [];
  }

  // dump the play list
  if (debugMode)
    print(pjson(Global.activeGame.gameData.runscoring));
}

/**
 * Processes xml of Game Events with correlating hls timestamps
 * storing the results globally for the Overlay window
 * @param    request Response from game events request
 */
function populateGameEvents(request) {
  // make sure we start with an empty list
  Global.activeGame.gameData.events = [];

  // print the response to log if we are in debug mode
  if (debugMode)
    print(pjson(request.response));

  // if the request is bad, or failed, return now
  if (!request.isOk)
    return;

  // so we don't have to write this out multiple times
  var processItem = function(item, type) {
    var event = {
      time: item._start_tfs_zulu,
      name: item._des.replace("  ", " "),
      section: type + ' of the ' + ordinal_suffix_of(inning._num),
      isSelected: false
    }

    if (event.time.length <= 8)
      event.time = buildHlsTimestamp(event.time, Global.activeGame.eventId);

    // if we are using the oldTimestamp method (pre-2013), we need to convert the UTC timestamp to EST
    if (Global.activeGame.oldTimestamp)
      event.time = processDate(event.time);

    return event;
  }

  try {
    var e,
      gameEvent
    var innings = [].concat(request.response.game.inning);

    // process each inning
    for (var i = 0; i < innings.length; i++) {
      var inning = innings[i];

      for (e = 0; e < innings[i].top.atbat.length; e++) {
        gameEvent = processItem(innings[i].top.atbat[e], 'Top');
        if (gameEvent)
          Global.activeGame.gameData.events.push(gameEvent);
      }

      if (innings[i].bottom.atbat === undefined)
        continue;

      for (e = 0; e < innings[i].bottom.atbat.length; e++) {
        gameEvent = processItem(innings[i].bottom.atbat[e], 'Bottom');
        if (gameEvent)
          Global.activeGame.gameData.events.push(gameEvent);
      }
    }

  }
  catch (e) {
    // if we fail for any reason, clear the list and message out
    Global.activeGame.gameData.events = [];
    printError(e);
  }

  // dump the play list
  if (debugMode)
    print(pjson(Global.activeGame.gameData.events));
}

/**
 * Initial function called to playback live or archived media.
 * @param    game    Game object
 * @param    item    Feed object
 */
function playVideo(game, item) {
  initPlayback = true;
  Global.sessionKey = boxeeAPI.appSetting('session_key');

  if (Global.sessionKey === undefined)
    Global.sessionKey = '';

  if (debugMode) {
    printf('session_id: %s', Global.sessionKey);
    printf('game: %s', game);
    printf('item: %s', item);
  }

  var game_package = {
    type: item.type,
    contentId: item.id,
    eventId: game.eventId,
    scenario: 'HTTP_CLOUD_WIRED',
    calendarEventId: game._calendar_event_id,
    awayName: getTeamBy('_name_abbrev', game.away.name, '_name_display_brief'),
    homeName: getTeamBy('_name_abbrev', game.home.name, '_name_display_brief')
  }

  var mediaRequestUrl = Global.mediaFrameworkVideo;

  if (game_package.type === 'audio') {
    mediaRequestUrl = Global.mediaFrameworkAudio;
    game_package.scenario = (item.state === 'media_archive') ? 'AUDIO_SHOUTCAST_32K' : 'HTTP_CLOUD_AUDIO';
  }

  if (debugMode) {
    printf('id: %s', Global.id);
    printf('fingerprint: %s', Global.fingerprint);
    printf('sessionKey: %s', Global.sessionKey);
    printf('eventId: %s', game_package.eventId);
    printf('contentId: %s', game_package.contentId);
  }

  var params = {
    ipid: encodeURIComponent(Global.id),
    fingerprint: encodeURIComponent(Global.fingerprint),
    event_id: encodeURIComponent(game_package.eventId),
    contentId: encodeURIComponent(game_package.contentId),
    sessionKey: encodeURIComponent(Global.sessionKey)
  }

  // for mlb tracking
  beforeFrameWork();

  if (!initPlayback)
    return false;

  var media_request = sprintf(mediaRequestUrl, params);
  get(media_request.underscore(), Global.DataType.XML, queryMediaService, game_package);
}

/**
 * Get response message where code == MediaService response code
 * @param    code    MLB MediaService response code
 * @return   Error message from MLB MediaService
 */
function mediaServiceResponseCodes(code) {
  switch (code) {
    case -1000:
      return 'The requested media is not currently available.';
    case -2000:
      return 'Invalid app account/partner';
    case -2500:
      return 'System error determining blackouts';
    case -3500:
      return 'Too many active sessions/devices, this account is temporarily locked.';
    case -4000:
      return 'General system error';
    case -9999:
      return 'An unknown error';
    case -3000:
      return 'Authentication key expired. please log in again to refresh.';
    default:
      return 'An unknown error';
  }
}

/**
 * Process results from MLB MediaService requests
 * @param    request         Result of MLB MediaService request originating from playVideo()
 * @param    game_package    Game playback object
 */
function queryMediaService(request, game_package) {
  if (debugMode) {
    print('game_package: ' + pjson(game_package));
    print('request_response: ' + pjson(request));
  }

  if (!request.isOk) {
    initPlayback = false;
    uiOkDialog(undefined, Global.messages.COMMUNICATION_ERROR);
    return;
  }

  if (!initPlayback)
    return false;

  var result = request.response['user-verified-media-response'];
  var status_code = parseInt(result['status-code']);

  if (status_code !== 1) {
    initPlayback = false;

    if (status_code === -3000)
      authIdentify();

    var message = mediaServiceResponseCodes(status_code);
    printf('%s (%d)', message, status_code);
    uiOkDialog('MLB.TV Error', result['status-message'] + ' (' + status_code + ')');

    return;
  }

  var uevent = result['user-verified-event'];
  var ucontent = uevent['user-verified-content'];
  var umedia = ucontent['user-verified-media-item'];
  var uitem = umedia['media-item'];
  var attributes = ucontent['domain-specific-attributes']['domain-attribute'];

  if (umedia['blackout-status']['blackedOutStatus']) {
    initPlayback = false;
    uiOkDialog('MLB.TV Blackout', Global.messages.BLACKED_OUT);
    return;
  }

  if (typeof umedia['url'] === 'object' || umedia['url'] === "") {
    initPlayback = false;
    uiOkDialog('MLB.TV Error', Global.messages.PREMIUM_SUBSCRIBER);
    return;
  }

  game_package.url = umedia['url'];
  game_package.sessionKey = result['session-key'];
  game_package.mediaState = uitem['state'];
  game_package.attribs = {};

  // get all available audio tracks
  // grab audio tracks, make sure we have an array
  game_package.audio = [];

  if (umedia['media-item']['audio-track']) {
    var audioTracks = [].concat(umedia['media-item']['audio-track']);

    for (var i = 0; i < audioTracks.length; i++) {
      try {
        var trackName = audioTracks[i].description + ' ' + audioTracks[i].type;
        if (audioTracks[i].type === 'NAT SOUND')
          trackName = 'Ballpark Only';
        game_package.audio.push({
          id: parseInt(audioTracks[i].channel),
          name: trackName
        });
      }
      catch (e) {
        printError(e);
      }
    }
  }

  // collect stream attributes
  var attribs = {};
  for (var i = 0; i < attributes.length; i++)
    attribs[attributes[i]['_name']] = attributes[i]['__text'];

  // collect game data events, scoring plays & innings index
  game_package.gameData = {
    innings: [],
    events: [],
    gameEvents: null,
    runScoringPlays: null,
    inningsIndex: attribs.inning_index_location_xml
  }

  if (attribs.game_events_location_plist)
    game_package.gameData.gameEvents = attribs.game_events_location_plist.replace('.plist', '.xml');

  if (attribs.run_scoring_plays_location_plist)
    game_package.gameData.runScoringPlays = attribs.run_scoring_plays_location_plist;

  // format date & set title
  var eventDate = eventDateToDate(attribs.event_date);
  eventDate = Qt.formatDateTime(eventDate, "MMM d, yyyy h:mm AP");
  game_package.title = sprintf('%s vs %s - %s', game_package.awayName, game_package.homeName, eventDate);

  // check sessionKey and update if needed
  if (Global.sessionKey !== game_package.sessionKey) {
    Global.sessionKey = game_package.sessionKey;
    storeSetting('session_key', game_package.sessionKey);
    if (debugMode)
      printf('stored new session key (%s)', Global.sessionKey);
  }

  if (game_package.type === 'video' || game_package.scenario === 'HTTP_CLOUD_AUDIO') {
    if (debugMode)
      printf('base64_decoded: %s', base64_decode(game_package.url));

    var decoded_url = base64_decode(game_package.url).split('|');
    game_package.stream_url = decoded_url[0];

    var tracking = Global.trackingUri.replace('%(random)', Math.floor(Math.random() * 10000000000000));
    tracking = tracking.replace('%(contentid)', game_package.contentId);

    var params = {
      'stream-params': decoded_url[2],
      'stream-fingerprint': decoded_url[1],
      'tracking-url': tracking
    }

    if (game_package.type === 'video')
      params.seek = '1';

    if (debugMode) {
      print(pjson(params));
      print(pjson(game_package));
    }

    var qual = parseInt(Global.videoQuality);
    if (qual === 0 || qual === 1)
      params.quality = qual;

    game_package.params = params;

    var chooseStart = (function() {
      get(game_package.gameData.inningsIndex, Global.DataType.XML, loadInningsIndex, game_package);
    });

    var chooseLive = (function() {
      game_package.params.live = 1;
      playContent(game_package);
    });

    if (game_package.type === 'audio')
      chooseLive();
    else if (game_package.mediaState !== 'MEDIA_ON')
      chooseStart();
    else
      uiConfirmDialog(Global.messages.ALREADY_IN_PROGRESS, chooseLive, chooseStart, 'Start', 'Live');
  }
}

/**
 * Send traking event from the active game to Mixpanel
 * @param    game_package   Game playback object
 */
function trackActiveGame(game_package) {
  try {
    // make sure we don't track play requests when in debug/qa mode
    if (!debugMode && !qaMode) {
      Mixpanel.track((game_package.type === 'video') ? 'play-video' : 'play-audio', {
        "video-title": game_package.title,
        "type": (game_package.mediaState !== 'MEDIA_ON') ? "archive" : "live"
      });
    }
  }
  catch (e) {
    printError(e);
  }
}

/**
 * Play video from the game package
 * @param    game_package    Game playback object
 */
function playContent(game_package) {
  game_package.playlist_url = sprintf("%s?%s", game_package.stream_url, serialize(game_package.params));

  if (debugMode)
    print(pjson(game_package));

  if (!initPlayback)
    return false;

  // for mlb tracking
  beforePlayback(game_package.contentId);

  try {
    // stop media player
    boxeeAPI.mediaPlayer().stop();

    // build play item to send to media player
    var playItem = {
      title: game_package.title,
      url: game_package.playlist_url,
      playerWindow: {
        infoAction: "overlay.qml",
        customQmlBasePath: boxeeAPI.runningAppPath() + "/"
      }
    }

    // assign game package to Global to allow the overlay window access
    Global.activeGame = game_package;
    Global.activeAudioTrack = 0;

    // load game data if game is not live
    if (game_package.mediaState !== 'MEDIA_ON') {
      get(game_package.gameData.inningsIndex, Global.DataType.XML, populateInnings, undefined, true);

      if (game_package.gameData.gameEvents)
        get(game_package.gameData.gameEvents, Global.DataType.XML, populateGameEvents, undefined, true);

      if (game_package.gameData.runScoringPlays)
        get(game_package.gameData.runScoringPlays, Global.DataType.XML, populateRunScoringPlays, undefined, true);
    }

    // initiate wait dialog
    uiShowWait();

    // track this event
    trackActiveGame(game_package);

    // send playItem to the media player
    boxeeAPI.mediaPlayer().open(playItem);
  }
  catch (e) {
    printError(e);
    uiOkDialog(undefined, Global.messages.GENERIC_PLAYBACK_ERROR);
  }

  initPlayback = false;
}

/**
 * Extracts the game start timecode from innings index xml
 * @param    request         Data from inningsIndex request.
 * @param    game_package    Game playback object
 */
function loadInningsIndex(request, game_package) {
  // if the response is bad, skip and play game package
  if (!request.isOk) {
    playContent(game_package);
    return;
  }

  if (request.response.game._start_datetime !== undefined) {
    game_package.oldTimestamp = false;
    game_package.params.startDate = request.response.game._start_datetime
  }
  else {
    game_package.oldTimestamp = true;
    game_package.params.startDate = buildHlsTimestamp(request.response.game._start_timecode, game_package.eventId);
  }

  // play game package
  playContent(game_package);
}

/**
 * Converts the old MLB HLS timestamp to (yyyy-MM-ddThh:mm:ss)
 * @param    timestamp   Old HLS timestamp (hh:mm:ss)
 * @param    eventId     calendarId from game_package
 * @returns  Updated HLS timestamp
 */
function buildHlsTimestamp(timestamp, eventId) {
  try {
    var gameDate = eventId.regex(/(\d{4}-\d{2}-\d{2}$)/ig);
    return sprintf("%sT%s", gameDate[0][1], timestamp);
  }
  catch (e) {
    printError(e);
    return oldTimestamp;
  }
}

/**
 * Builds/Requests url for MLB partner service check.
 * @param    callback    Callback function. Optional.
 */
function loadServiceCheck(callback) {
  var serviceUrl = sprintf(Global.serviceCheckUri, (qaMode) ? 'boxee-qa' : 'boxee', '0000000', Math.random() * 10000000);
  get(serviceUrl, Global.DataType.PLAIN, serviceCheck, callback);
}

/**
 * Processes MLB partner service check return
 * @param    request     Data from loadServiceCheck request.
 * @param    callback    Callback function. Optional.
 */
function serviceCheck(request, callback) {
  if (!request.isOk) {
    if (isFunction(callback))
      callback(false);
    return;
  }

  var info = request.response.regex(/^(.*?)=(.*?)$/igm);

  for (var i = 0; i <= info.length - 1; i++) {
    var key = info[i][1].replace('.', '_');
    var data = info[i][2];

    data = data.regexReplaceAll(/\${(.*?)}/, '%(\$1)s');
    key = utilityCamelCaseConfig(key);

    if (key === 'grid')
      continue;

    if (data !== '')
      Global[key] = data;

    if (debugMode)
      printf("%s: %s", key, data);
  }

  if (isFunction(callback))
    callback();
}

/**
 * Tracking call for MLB, url should be hit once just before requesting mediaFramework
 */
function beforeFrameWork() {
  var params = {
    ch: 'Media',
    pageName: 'BOXEE Request',
    c1: 'BOXEE'
  }

  var url = sprintf(Global.beforeFrameworkUri, Math.floor(Math.random() * 10000000));
  get(url + serialize(params), Global.DataType.PLAIN);
}

/**
 * Tracking call for MLB, url should be hit once just before playback
 * @param    contentId   Game Content ID
 */
function beforePlayback(contentId) {
  var params = {
    ch: 'Media',
    pageName: 'BOXEE Media Return',
    c25: sprintf('%d|HTTP_CLOUD_WIRED', parseInt(contentId)),
    c27: 'Media Player',
    c43: 'BOXEE'
  }

  var url = sprintf(Global.beforePlaybackUri, Math.floor(Math.random() * 10000000));
  get(url + serialize(params), Global.DataType.PLAIN, undefined, undefined, true);
}

/**
 * Reloads calendar and team objects when turning on/off qa & debug modes
 */
function reloadCalendarAndPlayers() {
  loadTeams();
  loadCalendar(undefined, calendarBrowser.fillCalendar);
}

/**
 * Resets the entire application. Settings are cleared and users is returned to the sign in screen
 */
function reset() {
  resetSettings()
  mainMenu.visible = false;
  loggedOut.visible = true;
  forceFocus(loggedOutButton);
}

/**
 * Exits the application
 */
function confirmExit() {
  windowManager.pop();
  boxeeAPI.appStopped();
}

/**
 * Prompts the user to exit the application
 * @param    cancelCallback  Callback function executed if users canceles the dialog
 */
function exit(cancelCallback) {
  uiConfirmDialog(Global.messages.CONFIRM_EXIT, confirmExit, cancelCallback, "No thanks", "Yes");
}
