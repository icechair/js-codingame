const c = require('./constants')
const Entity = require('./Entity')
const Offset = require('./Coord').Offset

function Ship (x, y, orientation, owner) {
  Entity.call(this, c.SHIP, x, y)
  this.orientation = orientation
  this.speed = 0
  this.health = c.INITIAL_SHIP_HEALTH
  this.owner = owner
  this.message = ''
  this.action = null
}
Ship.prototype = Object.create(Entity.prototype)
Ship.prototype.constructor = Ship

Ship.prototype.toString = function () {
  return `${this.type}(${this.id}, ${this.position}, ${this.orientation}, ${this.health}, ${this.speed}, ${this.action ? this.action : c.WAIT}, ${this.bow()}, ${this.stern()}, ${this.message})`
}

Ship.prototype.toPlayerString = function (playerIdx) {
  return Entity.prototype.toPlayerString.call(this, this.orientation, this.speed, this.health, this.owner === playerIdx ? 1 : 0)
}

Ship.prototype.setMessage = function (message) {
  if (message && message.length > 50) {
    message = message.substring(0, 50) + '...'
  }
  this.message = message
}

Ship.prototype.moveTo = function (targetPosition) {
  let currentPosition = this.position
  if (currentPosition.isEqual(targetPosition)) {
    this.action = c.SLOWER
    return
  }
  let targetAngle, angleStraight, anglePort, angleStarboard, centerAngle, anglePortCenter, angleStarboardCenter
  switch (this.speed) {
    case 2:
      this.action = c.SLOWER
      break
    case 1:
      // Suppose we've moved first
      currentPosition = currentPosition.neighbour(this.orientation)
      if (!currentPosition.isInsideMap()) {
        this.action = c.SLOWER
        break
      }

      // Target reached at next turn
      if (currentPosition.isEqual(targetPosition)) {
        this.action = null
        break
      }

      // for each neighbour cell, find the closest to target
      targetAngle = currentPosition.angle(targetPosition)
      angleStraight = Math.min(Math.abs(this.orientation - targetAngle), 6 - Math.abs(this.orientation - targetAngle))
      anglePort = Math.min(Math.abs((this.orientation + 1) - targetAngle), Math.abs((this.orientation - 5) - targetAngle))
      angleStarboard = Math.min(Math.abs((this.orientation + 5) - targetAngle), Math.abs((this.orientation - 1) - targetAngle))

      centerAngle = currentPosition.angle(new Offset(c.MAP_WIDTH / 2, c.MAP_HEIGHT / 2))
      anglePortCenter = Math.min(Math.abs((this.orientation + 1) - centerAngle), Math.abs((this.orientation - 5) - centerAngle))
      angleStarboardCenter = Math.min(Math.abs((this.orientation + 5) - centerAngle), Math.abs((this.orientation - 1) - centerAngle))
      if (currentPosition.distanceTo(targetPosition) === 1 && angleStraight > 1.5) {
        this.action = c.SLOWER
        break
      }

      let distanceMin

      // Test forward
      let nextPosition = currentPosition.neighbour(this.orientation)
      if (nextPosition.isInsideMap()) {
        distanceMin = nextPosition.distanceTo(targetPosition)
        this.action = null
      }

      // Test port
      nextPosition = currentPosition.neighbour((this.orientation + 1) % 6)
      if (nextPosition.isInsideMap()) {
        const distance = nextPosition.distanceTo(targetPosition)
        if (distanceMin == null || distance < distanceMin || distance === distanceMin && anglePort < angleStraight - 0.5) {
          distanceMin = distance
          this.action = c.PORT
        }
      }

      // Test starboard
      nextPosition = currentPosition.neighbour((this.orientation + 5) % 6)
      if (nextPosition.isInsideMap()) {
        const distance = nextPosition.distanceTo(targetPosition)
        if (distanceMin == null || distance < distanceMin ||
           (distance === distanceMin && angleStarboard < anglePort - 0.5 && this.action === c.PORT) ||
           (distance === distanceMin && angleStarboard < angleStraight - 0.5 && this.action == null) ||
           (distance === distanceMin && this.action === c.PORT && angleStarboard === anglePort && angleStarboardCenter < anglePortCenter) ||
           (distance === distanceMin && this.action === c.PORT && angleStarboard === anglePort && angleStarboardCenter === anglePortCenter && (this.orientation === 1 || this.orientation === 4))) {
          distanceMin = distance
          this.action = c.STARBOARD
        }
      }
      break
    case 0:
      // Rotate ship towards target
      targetAngle = currentPosition.angle(targetPosition)
      angleStraight = Math.min(Math.abs(this.orientation - targetAngle), 6 - Math.abs(this.orientation - targetAngle))
      anglePort = Math.min(Math.abs((this.orientation + 1) - targetAngle), Math.abs((this.orientation - 5) - targetAngle))
      angleStarboard = Math.min(Math.abs((this.orientation + 5) - targetAngle), Math.abs((this.orientation - 1) - targetAngle))

      centerAngle = currentPosition.angle(new Offset(c.MAP_WIDTH / 2, c.MAP_HEIGHT / 2))
      anglePortCenter = Math.min(Math.abs((this.orientation + 1) - centerAngle), Math.abs((this.orientation - 5) - centerAngle))
      angleStarboardCenter = Math.min(Math.abs((this.orientation + 5) - centerAngle), Math.abs((this.orientation - 1) - centerAngle))

      let forwardPosition = currentPosition.neighbour(this.orientation)

      this.action = null

      if (anglePort <= angleStarboard) {
        this.action = c.PORT
      }

      if (angleStarboard < anglePort || angleStarboard == anglePort && angleStarboardCenter < anglePortCenter ||
          angleStarboard === anglePort && angleStarboardCenter === anglePortCenter && (this.orientation === 1 || this.orientation === 4)) {
        this.action = c.STARBOARD
      }

      if (forwardPosition.isInsideMap() && angleStraight <= anglePort && angleStraight <= angleStarboard) {
        this.action = c.FASTER
      }
      break
  }
}

