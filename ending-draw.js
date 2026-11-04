import { rect, pixelCircle } from './pixel-draw.js'
import { drawMonster } from './monster-draw.js'

// 새벽 하늘의 띠 색깔을 위에서 아래로 나열합니다.
const SKY_BANDS = ['#1d2a4a', '#2c3c63', '#4a4f7a', '#7a5f85', '#c98a7a', '#f2b77a']

// 탈출 성공 화면: 새벽 하늘 아래 학교 정문입니다.
export function drawEscapeScene(ctx) {
  SKY_BANDS.forEach((color, index) => rect(ctx, 0, index * 48, 480, 48, color))
  pixelCircle(ctx, 240, 214, 30, '#ffe2a8')
  rect(ctx, 0, 214, 480, 74, '#1f1d26')
  // 정문 기둥과 윗부분
  rect(ctx, 150, 140, 10, 74, '#3a3a46')
  rect(ctx, 320, 140, 10, 74, '#3a3a46')
  rect(ctx, 146, 132, 188, 8, '#3a3a46')

  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff8e6'
  ctx.font = 'bold 20px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('탈출 성공!', 240, 60)
  ctx.font = '12px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('새벽 공기가 차갑다. 드디어 학교 밖이다.', 240, 90)
  ctx.textAlign = 'start'
}

// 게임 오버 화면: 어둠 속에서 괴물이 화면을 가득 채웁니다.
export function drawGameOverScene(ctx) {
  rect(ctx, 0, 0, 480, 288, '#050008')
  drawMonster(ctx, 240, 120, 70)

  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffe3e3'
  ctx.font = 'bold 20px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('잡아먹혔다...', 240, 236)
  ctx.font = '12px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('시간 안에 탈출하지 못했다.', 240, 260)
  ctx.textAlign = 'start'
}
