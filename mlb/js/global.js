.pragma library

var email;
var password;
var randAccount;
var loggedin = false;
var accountLinked = false;

var id;
var fingerprint;
var sessionKey;

var videoQuality = 2;
var calendarDate = 0;
var archiveSpoiler = 0;

var teams = [];
var calendar = [];
var standings = [];
var favoriteTeams = [];
var waitVisible = false;

var activeGame = {};
var activeAudioTrack = 0;

var gridPoll;
var launchAlert;
var launchAlertDuration;
var userAgent;
var gamedayRoot;
var profileService;
var mediaFrameworkVideo;
var mediaFrameworkAudio;
var identityPointService;
var mediaFrameworkCatalog;

var teamLogosUri = 'http://mlb.com/images/homepage/team/y2011/logos/';
var serviceCheckUri = 'http://lwsa.mlb.com/partner-config/config?company=%s&type=tv&productYear=2013&model=BoxeeTV&firmware=2.0&app_version=3.0&identityPointId=%s&a=%s'
var grid = 'year_%(year)s/month_%(month)s/day_%(day)s/grid.xml';
var miniscoreboard = 'year_%(year)s/month_%(month)s/day_%(day)s/miniscoreboard.xml';
var mediaRequestUri = 'https://mlb-ws.mlb.com/pubajaxws/bamrest/MediaService2_0/op-findUserVerifiedEvent/v-2.3?';
var teamsUri = 'http://mlb.mlb.com/lookup/named.team_all.bam?sport_code=%27mlb%27&active_sw=%27Y%27&all_star_sw=%27N%27';
var standingsUri = 'http://mlb.mlb.com/lookup/json/named.standings_all_league_repeater.bam?sit_code=%27h0%27&league_id=104&league_id=103&season=';
var trackingUri = 'http://mlbglobal08.112.2o7.net/b/ss/mlbglobal08/1/G.5--NS/%(random)?ch=Media&pageName=BOXEE%20Media%20Return&c25=%(contentid)%7CHTTP%5FCLOUD%5FWIRED&c27=Media%20Player&c43=BOXEE';
var calendarUri = 'http://mlb.mlb.com/lookup/named.schedule_game_count_by_date.bam?schedule_game_count_by_date.col_in=game_date,games&season=%(season)&sport_code=%27mlb%27&end_date=%27%(end)%27&start_date=%27%(start)%27';
var beforeFrameworkUri = 'http://mlbglobal08.112.2o7.net/b/ss/mlbglobal08/1/H.19--NS/%d?';
var beforePlaybackUri = 'http://mlbglobal08.112.2o7.net/b/ss/mlbglobal08/1/G.5--NS/%d?';

var messages = {
  PREMIUM_SUBSCRIBER: 'You must be a MLB.TV Premium Subscriber to be able to watch this game. Please verify your account status on MLB.TV.',
  BLACKED_OUT: 'You are currently blacked out from watching this broadcast. This stream will be made available to you approximately 90 minutes after the conclusion of the game.',
  GENERIC_PLAYBACK_ERROR: 'There was an error when trying to play this game.',
  COMMUNICATION_ERROR: 'There was a problem communitacting with MLB.TV. Please try again later.',
  ALREADY_IN_PROGRESS: 'This game is already in progress. Would you like to watch this game from the start or jump into the live broadcast?',
  CONFIRM_EXIT: 'Would you like to exit this application?'
}

var DataType = {
  JSON: 2,
  XML: 1,
  PLAIN: 0
}

