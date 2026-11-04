import { rect, pixelCircle } from './pixel-draw.js'

// 괴물 그림입니다. (cx, cy): 가운데 좌표, r: 몸통 반지름
export function drawMonster(ctx, cx, cy, r) {
  pixelCircle(ctx, cx, cy, r, '#14080c')

  // 빨간 눈 두 개
  const eyeRadius = Math.max(1, Math.round(r * 0.14))
  const eyeOffset = Math.round(r * 0.4)
  const eyeY = cy - Math.round(r * 0.2)
  pixelCircle(ctx, cx - eyeOffset, eyeY, eyeRadius, '#ff3b3b')
  pixelCircle(ctx, cx + eyeOffset, eyeY, eyeRadius, '#ff3b3b')

  // 입과 이빨
  const mouthWidth = Math.round(r * 1.1)
  const mouthHeight = Math.round(r * 0.45)
  const mouthX = cx - Math.round(mouthWidth / 2)
  const mouthY = cy + Math.round(r * 0.3)
  rect(ctx, mouthX, mouthY, mouthWidth, mouthHeight, '#2a0a10')
  const teethCount = 4
  for (let i = 0; i <= teethCount; i++) {
    const toothX = mouthX + Math.round((i * mouthWidth) / teethCount) - 1
    rect(ctx, toothX, mouthY, 2, Math.max(2, Math.round(mouthHeight * 0.5)), '#f4f1e8')
  }
}
