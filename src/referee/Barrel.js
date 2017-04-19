const c = require('./constants')
const Entity = require('./Entity')

function Barrel (x, y, health) {
  Entity.call(this, c.BARREL, x, y)
  this.health = health
}
Barrel.prototype = Object.create(Entity.prototype)
Barrel.prototype.constructor = Barrel

Barrel.prototype.toString = function () {
  return `${this.type}(${this.id}, ${this.position}, ${this.health})`
}

Barrel.prototype.toPlayerString = function () {
  return Entity.prototype.toPlayerString.call(this, this.health, 0, 0, 0)
}

module.exports = Barrel
