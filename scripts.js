
const state = {}

const smooth = true
const updateInterval = 50

const watchRadius = 250
const metaRadius = 50
const chromeWidth = 5
const numeralsWidth = 30

const colors = {
  background: '#000000',
  chrome: '#cccccc',
  evenTick: 'orange',
  hourHand: '#cccccc',
  meta: '#cccccc',
  oddTick: '#cccccc',
  secondHand: '#00cc00',
}

function tickSecond (ts) {
  const second = ts.getSeconds() + (ts.getMilliseconds() / 1000.0)
  const degrees = second / 60.0 * 360.0
  rotateSecond(ts, degrees)
}

function rotateSecond (ts, degrees) {
  state.secondHand.setAttribute('transform', `rotate(${degrees}, ${watchRadius}, ${watchRadius})`)
}

function tickHour (ts) {
  const hour = ts.getHours() + ts.getMinutes() / 60.0
  const degrees = hour / 24.0 * 360.0
  rotateHour(ts, degrees)
}

function rotateHour (ts, degrees) {
  state.hourHand.setAttribute('transform', `rotate(${degrees}, ${watchRadius}, ${watchRadius})`)
  state.meta.setAttribute('transform', `rotate(${degrees}, ${watchRadius}, ${watchRadius})`)
  state.metaText.setAttribute('transform', `rotate(${degrees}, ${watchRadius}, ${watchRadius}) rotate(${360-degrees}, ${watchRadius}, ${watchRadius+100})`)
}

function dateString (ts) {
  const year = `${ts.getFullYear()}`
  const month = `0${ts.getMonth() + 1}`.slice(-2)
  const day = `0${ts.getDate()}`.slice(-2)

  return `${year}-${month}-${day}`
}

function timeString (ts) {
  const hour = `0${ts.getHours()}`.slice(-2)
  const minute = `0${ts.getMinutes()}`.slice(-2)
  const second = `0${ts.getSeconds()}`.slice(-2)

  return `${hour}:${minute}:${second}`
}

function updateMeta (ts) {
  state.metaText.textContent = dateString(ts)
}

function tick(smooth) {
  const ts = new Date()
  if (!smooth) {
    console.info(ts.toISOString())
  }

  // Setup next tick
  const delay = smooth ? updateInterval : 1000 - ts.getMilliseconds()
  setTimeout(() => tick(smooth), delay)

  updateMeta(ts)
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

function addTicks (clock) {
  const subHourAdjust = 15 / 4

  for (let i = 0; i < 24; i++) {
    const degrees = i * 15
    const height = 20
    const fill = (i % 2) ? colors.oddTick : colors.evenTick

    // Add a number
    svg(clock, 'text', {
      x: watchRadius,
      y: 30,
      'text-anchor': 'middle',
      'font-family': 'serif',
      'font-size': '20px',
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    }).textContent = ('0' + i).slice(-2)

    //text.appendChild(`${i}`)

    // Add a tick mark
    svg(clock, 'polygon', {
      points: `${watchRadius - 5},42 ${watchRadius + 5},42 ${watchRadius + 2},60 ${watchRadius - 2},60`,
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    })

    // Add sub-hour ticks
    for (let i = 1; i <= 3; i++) {
      svg(clock, 'polygon', {
        points: `${watchRadius - 1},55 ${watchRadius + 1},55 ${watchRadius + 1},60, ${watchRadius - 1},60`,
        fill,
        'transform-origin': 'center',
        transform: `rotate(${subHourAdjust * i + degrees})`,
      })
    }
  }
}

function addNumerals (clock) {
}

function addHands (clock) {
  state.hourHand = svg(clock, 'polygon', {
    id: 'hour-hand',
    points: `${watchRadius - .5},65, ${watchRadius + .5},65 ${watchRadius + 10},270, ${watchRadius - 10},270`,
    fill: colors.hourHand,
  })
  svg(clock, 'circle', {
    id: 'hour-axis',
    cx: watchRadius,
    cy: watchRadius,
    r: 5,
    fill: colors.background,
  })
  console.info(state.hourHand)

  state.secondHand = svg(clock, 'polygon', {
    id: 'second-hand',
    points: `${watchRadius - 10},5, ${watchRadius + 10},5 ${watchRadius},15 ${watchRadius},15`,
    fill: colors.secondHand,
  })
  console.info(state.secondHand)
}

function addMeta (clock) {
  state.meta = svg(clock, 'circle', {
    id: 'metadata',
    cx: watchRadius,
    cy: watchRadius + 100,
    r: metaRadius,
    'stroke-width': 2,
    stroke: colors.hourHand,
    overflow: 'visible',
  })
  console.info(state.meta)

  state.metaText = svg(clock, 'text', {
    id: 'meta-text',
    x: watchRadius,
    y: watchRadius + 105,
    fill: colors.meta,
    'text-anchor': 'middle',
    'font-family': 'serif',
    'font-size': '16px',
    overflow: 'visible'
  })
  console.info(state.metaText)
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
  addMeta(clock)

  viewPort.appendChild(clock)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");
  drawClock()
  tick(smooth)
});

