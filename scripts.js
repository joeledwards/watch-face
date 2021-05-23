
const state = {}

const watchRadius = 250
const chromeWidth = 5
const numeralsWidth = 30

const colors = {
  background: '#000000',
  chrome: '#cccccc',
  evenTick: 'orange',
  hourHand: '#00cc00',
  oddTick: '#cccccc',
  secondHand: '#00cc00',
  text: '#cccccc',
}

function tickSecond (ts) {
  // Change hand rotation
  const second = ts.getSeconds() + (ts.getMilliseconds() / 1000.0)
  const degrees = second / 60.0 * 360.0
  if (state.secondHand) {
    state.secondHand.setAttribute('transform', `rotate(${degrees})`)
  }
}

function tickHour (ts) {
  // Change hand rotation
  const hour = ts.getHours() + ts.getMinutes() / 60.0
  const degrees = hour / 24.0 * 360.0
  if (state.hourHand) {
    state.hourHand.setAttribute('transform', `rotate(${degrees})`)
  }
}

function tick(smooth) {
  const ts = new Date()
  if (!smooth) {
    console.info(ts.toISOString())
  }

  // Setup next tick
  const delay = smooth ? 50 : 1000 - ts.getMilliseconds()
  setTimeout(() => tick(smooth), delay)

  tickSecond(ts)
  tickHour(ts)
}

function svg (container, name, attributes) {
  const child = document.createElementNS('http://www.w3.org/2000/svg', name)
  Object.entries(attributes).forEach(([key, value]) => {
    child.setAttribute(key, value)
  })
  container.appendChild(child)
  return child
}

function drawClock () {
  const viewPort = document.getElementById('viewport')
  console.info(viewPort);

  const clock = svg(viewport, 'svg', {
    id: 'clock',
    height: watchRadius * 2,
    width: watchRadius * 2,
  })

  console.info(clock)

  ;([
    [0, colors.chrome],
    [chromeWidth, colors.background],
    [numeralsWidth + chromeWidth, colors.chrome],
    [chromeWidth * 2 + numeralsWidth, colors.background],
  ]).forEach(([inset, fill]) => {
    const circle = svg(clock, 'circle', {
      cx: watchRadius,
      cy: watchRadius,
      r: watchRadius - inset,
      fill: fill,
    })
    console.info(circle)
  })

  addNumerals(clock)
  addTicks(clock)
  addHands(clock)

  viewPort.appendChild(clock)
}

function addTicks (clock) {
  for (let i = 0; i < 24; i++) {
    const degrees = i * 15
    //const height = (i % 6) ? 20 : 35
    const height = 20
    const fill = (i % 2) ? colors.oddTick : colors.evenTick

    // Add a number
    svg(clock, 'text', {
      x: 250,
      y: 27,
      'font-family': 'serif',
      'font-size': '20px',
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees - 1.5})`,
    }).textContent = ('0' + i).slice(-2)

    //text.appendChild(`${i}`)

    // Add a tick mark
    svg(clock, 'rect', {
      x: watchRadius,
      y: 40,
      height,
      width: 5,
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    })
  }
}

function addNumerals (clock) {
}

function addHands (clock) {
  state.hourHand = svg(clock, 'rect', {
    id: 'hour-hand',
    x: watchRadius,
    y: 95,
    height: 175,
    width: 5,
    fill: colors.hourHand,
    'transform-origin': 'center',
  })
  console.info(state.hourHand)

  state.secondHand = svg(clock, 'rect', {
    id: 'second-hand',
    x: watchRadius,
    y: 40,
    height: 20,
    width: 5,
    fill: colors.secondHand,
    'transform-origin': 'center',
  })
  console.info(state.secondHand)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");
  const smooth = true
  drawClock()
  tick(smooth)
});

