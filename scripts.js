const config = {
  // Place noon (rather than midnight) at the top of the clock face
  noonOnTop: false,

  // Update continuously rather than once per second
  smooth: true,

  // Swap the second and hour hands
  swapSecondAndHour: false,

  // The update frequency (20x per second looks pretty smooth)
  updateInterval: 50,

  // Show time in UTC instead of local time
  utc: false,
}

// Configure clock colors
const colors = {
  background: '#000000',
  chrome: '#cccccc',
  evenTick: 'orange',
  hourHand: '#cccccc',
  meta: '#cccccc',
  oddTick: '#cccccc',
  secondHand: '#00cc00',
}


// Store references to the SVG elements we will be transforming
const state = {}

const clockRadius = 250
const metaRadius = 50
const chromeWidth = 5
const numeralsWidth = 30

function millis (ts) { return ts.getMilliseconds() }
function second (ts) { return config.utc ? ts.getUTCSeconds() : ts.getSeconds() }
function minute (ts) { return config.utc ? ts.getUTCMinutes() : ts.getMinutes() }
function hour (ts) { return config.utc ? ts.getUTCHours() : ts.getHours() }
function day (ts) { return config.utc ? ts.getUTCDate() : ts.getDate() }
function month (ts) { return (config.utc ? ts.getUTCMonth() : ts.getMonth()) + 1 }
function year (ts) { return config.utc ? ts.getUTCFullYear() : ts.getFullYear() }

function degree (degrees) {
  if (config.noonOnTop) {
    if (degrees > 180) {
      return degrees + 180
    } else {
      return degrees - 180
    }
  } else {
    return degrees
  }
}

function tickSecond (ts) {
  // Compute how many degrees to rotate the second hand
  const seconds = second(ts) + (millis(ts) / 1000.0)
  const degrees = degree(seconds / 60.0 * 360.0)

  // Apply the transformation
  if (config.swapSecondAndHour) {
    rotateHour(ts, degrees)
  } else {
    rotateSecond(ts, degrees)
  }
}

function rotateSecond (ts, degrees) {
  // Translate the second "hand" (green arrow on the perimeter)
  state.secondHand.setAttribute('transform', `rotate(${degrees}, ${clockRadius}, ${clockRadius})`)
}

function tickHour (ts) {
  // Compute how many degrees to rotate the second hand
  const hours = hour(ts) + minute(ts) / 60.0
  const degrees = degree(hours / 24.0 * 360.0)

  // Apply the transformation
  if (config.swapSecondAndHour) {
    rotateSecond(ts, degrees)
  } else {
    rotateHour(ts, degrees)
  }
}

function rotateHour (ts, degrees) {
  // Translate the hour hand and associated content (date and its container)
  state.hourHand.setAttribute('transform', `rotate(${degrees}, ${clockRadius}, ${clockRadius})`)
  state.meta.setAttribute('transform', `rotate(${degrees}, ${clockRadius}, ${clockRadius})`)
  state.metaText.setAttribute('transform', `rotate(${degrees}, ${clockRadius}, ${clockRadius}) rotate(${360-degrees}, ${clockRadius}, ${clockRadius+100})`)
}

function dateString (ts) {
  // Build a date string of the form `YYYY-MM-DD`
  const yearStr = `${year(ts)}`
  const monthStr = `0${month(ts)}`.slice(-2)
  const dayStr = `0${day(ts)}`.slice(-2)

  return `${yearStr}-${monthStr}-${dayStr}`
}

function timeString (ts) {
  // Build a time string of the form `HH:MM:SS`
  const hourStr = `0${hour(ts)}`.slice(-2)
  const minuteStr = `0${minute(ts)}`.slice(-2)
  const secondStr = `0${second(ts)}`.slice(-2)

  return `${hourStr}:${minuteStr}:${secondStr}`
}

function tickDate (ts) {
  // Update the date
  state.metaText.textContent = dateString(ts)
}

function tick(smooth) {
  const ts = new Date()
  if (!smooth) {
    console.info(ts.toISOString())
  }

  // Schedule the next tick
  const delay = smooth ? config.updateInterval : 1000 - millis(ts)
  setTimeout(() => tick(smooth), delay)

  tickDate(ts)
  tickSecond(ts)
  tickHour(ts)
}

