function Damage (position, health, hit) {
  this.position = position
  this.health = health
  this.hit = hit
}
Damage.prototype.toString = function () {
  return `Damage(${this.position}, ${this.health}, ${this.hit})`
}

module.exports = Damage
