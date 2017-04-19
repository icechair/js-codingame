const c = require('./constants')
const Entity = require('./Entity')
const Damage = require('./Damage')
function Mine (x, y) {
  Entity.call(this, c.MINE, x, y)
}
Mine.prototype = Object.create(Entity.prototype)
Mine.prototype.constructor = Mine

Mine.prototype.toPlayerString = function () {
  return Entity.prototype.toPlayerString.call(this, 0, 0, 0, 0)
}

Mine.prototype.explode = function (ships, force) {
  const damage = []
  let victim
  ships.forEach(ship => {
    if (this.position.isEqual(ship.bow()) || this.position.isEqual(ship.stern()) || this.position.isEqual(ship.position)) {
      damage.push(new Damage(this.position, c.MINE_DAMAGE, true))
      ship.damage(c.MINE_DAMAGE)
      victim = ship
    }
  })

  if (force || victim) {
    if (!victim) {
      damage.push(new Damage(this.position, c.MINE_DAMAGE, true))
    }

    ships.forEach(ship => {
      if (ship !== victim) {
        let impactPosition
        if (ship.stern().distanceTo(this.position) <= 1) impactPosition = ship.stern()
        if (ship.bow().distanceTo(this.position) <= 1) impactPosition = ship.bow()
        if (ship.position.distanceTo(this.position) <= 1) impactPosition = ship.position

        if (impactPosition) {
          ship.damage(c.NEAR_MINE_DAMAGE)
          damage.push(new Damage(impactPosition, c.NEAR_MINE_DAMAGE, true))
        }
      }
    })
  }
  return damage
}

module.exports = Mine
