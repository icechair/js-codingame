/**
 * Creates a pseudo-random value generator. The seed must be an integer.
 *
 * Uses an optimized version of the Park-Miller PRNG.
 * http://www.firstpr.com.au/dsp/rand31/
 */
function Random (seed) {
  this._seed = seed % 2147483647
  if (this._seed <= 0) this._seed += 2147483646
}

/**
 * Returns a pseudo-random value between 1 and 2^32 - 2.
 */
Random.prototype.next = function () {
  this._seed = this._seed * 16807 % 2147483647
  return this._seed
}


/**
 * Returns a pseudo-random floating point number in range [0, 1).
 */
Random.prototype.nextFloat = function () {
  // We know that result of next() will be 1 to 2147483646 (inclusive).
  return (this.next() - 1) / 2147483646
}

Random.prototype.nextInt = function (min, max) {
  return Math.floor(
    this.nextFloat() * (max - min + 1)
  ) + min
}

module.exports = Random
