debugger
const referee = require('./referee')
console.log(referee.getFrameDataForView())
referee.handlePlayerOutput(0, 0, 0, ['FASTER'])
referee.handlePlayerOutput(0, 0, 1, ['FASTER'])
referee.updateGame()
console.log(referee.getFrameDataForView())
referee.updateGame()
