function tick () {
  //const delay = 50

  const ts = new Date()
  console.info(ts.toISOString())

  // Setup next tick
  const delay = 1000 - ts.getMilliseconds()
  setTimeout(tick, delay)

  // Change hand rotation
  const second = ts.getSeconds()
  const hourHand = document.getElementById('hour-hand')
  const degrees = 6 * second
  hourHand.setAttribute('transform', `rotate(${degrees})`)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");
  tick()
});
