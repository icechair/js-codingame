const c = require('./constants')
const Random = require('./Random')
const Player = require('./Player')
const Ship = require('./Ship')
const Mine = require('./Mine')
const Barrel = require('./Barrel')
const Cannonball = require('./Cannonball')
const Damage = require('./Damage')

const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

const seed = 1337
const random = new Random(seed)

const shipsPerPlayer = clamp(
  random.nextInt(c.MIN_SHIPS, c.MAX_SHIPS),
  c.MIN_SHIPS,
  c.MAX_SHIPS
)
let mineCount = c.MAX_MINES > c.MIN_MINES
  ? clamp(
    random.nextInt(c.MIN_MINES, c.MAX_MINES),
    c.MIN_MINES,
    c.MAX_MINES
  )
  : c.MIN_MINES

let barrelCount = clamp(
  random.nextInt(c.MIN_RUM_BARRELS, c.MAX_RUM_BARRELS),
  c.MIN_RUM_BARRELS,
  c.MAX_RUM_BARRELS
)

let cannonballs = new Set()
const cannonballExplosions = new Set()
let damage = new Set()

const players = []
for (let i = 0; i < 2; ++i) {
  players.push(new Player(i))
}

for (let i = 0; i < shipsPerPlayer; ++i) {
  const xMin = 1 + i * c.MAP_WIDTH / shipsPerPlayer
  const xMax = (i + 1) * c.MAP_WIDTH / shipsPerPlayer - 2

  const y = 1 + random.nextInt(0, c.MAP_HEIGHT / 2 - 2)
  const x = xMin + random.nextInt(0, 1 + xMax - xMin)
  const orientation = random.nextInt(0, 6)

  const ship0 = new Ship(x, y, orientation, 0)
  const ship1 = new Ship(x, c.MAP_HEIGHT - 1 - y, (6 - orientation) % 6, 1)

  players[0].ships.add(ship0)
  players[1].ships.add(ship1)
  players[0].shipsAlive.add(ship0)
  players[1].shipsAlive.add(ship1)
}
const ships = new Set(players.map(p => Array.from(p.ships)).reduce((acc, ships) => acc.concat(ships), []))
const cellIsFreeOfShips = p => {
  return Array.from(ships).filter(s => s.isAt(p)).length === 0
}

const mines = new Set()
const cellIsFreeOfMines = p => Array.from(mines).filter(m => m.position.isEqual(p)).length === 0

while (mines.size < mineCount) {
  const x = 1 + random.nextInt(0, c.MAP_WIDTH - 2)
  const y = 1 + random.nextInt(0, c.MAP_HEIGHT / 2)
  const mine = new Mine(x, y)

  if (cellIsFreeOfMines(mine.position) && cellIsFreeOfShips(mine.position)) {
    if (y !== c.MAP_HEIGHT - 1 - y) {
      mines.add(new Mine(x, c.MAP_HEIGHT - 1 - y))
    }
    mines.add(mine)
  }
}

mineCount = mines.size

const barrels = new Set()
const cellIsFreeOfBarrels = p => Array.from(barrels).filter(b => b.position.isEqual(p))

while (barrels.size < barrelCount) {
  const x = 1 + random.nextInt(0, c.MAP_WIDTH - 2)
  const y = 1 + random.nextInt(0, c.MAP_HEIGHT / 2)
  const h = c.MIN_RUM_BARREL_VALUE + random.nextInt(0, 1 + c.MAX_RUM_BARREL_VALUE - c.MIN_RUM_BARREL_VALUE)
  const barrel = new Barrel(x, y, h)
  if (cellIsFreeOfShips(barrel.position) && cellIsFreeOfMines(barrel.position) && cellIsFreeOfBarrels(barrel.position)) {
    if (y !== c.MAP_HEIGHT - 1 - y) {
      barrels.add(new Barrel(x, c.MAP_HEIGHT - 1 - y, h))
    }
    barrels.add(barrel)
  }
}
barrelCount = barrels.size

