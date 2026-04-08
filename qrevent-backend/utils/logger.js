
const info = (...params) => {
  console.log(...params)
}
const error = (...params) => {
  console.error(...params)
}
const warn = (...params) => {
  console.warn(...params)
}
module.exports = { info, error, warn }
