function Hex (q, r) {
  this.q = +q
  this.r = +r
}
Hex.prototype.toString = function () {
  return `H(${this.q}, ${this.r})`
}

function Cube (x, y, z) {
  this.x = +x
  this.y = +y
  this.z = +z
}
Cube.prototype.toString = function () {
  return `C(${this.x}, ${this.y}, ${this.z})`
}

function Offset (col, row) {
  this.col = +col
  this.row = +row
}
Offset.prototype.toString = function () {
  return `O(${this.col}, ${this.row})`
}

Cube.prototype.toOffset = function () {
  return new Offset(
    this.x + (this.z - (this.z & 1)) / 2,
    this.z
  )
}

Cube.prototype.toHex = function () {
  return new Hex(this.x, this.z)
}

Hex.prototype.toCube = function () {
  const x = this.q
  const z = this.r
  const y = -x - z
  return new Cube(x, y, z)
}

Offset.prototype.toCube = function () {
  const x = this.col - (this.row - (this.row & 1)) / 2
  const z = this.row
  const y = -x - z
  return new Cube(x, y, z)
}

Cube.prototype.add = function (cube) {
  if (cube instanceof Cube) {
    return new Cube(
      this.x + cube.x,
      this.y + cube.y,
      this.z + cube.z
    )
  }
  throw new Error(`Cube: cannot add, cube expected`)
}

Hex.prototype.add = function (hex) {
  if (hex instanceof Hex) {
    return new Hex(
      this.q + hex.q,
      this.r + hex.r
    )
  }
  throw new Error(`Hex: cannot add, hex expected`)
}

Cube.Directions = [
  new Cube(1, -1, 0), new Cube(1, 0, -1), new Cube(0, 1, -1),
  new Cube(-1, 1, 0), new Cube(-1, 0, 1), new Cube(0, -1, 1)
]

Cube.prototype.neighbour = function (direction) {
  return this.add(Cube.Directions[direction])
}

Hex.Directions = [
  new Hex(1, 0), new Hex(1, -1), new Hex(0, -1),
  new Hex(-1, 0), new Hex(-1, 1), new Hex(0, 1)
]

Hex.prototype.neighbour = function (direction) {
  return this.add(Hex.Directions[direction])
}

Cube.prototype.distance = function (cube) {
  if (cube instanceof Cube) {
    return Math.max(
      Math.abs(this.x - cube.x),
      Math.abs(this.y - cube.y),
      Math.abs(this.z - cube.z)
    )
  }
  throw new Error('Cube: cannot calc distance, Cube expected')
}

Cube.prototype.round = function () {
  let rx = Math.round(this.x)
  let ry = Math.round(this.y)
  let rz = Math.round(this.z)
  let xd = Math.abs(rx - this.x)
  let yd = Math.abs(ry - this.y)
  let zd = Math.abs(rz - this.z)

  if (xd > yd && xd > zd) {
    rx = -ry - rz
  } else if (yd > zd) {
    ry = -rx - rz
  } else {
    rz = -rx - ry
  }
  return new Cube(rx, ry, rz)
}

const lerp = (a, b, t) => {
  return a + (b - a) * t
}

Cube.prototype.lerp = function (b, t) {
  const a = this
  return new Cube(
    lerp(+a.x, +b.x, +t),
    lerp(+a.y, +b.y, +t),
    lerp(+a.z, +b.z, +t)
  ).round()
}

Cube.prototype.line = function (b) {
  const N = this.distance(b)
  const line = []
  for (let i = 0; i <= N; ++i) {
    line.push(this.lerp(b, 1.0 / N * i))
  }
  return line
}

Cube.prototype.isEqual = function (b) {
  const {x, y, z} = this
  return x == b.x && y == b.y && z == b.z
}

Cube.prototype.directionTo = function (b) {
  const line = this.line(b)
  if (line.length <= 1) return -1
  const next = line[1]
  for (let i = 0; i < Cube.Directions.length; ++i) {
    const n = this.neighbour(i)
    if (n.isEqual(next)) return i
  }
  return -1
}

Cube.prototype.inRange = function (N) {
  const results = []
  for (let dx = -N; dx <= N; ++dx) {
    for (let dy = Math.max(-N, -dx - N); dy <= Math.min(N, -dx + N); ++dy) {
      const dz = -dx - dy
      results.push(this.add(new Cube(dx, dy, dz)))
    }
  }
  return results
}

const rand = (min, max) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min)) + min
}
module.exports = {
  Hex,
  Cube,
  Offset,
  rand
}