// Creates a new SVG element on the DOM, and appends it to the supplied SVG
function svg (container, name, attributes) {
  const child = document.createElementNS('http://www.w3.org/2000/svg', name)
  Object.entries(attributes).forEach(([key, value]) => {
    child.setAttribute(key, value)
  })
  container.appendChild(child)
  return child
}

// Add all of the tick marks to the clock face
function addTicks (clock) {
  const subHourAdjust = 15 / 4

  for (let i = 0; i < 24; i++) {
    const degrees = degree(i * 15)
    const height = 20
    const fill = (i % 2) ? colors.oddTick : colors.evenTick

    // Add an hour number
    svg(clock, 'text', {
      x: clockRadius,
      y: 30,
      'text-anchor': 'middle',
      'font-family': 'serif',
      'font-size': '20px',
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    }).textContent = ('0' + i).slice(-2)

    // Add an hour tick mark
    svg(clock, 'polygon', {
      points: `${clockRadius - 5},42 ${clockRadius + 5},42 ${clockRadius + 2},60 ${clockRadius - 2},60`,
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    })

    // Add sub-hour ticks (15-minute increments)
    for (let i = 1; i <= 3; i++) {
      svg(clock, 'polygon', {
        points: `${clockRadius - 1},55 ${clockRadius + 1},55 ${clockRadius + 1},60, ${clockRadius - 1},60`,
        fill,
        'transform-origin': 'center',
        transform: `rotate(${subHourAdjust * i + degrees})`,
      })
    }
  }
}

function addHands (clock) {
  // Add the hour-hand (long, inner needle)
  state.hourHand = svg(clock, 'polygon', {
    id: 'hour-hand',
    points: `${clockRadius - .5},65, ${clockRadius + .5},65 ${clockRadius + 10},270, ${clockRadius - 10},270`,
    fill: colors.hourHand,
  })
  svg(clock, 'circle', {
    id: 'hour-axis',
    cx: clockRadius,
    cy: clockRadius,
    r: 5,
    fill: colors.background,
  })
  console.info(state.hourHand)

  // Add the second-hand (outer-sweeping triangle)
  state.secondHand = svg(clock, 'polygon', {
    id: 'second-hand',
    points: `${clockRadius - 10},5, ${clockRadius + 10},5 ${clockRadius},15 ${clockRadius},15`,
    fill: colors.secondHand,
  })
  console.info(state.secondHand)
}

// Add the metadata region, which houses the date by default
function addMeta (clock) {
  // The circle surrounding the date
  state.meta = svg(clock, 'circle', {
    id: 'metadata',
    cx: clockRadius,
    cy: clockRadius + 100,
    r: metaRadius,
    'stroke-width': 2,
    stroke: colors.hourHand,
    overflow: 'visible',
  })
  console.info(state.meta)

  // The metadata text field (contains the date by default)
  state.metaText = svg(clock, 'text', {
    id: 'meta-text',
    x: clockRadius,
    y: clockRadius + 105,
    fill: colors.meta,
    'text-anchor': 'middle',
    'font-family': 'serif',
    'font-size': '16px',
    overflow: 'visible'
  })
  console.info(state.metaText)
}

// Draw the clock
function drawClock () {
  const viewPort = document.getElementById('viewport')
  console.info(viewPort);

  const clock = svg(viewport, 'svg', {
    id: 'clock',
    height: clockRadius * 2,
    width: clockRadius * 2,
  })

  console.info(clock)

  ;([
    [0, colors.chrome],
    [chromeWidth, colors.background],
    [numeralsWidth + chromeWidth, colors.chrome],
    [chromeWidth * 2 + numeralsWidth, colors.background],
  ]).forEach(([inset, fill]) => {
    const circle = svg(clock, 'circle', {
      cx: clockRadius,
      cy: clockRadius,
      r: clockRadius - inset,
      fill: fill,
    })
    console.info(circle)
  })

  addTicks(clock)
  addHands(clock)
  addMeta(clock)

  // Add the clock to the viewport
  viewPort.appendChild(clock)
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");
  drawClock()
  tick(config.smooth)
});