const getConfiguration = () => ({seed, shipsPerPlayer, barrelCount, mineCount})
const prepare = () => {
  players.forEach(player => {
    player.ships.forEach(ship => {
      ship.action = null
      ship.message = null
    })
  })
  cannonballExplosions.clear()
  damage.clear()
}

const getExpectedOutputLineCountForPlayer = idx => players[idx].shipsAlive.length

const handlePlayerOutput = (frame, round, playerIdx, outputs) => {
  const player = players[playerIdx]
  const shipsIt = player.shipsAlive.values()
  try {
    outputs.forEach((line, i) => {
      const matchWait = c.PLAYER_INPUT_WAIT_PATTERN.exec(line)
      const matchMove = c.PLAYER_INPUT_MOVE_PATTERN.exec(line)
      const matchFaster = c.PLAYER_INPUT_FASTER_PATTERN.exec(line)
      const matchSlower = c.PLAYER_INPUT_SLOWER_PATTERN.exec(line)
      const matchPort = c.PLAYER_INPUT_PORT_PATTERN.exec(line)
      const matchStarboard = c.PLAYER_INPUT_STARBOARD_PATTERN.exec(line)
      const matchFire = c.PLAYER_INPUT_FIRE_PATTERN.exec(line)
      const matchMine = c.PLAYER_INPUT_MINE_PATTERN.exec(line)
      const ship = shipsIt.next().value

      if (matchMove) {
        const x = +matchMove[1]
        const y = +matchMove[2]
        ship.setMessage(matchMove[3])
        ship.moveTo(x, y)
      } else if (matchFaster) {
        ship.setMessage(matchFaster[1])
        ship.faster()
      } else if (matchSlower) {
        ship.setMessage(matchSlower[1])
        ship.slower()
      } else if (matchPort) {
        ship.setMessage(matchPort[1])
        ship.port()
      } else if (matchStarboard) {
        ship.setMessage(matchStarboard[1])
        ship.starboard()
      } else if (matchWait) {
        ship.setMessage(matchWait[1])
      } else if (matchMine) {
        ship.setMessage(matchMine[1])
        ship.placeMine()
      } else if (matchFire) {
        const x = +matchFire[1]
        const y = +matchFire[2]
        ship.setMessage(matchFire[3])
        ship.fire(x, y)
      } else {
        throw new Error(`a valid action '${line}'`)
      }
    })
  } catch (e) {
    player.die()
    throw e
  }
}

const decrementRum = () => ships.forEach(ship => ship.damage(1))

const updateInitialRum = () => ships.forEach(ship => { ship.initialHealth = ship.health })

const moveCannonballs = () => {
  for (let ball of cannonballs) {
    if (ball.remainingTurns === 0) {
      cannonballs.delete(ball)
      continue
    } else if (ball.remainingTurns > 0) {
      --ball.remainingTurns
    }

    if (ball.remainingTurns === 0) {
      cannonballExplosions.add(ball.position)
    }
  }
}

