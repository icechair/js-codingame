function Player (id) {
  this.id = id
  this.ships = new Set()
  this.shipsAlive = new Set()
}

Player.prototype.die = function () {
  for (let ship of this.ships) {
    ship.health = 0
  }
}

Player.prototype.getScore = function () {
  return Array.from(this.ships).reduce((acc, ship) => {
    acc += ship.health
    return acc
  }, 0)
}

Player.prototype.toString = function () {
  return `Player ${this.id}:
  ${Array.from(this.ships).join('\n  ')}`
}

module.exports = Player
