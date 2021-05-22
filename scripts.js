function tickSecond (ts) {
  // Change hand rotation
  const second = ts.getSeconds() + (ts.getMilliseconds() / 1000.0)
  const degrees = second / 60.0 * 360.0
  const hourHand = document.getElementById('second-hand')
  hourHand.setAttribute('transform', `rotate(${degrees})`)
}

function tickHour (ts) {
  // Change hand rotation
  const hour = ts.getHours() + ts.getMinutes() / 60.0
  const degrees = hour / 24.0 * 360.0
  const hourHand = document.getElementById('hour-hand')
  hourHand.setAttribute('transform', `rotate(${degrees})`)
}

function tick(smooth) {
  const ts = new Date()
  //console.info(ts.toISOString())

  // Setup next tick
  const delay = smooth ? 50 : 1000 - ts.getMilliseconds()
  setTimeout(() => tick(smooth), delay)

  tickSecond(ts)
  tickHour(ts)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");
  const smooth = true
  tick(smooth)
});