const applyActions = () => {
  for (let player of players) {
    for (let ship of player.shipsAlive) {
      if (ship.mineCooldown > 0) {
        --ship.mineCooldown
      }
      if (ship.cannonCooldown > 0) {
        --ship.cannonCooldown
      }

      ship.newOrientation = ship.orientation

      if (ship.action != null) {
        switch (ship.action) {
          case c.FASTER:
            if (ship.speed < c.MAX_SHIP_SPEED) {
              ++ship.speed
            }
            break
          case c.SLOWER:
            if (ship.speed > 0) {
              --ship.speed
            }
            break
          case c.PORT:
            ship.newOrientation = (ship.orientation + 1) % 6
            break
          case c.STARBOARD:
            ship.newOrientation = (ship.orientation + 5) % 6
            break
          case c.MINE:
            if (ship.mineCooldown === 0) {
              const target = ship.stern().neighbour((ship.direction + 3) % 6)
              if (target.isInsideMap()) {
                if (cellIsFreeOfBarrels(target) && cellIsFreeOfShips(target) && cellIsFreeOfMines(target)) {
                  ship.mineCooldown = c.COOLDOWN_MINE
                  mines.add(new Mine(target.x, target.y))
                }
              }
            }
            break
          case c.FIRE:
            const distance = ship.bow().distanceTo(ship.target)
            if (ship.target.isInsideMap() && distance <= c.FIRE_DISTANCE_MAX && ship.cannonCooldown === 0) {
              const travelTime = 1 + Math.round(ship.bow().distanceTo(ship.target) / 3)
              cannonballs.add(new Cannonball(ship.target.x, ship.target.y, ship.id, ship.bow().x, ship.bow().y, travelTime))
              ship.cannonCooldown = c.COOLDOWN_CANNON
            }
            break
          default:
            break
        }
      }
    }
  }
}

const checkCollisions = ship => {
  const bow = ship.bow()
  const stern = ship.stern()
  const center = ship.position
  for (let barrel of barrels) {
    if (barrel.position.isEqual(bow) || barrel.position.isEqual(center) || barrel.position.isEqual(stern)) {
      ship.heal(barrel.health)
      barrels.delete(barrel)
    }
  }

  for (let mine of mines) {
    const mineDamage = mine.explode(ships, false)
    if (mineDamage.length) {
      mineDamage.forEach(d => damage.add(d))
      mines.delete(mine)
    }
  }
}

const moveShips = () => {
  for (let i = 0; i <= c.MAX_SHIP_SPEED; ++i) {
    for (let player of players) {
      for (let ship of player.shipsAlive) {
        ship.newPosition = ship.position
        ship.newBowCoordinate = ship.bow()
        ship.newSternCoordinate = ship.stern()

        if (i > ship.speed) continue

        const newCoordinate = ship.position.neighbour(ship.orientation)

        if (newCoordinate.isInsideMap()) {
          ship.newPosition = newCoordinate
          ship.newBowCoordinate = newCoordinate.neighbour(ship.orientation)
          ship.newSternCoordinate = newCoordinate.neighbour((ship.orientation + 3) % 6)
        } else {
          ship.speed = 0
        }
      }
    }

    const collisions = new Set()
    let collisionDetected = true
    while (collisionDetected) {
      collisionDetected = false
      for (let ship of ships) {
        if (ship.newBowIntersects(ships)) {
          collisions.add(ship)
        }
      }

      for (let ship of collisions) {
        ship.newPosition = ship.position
        ship.newBowCoordinate = ship.bow()
        ship.newSternCoordinate = ship.stern()

        ship.speed = 0

        collisionDetected = true
      }
      collisions.clear()
    }

    for (let ship of ships) {
      ship.position = ship.newPosition
    }

    for (let ship of ships) {
      checkCollisions(ship)
    }
  }
}


const rotateShips = () => {
  for (let player of players) {
    for (let ship of player.shipsAlive) {
      ship.newPosition = ship.position
      ship.newBowCoordinate = ship.newBow()
      ship.newSternCoordinate = ship.newStern()
    }
  }

  let collisionDetected = true
  const collisions = new Set()
  while (collisionDetected) {
    collisionDetected = false
    for (let ship of ships) {
      if (ship.newPositionsIntersects(ships)) {
        collisions.add(ship)
      }
    }

    for (let ship of collisions) {
      ship.newOrientation = ship.orientation
      ship.newBowCoordinate = ship.newBow()
      ship.newSternCoordinate = ship.newStern()
      ship.speed = 0
      collisionDetected = true
    }
    collisions.clear()
  }

  for (let ship of ships) {
    ship.orientation = ship.newOrientation
  }

  for (let ship of ships) {
    checkCollisions(ship)
  }
}

