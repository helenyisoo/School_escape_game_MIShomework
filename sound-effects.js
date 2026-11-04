import { playNoise, playTone } from './sound-engine.js'

// 서랍이 미끄러져 열리는 소리
export function playDrawerOpen() {
  playNoise({ duration: 0.35, volume: 0.3, filterType: 'bandpass', freq: 400, endFreq: 1200, Q: 1.2 })
  playTone({ type: 'square', freq: 160, endFreq: 110, delay: 0.3, duration: 0.08, volume: 0.08 })
}

// 사물함 문이 삐걱 열리고 자물쇠가 툭 풀리는 소리
export function playLockerOpen() {
  playTone({ type: 'sawtooth', freq: 140, endFreq: 230, duration: 0.5, volume: 0.07 })
  playNoise({ delay: 0.5, duration: 0.04, volume: 0.35, filterType: 'highpass', freq: 2000 })
}

// 종이쪽지를 집어 드는 바스락 소리
export function playPaper() {
  playNoise({ duration: 0.25, volume: 0.2, filterType: 'highpass', freq: 3000 })
  playNoise({ delay: 0.12, duration: 0.15, volume: 0.15, filterType: 'bandpass', freq: 1500, Q: 0.8 })
}

// 열쇠가 짤랑거리는 소리
export function playKeyJingle() {
  const notes = [2100, 2600, 2300, 3000]
  notes.forEach((freq, index) => {
    playTone({ type: 'sine', freq, delay: index * 0.08, duration: 0.18, volume: 0.15 })
  })
}

// 교실 문이 끼익 열리는 소리
export function playClassroomDoor() {
  playTone({ type: 'sawtooth', freq: 90, endFreq: 160, duration: 1.2, volume: 0.06 })
  playNoise({ duration: 1.2, volume: 0.1, filterType: 'bandpass', freq: 300, Q: 2 })
}

// 탈출 문이 무겁게 열리고 밝은 빛이 새어 나오는 소리
export function playExitDoor() {
  playTone({ type: 'sawtooth', freq: 70, endFreq: 130, duration: 1.6, volume: 0.07 })
  playNoise({ duration: 1.6, volume: 0.12, filterType: 'bandpass', freq: 250, endFreq: 600, Q: 2 })
  playTone({ type: 'triangle', freq: 440, endFreq: 880, delay: 1.2, duration: 0.4, volume: 0.1 })
}

// 탈출 성공을 알리는 상승 음계입니다. delay: 시작까지 기다릴 초
export function playSuccess(delay = 0) {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, index) => {
    playTone({ type: 'triangle', freq, delay: delay + index * 0.15, duration: 0.4, volume: 0.18 })
  })
}

// 실패를 알리는 낮게 떨어지는 음계입니다.
export function playFailure() {
  const notes = [392, 330, 262, 196]
  notes.forEach((freq, index) => {
    playTone({ type: 'triangle', freq, delay: index * 0.3, duration: 0.5, volume: 0.18 })
  })
  playTone({ type: 'sawtooth', freq: 80, endFreq: 40, delay: 1.2, duration: 0.8, volume: 0.2 })
}

// 괴물에게 잡아먹힐 때 나는 비명입니다.
export function playScream() {
  playTone({ type: 'sawtooth', freq: 600, endFreq: 1400, duration: 1.3, volume: 0.12 })
  playTone({ type: 'square', freq: 700, endFreq: 1100, duration: 1.3, volume: 0.05 })
  playNoise({ duration: 1.3, volume: 0.15, filterType: 'highpass', freq: 1500 })
}
