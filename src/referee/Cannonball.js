const Entity = require('./Entity')

function Cannonball (row, col, ownerId, srcX, srcY, remainingTurns) {
  Entity.call(this, row, col)
  this.ownerId = ownerId
  this.srcX = srcX
  this.srcY = srcY
  this.initialRemainingTurns = remainingTurns
  this.remainingTurns = remainingTurns
}
Cannonball.prototype = Object.create(Entity.prototype)
Cannonball.prototype.constructor = Cannonball

Cannonball.prototype.toString = function () {
  return `${this.type}(${this.id}, ${this.position}, ${this.srcX}, ${this.srcY}, ${this.initialRemainingTurns}, ${this.remainingTurns}, ${this.ownerId})`
}

Cannonball.prototype.toPlayerString = function () {
  return Entity.prototype.toPlayerString.call(this, this.ownerId, this.remainingTurns, 0, 0)
}

module.exports = Cannonball
