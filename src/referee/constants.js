const constants = {
  MAP_WIDTH: 23,
  MAP_HEIGHT: 21,
  COOLDOWN_CANNON: 2,
  COOLDOWN_MINE: 5,
  INITIAL_SHIP_HEALTH: 100,
  MAX_SHIP_HEALTH: 100,
  MIN_SHIPS: 1,
  MAX_SHIPS: 3,
  MIN_MINES: 5,
  MAX_MINES: 10,
  MIN_RUM_BARRELS: 10,
  MAX_RUM_BARRELS: 26,
  MIN_RUM_BARREL_VALUE: 10,
  MAX_RUM_BARREL_VALUE: 20,
  REWARD_RUM_BARREL_VALUE: 30,
  MINE_VISIBILITY_RANGE: 5,
  FIRE_DISTANCE_MAX: 10,
  LOW_DAMAGE: 25,
  HIGH_DAMAGE: 50,
  MINE_DAMAGE: 25,
  NEAR_MINE_DAMAGE: 10,
  CANNONS_ENABLED: true,
  MINES_ENABLED: true,
  MAX_SHIP_SPEED: 2,
// MOVE (x) (y) (message)
  PLAYER_INPUT_MOVE_PATTERN: /MOVE (-?[0-9]{1,8})\s+(-?[0-9]{1,8})(?:\s+(.+))?/i,
// SLOWER (message)
  PLAYER_INPUT_SLOWER_PATTERN: /SLOWER(?:\s+(.+))?/i,
// SLOWER (message)
  PLAYER_INPUT_FASTER_PATTERN: /FASTER(?:\s+(.+))?/i,
// WAIT (message)
  PLAYER_INPUT_WAIT_PATTERN: /WAIT(?:\s+(.+))?/i,
// PORT (message)
  PLAYER_INPUT_PORT_PATTERN: /PORT(?:\s+(.+))?/i,
// STARBOARD (message)
  PLAYER_INPUT_STARBOARD_PATTERN: /STARBOARD(?:\s+(.+))?/i,
// FIRE (x) (y) (message)
  PLAYER_INPUT_FIRE_PATTERN: /FIRE ([0-9]{1,8})\s+([0-9]{1,8})(?:\s+(.+))?/i,
// MINE (message)
  PLAYER_INPUT_MINE_PATTERN: /MINE(?:\s+(.+))?/i,
// Entities
  SHIP: 'SHIP',
  BARREL: 'BARREL',
  MINE: 'MINE',
  CANNONBALL: 'CANNONBALL',
// Actions
  FASTER: 'FASTER',
  SLOWER: 'SLOWER',
  PORT: 'PORT',
  STARBOARD: 'STARBOARD',
  FIRE: 'FIRE',
  WAIT: 'WAIT'
}

module.exports = constants