var statusCodes = {
  I: ['In Progress', '', 1],
  IR: ['Delayed', 'Rain', 1],
  IS: ['Delayed', 'Snow', 1],
  IG: ['Delayed', 'Wet Grounds', 1],
  IV: ['Delayed', 'Venue', 1],
  IF: ['Delayed', 'Fog', 1],
  IC: ['Delayed', 'Cold', 1],
  ID: ['Delayed', 'Darkness', 1],
  IB: ['Delayed', 'Wind', 1],
  IP: ['Delayed', 'Power', 1],
  IY: ['Delayed', 'Ceremony', 1],
  IL: ['Delayed', 'Lightning', 1],
  IE: ['Delayed', 'Emergency', 1],
  IA: ['Delayed', 'Tragedy', 1],
  IH: ['Delayed', 'Replay', 1],
  IO: ['Delayed', 'Other', 1],
  IZ: ['Delayed', 'About to Resume', 1],
  P: ['Pre-Game', '', 2],
  PW: ['Warmup', '', 2],
  UZ: ['Suspended', 'About to Resume', 2],
  PR: ['Delayed Start', 'Rain', 3],
  PS: ['Delayed Start', 'Snow', 3],
  PG: ['Delayed Start', 'Wet Grounds', 3],
  PV: ['Delayed Start', 'Venue', 3],
  PF: ['Delayed Start', 'Fog', 3],
  PC: ['Delayed Start', 'Cold', 3],
  PD: ['Delayed Start', 'Darkness', 3],
  PB: ['Delayed Start', 'Wind', 3],
  PP: ['Delayed Start', 'Power', 3],
  PY: ['Delayed Start', 'Ceremony', 3],
  PL: ['Delayed Start', 'Lightning', 3],
  PE: ['Delayed Start', 'Emergency', 3],
  PA: ['Delayed Start', 'Tragedy', 3],
  PO: ['Delayed Start', 'Other', 3],
  S: ['Preview', '', 4],
  OR: ['Final Early', 'Rain', 5],
  OS: ['Final Early', 'Snow', 5],
  OG: ['Final Early', 'Wet Grounds', 5],
  OV: ['Final Early', 'Venue', 5],
  OF: ['Final Early', 'Fog', 5],
  OC: ['Final Early', 'Cold', 5],
  OD: ['Final Early', 'Darkness', 5],
  OB: ['Final Early', 'Wind', 5],
  OP: ['Final Early', 'Power', 5],
  OL: ['Final Early', 'Lightning', 5],
  OE: ['Final Early', 'Emergency', 5],
  OA: ['Final Early', 'Tragedy', 5],
  OM: ['Final Early', 'Mercy', 5],
  OO: ['Final Early', 'Other', 5],
  FR: ['Final Early', 'Rain', 5],
  FS: ['Final Early', 'Snow', 5],
  FG: ['Final Early', 'Wet Grounds', 5],
  FV: ['Final Early', 'Venue', 5],
  FF: ['Final Early', 'Fog', 5],
  FC: ['Final Early', 'Cold', 5],
  FD: ['Final Early', 'Darkness', 5],
  FB: ['Final Early', 'Wind', 5],
  FP: ['Final Early', 'Power', 5],
  FL: ['Final Early', 'Lightning', 5],
  FE: ['Final Early', 'Emergency', 5],
  FA: ['Final Early', 'Tragedy', 5],
  FM: ['Final Early', 'Mercy', 5],
  FO: ['Final Early', 'Other', 5],
  O: ['Final', '', 6],
  F: ['Final', '', 6],
  FT: ['Final', 'Tied', 6],
  FW: ['Final', 'Won in Tiebreaker', 6],
  OW: ['Final', 'Decision by Tiebreaker', 6],
  DR: ['Postponed', 'Rain', 7],
  DS: ['Postponed', 'Snow', 7],
  DG: ['Postponed', 'Wet Grounds', 7],
  DV: ['Postponed', 'Venue', 7],
  DF: ['Postponed', 'Fog', 7],
  DC: ['Postponed', 'Cold', 7],
  DD: ['Postponed', 'Darkness', 7],
  DB: ['Postponed', 'Wind', 7],
  DP: ['Postponed', 'Power', 7],
  DL: ['Postponed', 'Lightning', 7],
  DE: ['Postponed', 'Emergency', 7],
  DA: ['Postponed', 'Tragedy', 7],
  DO: ['Postponed', 'Other', 7],
  T: ['Suspended', '', 8],
  U: ['Suspended', '', 8],
  TR: ['Suspended', 'Rain', 8],
  TS: ['Suspended', 'Snow', 8],
  TG: ['Suspended', 'Wet Grounds', 8],
  TV: ['Suspended', 'Venue', 8],
  TF: ['Suspended', 'Fog', 8],
  TC: ['Suspended', 'Cold', 8],
  TD: ['Suspended', 'Darkness', 8],
  TB: ['Suspended', 'Wind', 8],
  TP: ['Suspended', 'Power', 8],
  TL: ['Suspended', 'Lightning', 8],
  TE: ['Suspended', 'Emergency', 8],
  TA: ['Suspended', 'Tragedy', 8],
  TO: ['Suspended', 'Other', 8],
  UR: ['Suspended', 'Rain', 8],
  US: ['Suspended', 'Snow', 8],
  UG: ['Suspended', 'Wet Grounds', 8],
  UV: ['Suspended', 'Venue', 8],
  UF: ['Suspended', 'Fog', 8],
  UC: ['Suspended', 'Cold', 8],
  UD: ['Suspended', 'Darkness', 8],
  UB: ['Suspended', 'Wind', 8],
  UP: ['Suspended', 'Power', 8],
  UL: ['Suspended', 'Lightning', 8],
  UE: ['Suspended', 'Emergency', 8],
  UA: ['Suspended', 'Tragedy', 8],
  UO: ['Suspended', 'Other', 8],
  Q: ['Forfeit', '', 9],
  R: ['Forfeit', '', 9],
  QK: ['Forfeit', 'Delay', 9],
  QX: ['Forfeit', 'Appear', 9],
  QQ: ['Forfeit', 'Lineup', 9],
  QJ: ['Forfeit', 'Ejection', 9],
  QI: ['Forfeit', 'Ineligible', 9],
  QN: ['Forfeit', 'Refusal', 9],
  QV: ['Forfeit', 'Unplayable', 9],
  QR: ['Forfeit', 'Rule', 9],
  QO: ['Forfeit', 'Other', 9],
  RK: ['Forfeit', 'Delay', 9],
  RX: ['Forfeit', 'Appear', 9],
  RQ: ['Forfeit', 'Lineup', 9],
  RJ: ['Forfeit', 'Ejection', 9],
  RI: ['Forfeit', 'Ineligible', 9],
  RN: ['Forfeit', 'Refusal', 9],
  RV: ['Forfeit', 'Unplayable', 9],
  RR: ['Forfeit', 'Rule', 9],
  RO: ['Forfeit', 'Other', 9],
  CR: ['Cancelled', 'Rain', 10],
  CS: ['Cancelled', 'Snow', 10],
  CG: ['Cancelled', 'Wet Grounds', 10],
  CV: ['Cancelled', 'Venue', 10],
  CF: ['Cancelled', 'Fog', 10],
  CC: ['Cancelled', 'Cold', 10],
  CD: ['Cancelled', 'Darkness', 10],
  CB: ['Cancelled', 'Wind', 10],
  CP: ['Cancelled', 'Power', 10],
  CL: ['Cancelled', 'Lightning', 10],
  CE: ['Cancelled', 'Emergency', 10],
  CA: ['Cancelled', 'Tragedy', 10],
  CO: ['Cancelled', 'Other', 10]
};
