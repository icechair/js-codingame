const h = require('./helper')
const Offset = require('./Coord').Offset

let UNIQUE_ENTITY_ID = 0

function Entity (type, x, y) {
  if (isNaN(x)) throw new Error('x is NaN')
  if (isNaN(y)) throw new Error('y is NaN')
  this.id = UNIQUE_ENTITY_ID++
  this.type = type
  this.position = new Offset(x, y)
}

Entity.prototype.toString = function () {
  return `${this.type}(${this.id}, ${this.position})`
}

Entity.prototype.toPlayerString = function (arg1, arg2, arg3, arg4) {
  return h.join(this.id, this.type, this.position.x, this.position.y, arg1, arg2, arg3, arg4)
}

module.exports = Entity