Ship.prototype.faster = function () {
  this.action = c.FASTER
}

Ship.prototype.slower = function () {
  this.action = c.SLOWER
}

Ship.prototype.port = function () {
  this.action = c.PORT
}

Ship.prototype.starboard = function () {
  this.action = c.STARBOARD
}

Ship.prototype.placeMine = function () {
  if (c.MINES_ENABLED) {
    this.action = c.MINE
  }
}

Ship.prototype.stern = function () {
  return this.position.toCube().neighbour((this.orientation + 3) % 6).toOffset()
}

Ship.prototype.bow = function () {
  return this.position.toCube().neighbour(this.orientation).toOffset()
}

Ship.prototype.newStern = function () {
  return this.position.neighbour((this.newOrientation + 3) % 6)
}

Ship.prototype.newBow = function () {
  return this.position.neighbour(this.newOrientation)
}

Ship.prototype.isAt = function (coord) {
  const stern = this.stern()
  const bow = this.bow()
  return stern.isEqual(coord) || bow.isEqual(coord) || this.position.isEqual(coord)
}

Ship.prototype.newBowIntersect = function (other) {
  return this.newBowCoordinate &&
    (this.newBowCoordinate.isEqual(other.newBowCoordinate) ||
     this.newBowCoordinate.isEqual(other.newPosition) ||
     this.newBowCoordinate.isEqual(other.newSternCoordinate))
}

Ship.prototype.newBowIntersects = function (ships) {
  return Array.from(ships).reduce((acc, other) => {
    if (acc === true) return true
    return this !== other && this.newBowIntersect(other)
  }, false)
}

Ship.prototype.newPositionsIntersect = function (other) {
  const sternCollision = this.newSternCoordinate &&
    (this.newSternCoordinate.isEqual(other.newBowCoordinate) ||
     this.newSternCoordinate.isEqual(other.newPosition) ||
     this.newSternCoordinate.isEqual(other.newSternCoordinate))
  const centerCollision = this.newPosition &&
    (this.newPosition.isEqual(other.newBowCoordinate) ||
     this.newPosition.isEqual(other.newPosition) ||
     this.newPosition.isEqual(other.newSternCoordinate))
  return this.newBowIntersect(other) || sternCollision || centerCollision
}

Ship.prototype.newPositionsIntersects = function (ships) {
  return Array.from(ships).reduce((acc, other) => {
    if (acc === true) return true
    return this !== other && this.newPositionsIntersect(other)
  }, false)
}

Ship.prototype.damage = function (health) {
  this.health -= health
  if (this.health <= 0) this.health = 0
}

Ship.prototype.heal = function (health) {
  this.health += health
  if (this.health > c.MAX_SHIP_HEALTH) this.health = c.MAX_SHIP_HEALTH
}

Ship.prototype.fire = function (target) {
  if (c.CANNONS_ENABLED) {
    this.target = target
    this.action = c.FIRE
  }
}

module.exports = Ship