const gameIsOver = () => {
  for (let player of players) {
    if (player.shipsAlive.length === 0) {
      return true
    }
  }
  return barrels.size === 0 && c.LEAGUE_LEVEL === 0
}

const explodeShips = () => {
  for (let position of cannonballExplosions) {
    for (let ship of ships) {
      if (position.isEquals(ship.bow() || position.isEquals(ship.stern()))) {
        damage.add(new Damage(position, c.LOW_DAMAGE, true))
        ship.damage(c.LOW_DAMAGE)
        cannonballExplosions.delete(position)
        break
      } else if (position.isEqual(ship.position)) {
        damage.add(new Damage(position, c.HIGH_DAMAGE, true))
        ship.damage(c.HIGH_DAMAGE)
        cannonballExplosions.delete(position)
        break
      }
    }
  }
}

const explodeMines = () => {
  for (let position of cannonballExplosions) {
    for (let mine of mines) {
      if (mine.position.isEqual(position)) {
        mine.explode(ships, true).forEach(d => damage.add(d))
        mines.delete(mine)
        cannonballExplosions.delete(position)
        break
      }
    }
  }
}

const explodeBarrels = () => {
  for (let position of cannonballExplosions) {
    for (let barrel of barrels) {
      if (barrel.position.isEqual(position)) {
        damage.add(new Damage(position, 0, true))
        cannonballExplosions.delete(position)
        barrels.delete(barrel)
        break
      }
    }
  }
}

const updateGame = round => {
  moveCannonballs()
  decrementRum()
  updateInitialRum()

  applyActions()
  moveShips()
  rotateShips()

  explodeShips()
  explodeMines()
  explodeBarrels()

  for (let ship of ships) {
    if (ship.health <= 0) {
      const reward = Math.min(c.REWARD_RUM_BARREL_VALUE, ship.initialHealth)
      if (reward > 0) {
        barrels.add(new Barrel(ship.position.x, ship.position.y, reward))
      }
    }
  }

  for (let position of cannonballExplosions) {
    damage.add(new Damage(position, 0, false))
  }

  for (let ship of ships) {
    if (ship.health <= 0) {
      players[ship.owner].shipsAlive.delete(ship)
      ships.delete(ship)
    }
  }
  if (gameIsOver()) {
    throw new Error('endReached')
  }
}

const getInputForPlayer = (round, playerIdx) => {
  const data = []
  for (let ship of players[playerIdx].shipsAlive) {
    data.push(ship.toPlayerString(playerIdx))
  }

  const shipsCount = data.length

  for (let ship of players[(playerIdx + 1) % 2].shipsAlive) {
    data.push(ship.toPlayerString(playerIdx))
  }

  for (let mine of mines) {
    let visible = false
    for (let ship of players[playerIdx].shipsAlive) {
      if (ship.position.distanceTo(mine.position) <= c.MINE_VISIBILITY_RANGE) {
        visible = true
        break
      }
    }
    if (visible) {
      data.add(mine.toPlayerString(playerIdx))
    }
  }

  for (let ball of cannonballs) {
    data.add(ball.toPlayerString(playerIdx))
  }

  for (let barrel of barrels) {
    data.add(barrel.toPlayerString(playerIdx))
  }

  data.unshift('' + data.length)
  data.unshift('' + shipsCount)

  return data.join('\n')
}

const getFrameDataForView = (round, frame, keyframe) => {
  const data = []
  for (let player of players) {
    data.push(player.toString())
  }

  for (let ball of cannonballs) {
    data.push(ball.toString())
  }

  for (let mine of mines) {
    data.push(mine.toString())
  }

  for (let barrel of barrels) {
    data.push(barrel.toString())
  }

  for (let d of damage) {
    data.push(d.toString())
  }
  return data.join('\n')
}

module.exports = {
  getFrameDataForView,
  getConfiguration,
  getInputForPlayer,
  updateGame,
  handlePlayerOutput
}
