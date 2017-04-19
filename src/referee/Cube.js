const Offset = require('./Offset')

function Cube (x, y, z) {
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

module.exports = Cube
