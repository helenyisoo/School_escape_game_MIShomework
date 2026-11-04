// 소리를 만드는 공통 도구 모음입니다. 음원 파일 없이 브라우저가 소리를 직접 만듭니다.

let audioContext = null
let noiseBuffer = null

// 소리 장치(AudioContext)를 한 번만 만들어 돌려줍니다.
export function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    audioContext = new AudioContextClass()
  }
  return audioContext
}

// 브라우저는 사용자가 화면을 누른 뒤에만 소리를 내도록 허용합니다. 첫 클릭 때 소리 장치를 깨웁니다.
export function unlockAudio() {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

// 흰 잡음(바람, 종이, 긁는 소리의 재료)을 담은 1초짜리 소리 덩어리입니다.
function getNoiseBuffer(ctx) {
  if (!noiseBuffer) {
    noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = noiseBuffer.getChannelData(0)
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1
    }
  }
  return noiseBuffer
}

// 음높이가 시작 값에서 끝 값으로 변하는 짧은 음을 냅니다.
// delay: 지금부터 몇 초 뒤에 울릴지, duration: 길이(초), volume: 크기
export function playTone({ type = 'sine', freq, endFreq = freq, delay = 0, duration, volume }) {
  const ctx = getAudioContext()
  const when = ctx.currentTime + delay
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(freq, when)
  oscillator.frequency.exponentialRampToValueAtTime(endFreq, when + duration)
  gain.gain.setValueAtTime(volume, when)
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(when)
  oscillator.stop(when + duration)
}

// 잡음을 필터로 걸러서 냅니다. 종이, 문, 긁는 소리에 씁니다.
export function playNoise({
  delay = 0,
  duration,
  volume,
  filterType = 'bandpass',
  freq = 1000,
  endFreq,
  Q = 1,
}) {
  const ctx = getAudioContext()
  const when = ctx.currentTime + delay
  const source = ctx.createBufferSource()
  source.buffer = getNoiseBuffer(ctx)
  const filter = ctx.createBiquadFilter()
  filter.type = filterType
  filter.frequency.setValueAtTime(freq, when)
  if (endFreq) {
    filter.frequency.linearRampToValueAtTime(endFreq, when + duration)
  }
  filter.Q.value = Q
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(volume, when)
  gain.gain.linearRampToValueAtTime(0, when + duration)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  source.start(when, Math.random() * 0.5, duration)
}
