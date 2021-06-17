const config = {
  // Place noon (rather than midnight) at the top of the clock face
  noonOnTop: false,

  // Rotate numerals (oriented with the top of the watch face)
  rotateNumerals: true,

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

function tickSecond (state, ts) {
  // Compute how many degrees to rotate the second hand
  const seconds = second(ts) + (millis(ts) / 1000.0)
  const degrees = degree(seconds / 60.0 * 360.0)

  // Apply the transformation
  if (config.swapSecondAndHour) {
    rotateHour(state, ts, degrees)
  } else {
    rotateSecond(state, ts, degrees)
  }
}

function rotateSecond (state, ts, degrees) {
  // Translate the second "hand" (green arrow on the perimeter)
  state.secondHand.setAttribute('transform', `rotate(${degrees}, ${state.clockRadius}, ${state.clockRadius})`)
}

function tickHour (state, ts) {
  // Compute how many degrees to rotate the second hand
  const hours = hour(ts) + minute(ts) / 60.0
  const degrees = degree(hours / 24.0 * 360.0)

  // Apply the transformation
  if (config.swapSecondAndHour) {
    rotateSecond(state, ts, degrees)
  } else {
    rotateHour(state, ts, degrees)
  }
}

function rotateHour (state, ts, degrees) {
  // Translate the hour hand and associated content (date and its container)
  state.hourHand.setAttribute('transform', `rotate(${degrees}, ${state.clockRadius}, ${state.clockRadius})`)
  state.meta.setAttribute('transform', `rotate(${degrees}, ${state.clockRadius}, ${state.clockRadius})`)
  state.metaText.setAttribute('transform', `rotate(${degrees}, ${state.clockRadius}, ${state.clockRadius}) rotate(${360-degrees}, ${state.clockRadius}, ${state.clockRadius+state.metaOffset})`)
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

function tickDate (state, ts) {
  // Update the date
  state.metaText.textContent = dateString(ts)
}

function now () {
  return new Date()
}

function utc () {
  const t = now()
  return new Date(
    t.getUTCFullYear(),
    t.getUTCMonth(),
    t.getUTCDate(),
    t.getUTCHours(),
    t.getUTCMinutes(),
    t.getUTCSeconds(),
    t.getUTCMilliseconds()
  )
}

function tick(state, local) {
  const ts = local ? now() : utc()

  if (!config.smooth) {
    console.info(ts.toISOString())
  }

  // Schedule the next tick
  const delay = config.smooth ? config.updateInterval : 1000 - millis(ts)
  setTimeout(() => tick(state, local), delay)

  tickDate(state, ts)
  tickSecond(state, ts)
  tickHour(state, ts)
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
function addTicks (state, id, clock) {
  const subHourAdjust = 15 / 4

  for (let i = 0; i < 24; i++) {
    const degrees = degree(i * 15)
    const fill = (i % 2) ? colors.oddTick : colors.evenTick

    const numeralCorrection = config.rotateNumerals ? `rotate(${360 - degrees}, ${state.clockRadius}, ${state.numeralHeightAdjust})` : ''

    // Add an hour number
    svg(clock, 'text', {
      x: state.clockRadius,
      y: state.numeralOffset,
      'text-anchor': 'middle',
      'font-family': 'serif',
      'font-size': `${state.numeralFontSize}px`,
      fill,
      transform: `rotate(${degrees}, ${state.clockRadius}, ${state.clockRadius}) ${numeralCorrection}`,
    }).textContent = ('0' + i).slice(-2)

    // Add an hour tick mark
    const tickAdjustTop = state.tickWidthTop / 2
    const tickAdjustBottom = state.tickWidthBottom / 2
    const tickTopLeft = [state.clockRadius - tickAdjustTop, state.tickTop].join(',')
    const tickTopRight = [state.clockRadius + tickAdjustTop, state.tickTop].join(',')
    const tickBottomRight = [state.clockRadius + tickAdjustBottom, state.tickBottom].join(',')
    const tickBottomLeft = [state.clockRadius - tickAdjustBottom, state.tickBottom].join(',')
    svg(clock, 'polygon', {
      points: `${tickTopLeft} ${tickTopRight} ${tickBottomRight} ${tickBottomLeft}`,
      fill,
      'transform-origin': 'center',
      transform: `rotate(${degrees})`,
    })

    // Add sub-hour ticks (15-minute increments)
    const subTickAdjust = state.subTickWidth / 2
    const subTickTopLeft = [state.clockRadius - subTickAdjust, state.subTickTop].join(',')
    const subTickTopRight = [state.clockRadius + subTickAdjust, state.subTickTop].join(',')
    const subTickBottomRight = [state.clockRadius + subTickAdjust, state.subTickBottom].join(',')
    const subTickBottomLeft = [state.clockRadius - subTickAdjust, state.subTickBottom].join(',')
    for (let i = 1; i <= 3; i++) {
      svg(clock, 'polygon', {
        points: `${subTickTopLeft} ${subTickTopRight} ${subTickBottomRight} ${subTickBottomLeft}`,
        fill,
        'transform-origin': 'center',
        transform: `rotate(${subHourAdjust * i + degrees})`,
      })
    }
  }
}

function addHands (state, id, clock) {
  // Add the hour-hand (long, inner needle)
  const hrTipLeft = [ state.clockRadius - (state.hourHandTipWidth / 2), state.hourHandEnd ].join(',')
  const hrTipRight = [ state.clockRadius + (state.hourHandTipWidth / 2), state.hourHandEnd ].join(',')
  const hrBaseRight = [ state.clockRadius + (state.hourHandBaseWidth / 2), state.hourHandStart ].join(',')
  const hrBaseLeft = [ state.clockRadius - (state.hourHandBaseWidth / 2), state.hourHandStart ].join(',')
  state.hourHand = svg(clock, 'polygon', {
    id: `${id}-hour-hand`,
    points: `${hrTipLeft} ${hrTipRight} ${hrBaseRight} ${hrBaseLeft}`,
    fill: colors.hourHand,
  })
  svg(clock, 'circle', {
    id: `${id}-hour-axis`,
    cx: state.clockRadius,
    cy: state.clockRadius,
    r: state.hourHandAxisRadius,
    fill: colors.background,
  })
  console.info(state.hourHand)

  // Add the second-hand (outer-sweeping triangle)
  const srBaseLeft = [ state.clockRadius - (state.secondHandBaseWidth / 2), state.secondHandStart ].join(',')
  const srBaseRight = [ state.clockRadius + (state.secondHandBaseWidth / 2), state.secondHandStart ].join(',')
  const srTipRight = [ state.clockRadius + (state.secondHandTipWidth / 2), state.secondHandEnd ].join(',')
  const srTipLeft = [ state.clockRadius - (state.secondHandTipWidth / 2), state.secondHandEnd ].join(',')
  state.secondHand = svg(clock, 'polygon', {
    id: `${id}-second-hand`,
    points: `${srBaseLeft} ${srBaseRight} ${srTipRight} ${srTipLeft}`,
    fill: colors.secondHand,
  })
  console.info(state.secondHand)
}

// Add the metadata region, which houses the date by default
function addMeta (state, id, clock) {
  // The circle surrounding the date
  state.meta = svg(clock, 'circle', {
    id: `${id}-metadata`,
    cx: state.clockRadius,
    cy: state.clockRadius + state.metaOffset,
    r: state.metaRadius,
    'stroke-width': state.metaStrokeWidth,
    stroke: colors.hourHand,
    overflow: 'visible',
  })
  console.info(state.meta)

  // The metadata text field (contains the date by default)
  state.metaText = svg(clock, 'text', {
    id: `${id}-meta-text`,
    x: state.clockRadius,
    y: state.clockRadius + state.metaTextOffset,
    fill: colors.meta,
    'text-anchor': 'middle',
    'font-family': 'serif',
    'font-size': `${state.metaFontSize}px`,
    overflow: 'visible'
  })
  console.info(state.metaText)
}

// Draw the clock
function drawClock (state, id) {
  // TODO: figure out how to reduce the size

  const viewPort = document.getElementById(id)
  console.info(viewPort);

  const clock = svg(viewport, 'svg', {
    id: `${id}-clock`,
    height: state.clockRadius * 2,
    width: state.clockRadius * 2,
  })

  console.info(clock)

  ;([
    [0, colors.chrome],
    [state.chromeWidth, colors.background],
    [state.numeralWidth + state.chromeWidth, colors.chrome],
    [state.chromeWidth * 2 + state.numeralWidth, colors.background],
  ]).forEach(([inset, fill]) => {
    const circle = svg(clock, 'circle', {
      cx: state.clockRadius,
      cy: state.clockRadius,
      r: state.clockRadius - inset,
      fill: fill,
    })
    console.info(circle)
  })

  addHands(state, id, clock)
  addTicks(state, id, clock)
  addMeta(state, id, clock)

  // Add the clock to the viewport
  viewPort.appendChild(clock)
}

function baseState ({ sizeFactor = 1.0 }) {
  const size = dimension => sizeFactor * dimension

  // Dimension configuration
  return {
    // Clock dimensions
    clockRadius: size(250),
    chromeWidth: size(5),

    numeralWidth: size(30),
    numeralOffset: size(30),
    numeralFontSize: size(20),
    numeralHeightAdjust: size(23),

    // Second Hand
    /*
    secondHandBaseWidth: size(20),
    secondHandTipWidth: size(15),
    secondHandStart: size(5),
    secondHandEnd: size(12),
    */
    secondHandBaseWidth: size(15),
    secondHandTipWidth: size(10),
    secondHandStart: size(5),
    secondHandEnd: size(10),

    // Hour Hand
    hourHandBaseWidth: size(20),
    hourHandTipWidth: size(2),
    hourHandAxisRadius: size(5),
    hourHandStart: size(270),
    hourHandEnd: size(65),

    // Hour Ticks
    tickTop: size(42),
    tickBottom: size(60),
    tickWidthTop: size(10),
    tickWidthBottom: size(4),

    // Sub-hour Ticks
    subTickTop: size(55),
    subTickBottom: size(60),
    subTickWidth: size(2),

    // Meta Dimensions
    metaRadius: size(60),
    metaOffset: size(100),
    metaStrokeWidth: size(2),
    metaTextOffset: size(105),
    metaFontSize: size(20),
  }
}

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM Loaded.");

  // Store references to the SVG elements we will be transforming
  const state = {
    local: baseState({ sizeFactor: 1.5 }),
    utc: baseState({ sizeFactor: 1.0 }),
  }

  drawClock(state.local, 'local')
  drawClock(state.utc, 'utc')

  tick(state.local, true)
  tick(state.utc, false)
});

