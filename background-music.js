import { getAudioContext, playNoise, playTone } from './sound-engine.js'

// 복도 창문이 두드려지는 주기(밀리초)입니다. main.js의 흔들림과 같은 박자로 쿵쿵 소리를 냅니다.
export const KNOCK_PERIOD_MS = 500
const TICK_PERIOD_MS = 1000
const SCHEDULE_INTERVAL_MS = 100
const SCHEDULE_AHEAD_MS = 250

// 'off': 소리 없음, 'classroom': 긴장되는 울림 + 시계 똑딱, 'urgent': 쿵쿵 울림 + 긴박한 배경음
let currentMode = 'off'
let drone = null
let schedulerId = null
// 다음 박자가 울릴 시각(performance.now 기준, 밀리초)
let nextBeatAt = 0

// 배경음을 바꿉니다. 같은 모드를 다시 요청하면 아무 일도 하지 않습니다.
export function setMusicMode(mode) {
  if (mode === currentMode) return
  stopMusic()
  currentMode = mode
  if (mode === 'off') return

  const ctx = getAudioContext()
  startDrone(ctx, mode)
  const now = performance.now()
  nextBeatAt = mode === 'urgent' ? Math.ceil(now / KNOCK_PERIOD_MS) * KNOCK_PERIOD_MS : now
  schedulerId = setInterval(scheduleBeats, SCHEDULE_INTERVAL_MS)
  scheduleBeats()
}

// 낮게 깔리는 울림입니다. 긴박한 모드에서는 더 높고 크게 울립니다.
function startDrone(ctx, mode) {
  const isUrgent = mode === 'urgent'
  const oscillator = ctx.createOscillator()
  const filter = ctx.createBiquadFilter()
  const gain = ctx.createGain()
  oscillator.type = 'sawtooth'
  oscillator.frequency.value = isUrgent ? 62 : 55
  filter.type = 'lowpass'
  filter.frequency.value = isUrgent ? 260 : 200
  gain.gain.value = isUrgent ? 0.06 : 0.04
  oscillator.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  drone = { oscillator, gain }
}

function stopMusic() {
  clearInterval(schedulerId)
  schedulerId = null
  if (!drone) return
  const ctx = getAudioContext()
  drone.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
  drone.oscillator.stop(ctx.currentTime + 0.5)
  drone = null
}

// 다가올 박자를 미리 예약합니다. 타이머가 조금 늦어도 박자가 어긋나지 않게 합니다.
function scheduleBeats() {
  const now = performance.now()
  const horizon = now + SCHEDULE_AHEAD_MS
  const period = currentMode === 'urgent' ? KNOCK_PERIOD_MS : TICK_PERIOD_MS
  while (nextBeatAt < horizon) {
    const delay = Math.max(0, (nextBeatAt - now) / 1000)
    if (currentMode === 'urgent') {
      playHeartbeat(delay)
    } else {
      playClockTick(delay)
    }
    nextBeatAt += period
  }
}

// 쿵쿵 두 번 울리는 심장 박동 같은 소리입니다.
function playHeartbeat(delay) {
  playTone({ type: 'sine', freq: 110, endFreq: 40, delay, duration: 0.18, volume: 0.35 })
  playTone({ type: 'sine', freq: 110, endFreq: 40, delay: delay + 0.2, duration: 0.14, volume: 0.2 })
}

// 시계가 똑딱이는 짧은 소리입니다.
function playClockTick(delay) {
  playNoise({ delay, duration: 0.02, volume: 0.15, filterType: 'highpass', freq: 4000 })
}
