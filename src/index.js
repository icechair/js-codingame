/* global readline print printErr */
const h = require('./helper')
const DEBUG = false
const log = (...args) => {
  if (!DEBUG) return
  printErr(...args)
}

const MAP_W = 23
const MAP_H = 21
const SHIP = 'SHIP'
const BARREL = 'BARREL'
const CANNONBALL = 'CANNONBALL'
const MINE = 'MINE'
const ROTATION = 0
const SPEED = 1
const STOCK = 2
const OWNER = 3
const RUM = 0
const ME = 1
const SHOOTER = 1
const TTL = 2

function Entity (data) {
  const [id, type, x, y, arg1, arg2, arg3, arg4] = data.split(' ')
  this.id = +id
  this.type = type
  this.data = [+arg1, +arg2, +arg3, +arg4]
  this.pos = new h.Offset(x, y).toCube()
}

Entity.prototype.toString = function () {
  return Object.keys(this).map(key => `${key}: ${this[key]}`).join(', ')
}

function generateEntities (count) {
  const entities = []
  for (let i = 0; i < count; ++i) {
    entities.push(new Entity(readline()))
  }
  return entities
}

const isShip = x => x.type === SHIP
const isBarrel = x => x.type === BARREL
const isMine = x => x.data[OWNER] === ME
const isAMine = x => x.type === MINE
const isCannonball = x => x.type === CANNONBALL
const byDistance = start => (a, b) => {
  return (start.distance(a.pos) < start.distance(b.pos))
    ? -1
    : (start.distance(a.pos) > start.distance(b.pos))
    ? 1
    : 0
}

const isOnPosition = pos => x => x.pos.isEqual(pos)

const targetPrediction = (ship, enemy) => {
  const cannonPos = ship.pos.neighbour(ship.data[ROTATION])
  let ttt = Math.round(1 + cannonPos.distance(enemy.pos) / 3)
  let next = enemy.pos
  for (let i = 0; i < ttt; ++i) {
    for (let j = 0; j < enemy.data[SPEED]; ++j) {
      next = next.neighbour(enemy.data[ROTATION])
    }
  }
  return next
}

while (true) {
  const myShipCount = Number(readline())
  const entityCount = Number(readline())
  const entities = generateEntities(entityCount)
  const myShips = entities.filter(x => isShip(x) && isMine(x))
  const barrels = entities.filter(isBarrel)
  const cannonballs = entities.filter(isCannonball)
  const mines = entities.filter(isAMine)
  const enemyShips = entities.filter(x => isShip(x) && !isMine(x))
  myShips.forEach(ship => {
    log(ship)
    const rotation = ship.data[ROTATION]

    const barrel = barrels.sort(byDistance(ship.pos)).shift()
    const myCannonballs = cannonballs.filter(x => x.data[SHOOTER] === ship.id)
    const nearestEnemy = enemyShips.sort(byDistance(ship.pos))[0]
    const distanceToEnemy = ship.pos.neighbour(ship.data[ROTATION]).distance(nearestEnemy.pos)
    let action = 'MOVE'
    let message = 'dododo'
    let target = barrel
      ? barrel.pos
      : ship.pos.neighbour(rotation)

    if (ship.data[SPEED] === 0) {
      action = 'MOVE'
    }
    if (ship.data[STOCK] < 50) {
      action = 'MOVE'
    } else {
      if (distanceToEnemy <= 10 && myCannonballs.length <= 0) {
        target = targetPrediction(ship, nearestEnemy)
        action = 'FIRE'
      } else {
        const direction = (rotation + 1) % 6
        target = ship.pos.neighbour(rotation).neighbour(direction)
        message = 'idle'
      }
    }


    log('mines')
    const danger = mines.concat(cannonballs).filter(m => {
      log('mine', m)
      const distance = ship.pos.distance(m.pos)
      const direction = ship.pos.directionTo(m.pos)
      return distance <= 3 && (direction === -1 || direction === rotation)
    }).concat(enemyShips.filter(s => ship.pos.distance(s.pos) <= 3))

    if (danger.length > 0) {
      const distance = ship.pos.distance(danger[0].pos)
      let direction = ship.pos.directionTo(danger[0].pos)
      if (distance <= 2 && direction !== rotation) {
        target = ship.pos.neighbour(rotation).neighbour(rotation)
        message = 'close danger not in path'
      } else if (direction === rotation) {
        direction = (rotation + 1) % 6
        target = ship.pos.neighbour(direction).neighbour(direction)
        message = 'close danger in path'
      } else {
        direction = (direction + 3) % 6
        target = danger[0].pos.neighbour(direction).neighbour(direction).neighbour(direction)
        message = 'some danger'
      }
      action = 'MOVE'
    }
    target = target.toOffset()
    if (target.col < 0) target.col = MAP_W - 1
    if (target.col >= MAP_W) target.col = 0
    if (target.row < 0) target.row = MAP_H - 1
    if (target.row >= MAP_H) target.row = 0
    print(`${action} ${target.col} ${target.row} ${message}`)
  })
}
