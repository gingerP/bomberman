const BMDirections = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom'
};
const BMKeyboard = {
  SPACE: 32,
  LEFT: 37,
  TOP: 38,
  RIGHT: 39,
  BOTTOM: 40
};
const BMMapPoints = {
  FREE: 'free',
  WALL: 'wall',
  DESTRUCTIBLE: 'destructible'
};
const BombStatuses = {
  NOT_ACTIVATED: 'not_activated',
  ACTIVATED: 'activated',
  EXPLOSION: 'explosion',
  PREPARE_TO_DESTROY: 'prepare_to_destroy',
  DESTROYED: 'destroyed'
};
const GamerStatuses = {
  NOT_ACTIVATED: 'not_activated',
  ACTIVATED: 'activated',
  EXPLODED: 'exploded',
  DESTROYED: 'destroyed'
};
const GamerColors = {
  RED: 'red',
  WHITE: 'white'
};
const TeamStatuses = {
  MASTER: 'master',
  SLAVE: 'slave'
};
const RemoteEvents = {
  GAME_DATA: 'game-data'
};
