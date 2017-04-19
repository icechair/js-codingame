const test = require('tape')
const c = require('./constants')

const exec = regex => str => regex.exec(str)

test('move pattern', t => {
  const match = exec(c.PLAYER_INPUT_MOVE_PATTERN)
  let matches = match('MOVE 10 20')
  t.equal(matches[1], '10')
  t.equal(matches[2], '20')

  matches = match('MOVE hihi 123 10')
  t.false(matches)
  t.end()
})

test('slower pattern', t => {
  const match = exec(c.PLAYER_INPUT_SLOWER_PATTERN)

  let matches = match('slower test123')
  t.equal(matches[1], 'test123')

  matches = match('sLoWeR')
  t.ok(matches)
  t.end()
})

test('wait pattern', t => {
  const match = exec(c.PLAYER_INPUT_WAIT_ATTERN)
  let matches = match('wait')
  t.ok(matches)
  matches = match('?!')
  t.false(matches)
  t.end()
})

test('port pattern', t => {
  const match = exec(c.PLAYER_INPUT_PORT_PATTERN)
  let matches = match('port')
  t.ok(matches)
  t.end()
})

test('starboard pattern', t => {
  const match = exec(c.PLAYER_INPUT_STARBOARD_PATTERN)
  let matches = match('starboard')
  t.ok(matches)
  t.end()
})

test('fire pattern', t => {
  const match = exec(c.PLAYER_INPUT_FIRE_PATTERN)
  let matches = match('fire 10 20')
  t.ok(matches)
  t.equal(matches[1], '10')
  t.equal(matches[2], '20')
  matches = match('fire wololo')
  t.false(matches)
  t.end()
})
