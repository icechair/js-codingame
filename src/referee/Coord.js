const c = require('./constants')

function Offset (x, y) {
  if (isNaN(x)) throw new Error('x is NaN')
  if (isNaN(y)) throw new Error('y is NaN')
  this.x = x
  this.y = y
}

Offset.prototype.angle = function (targetPosition) {
  const dy = (targetPosition.y - this.y) * Math.sqrt(3) / 2
  const dx = targetPosition.x - this.x + ((this.y - targetPosition.y) & 1) * 0.5
  let angle = -Math.atan2(dy, dx) * 3 / Math.PI
  if (angle < 0) {
    angle += 6
  } else if (angle >= 6) {
    angle -= 6
  }
  return angle
}

Offset.prototype.toCube = function () {
  const x = this.x - (this.y - (this.y & 1)) / 2
  const z = this.y
  const y = -x - z
  return new Cube(x, y, z)
}

Offset.prototype.add = function (b) {
  const x = this.x + b.x
  const y = this.x + b.y
  return new Offset(x, y)
}

Offset.prototype.neighbour = function (orientation) {
  return this.toCube().neighbour(orientation).toOffset()
}

Offset.prototype.isInsideMap = function () {
  const {x, y} = this
  return x >= 0 &&
    x < c.MAP_WIDTH &&
    y >= 0 &&
    y < c.MAP_HEIGHT
}

Offset.prototype.distanceTo = function (b) {
  return this.toCube().distanceTo(b.toCube())
}

Offset.prototype.isEqual = function (b) {
  if (b instanceof Offset) {
    return this.x === b.x && this.y === b.y
  }
  return false
}

Offset.prototype.toString = function () {
  return `Offset(${this.x}, ${this.y})`
}

function Cube (x, y, z) {
  if (isNaN(x)) throw new Error('x is NaN')
  if (isNaN(y)) throw new Error('y is NaN')
  if (isNaN(z)) throw new Error('z is NaN')
  this.x = x
  this.y = y
  this.z = z
}

Cube.prototype.toOffset = function () {
  const x = this.x + (this.z - (this.z & 1)) / 2
  const y = this.z
  return new Offset(x, y)
}

Cube.prototype.add = function (b) {
  const x = this.x + b.x
  const y = this.y + b.y
  const z = this.z + b.z
  return new Cube(x, y, z)
}

Cube.prototype.neighbour = function (orientation) {
  return this.add(DIRECTIONS[orientation])
}

Cube.prototype.distanceTo = function (b) {
  return Math.max(
    Math.abs(this.x - b.x),
    Math.abs(this.y - b.y),
    Math.abs(this.z - b.z)
  )
}

Cube.prototype.toString = function () {
  return `Cube(${this.x}, ${this.y}, ${this.z})`
}

const DIRECTIONS = [
  new Cube(1, -1, 0), new Cube(1, 0, -1), new Cube(0, 1, -1),
  new Cube(-1, 1, 0), new Cube(-1, 0, 1), new Cube(0, -1, 1)
]

module.exports = {Cube, Offset}
