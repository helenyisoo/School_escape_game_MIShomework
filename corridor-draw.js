import { rect, polygon, drawHighlight, drawVignette } from './pixel-draw.js'
import { drawMonster } from './monster-draw.js'

// 교실 반대편 벽의 창문 영역입니다. 바깥에서 괴물이 두드리는 창문입니다.
export const CORRIDOR_WINDOW_BOX = { x: 366, y: 20, w: 86, h: 177 }

// 복도 끝 출구 문의 영역입니다. 누르면 질문 창이 나타납니다.
export const CORRIDOR_EXIT_BOX = { x: 214, y: 120, w: 52, h: 80 }

// 복도에서 교실로 돌아가는 문의 영역입니다.
export const CORRIDOR_BACK_BOX = { x: 22, y: 84, w: 56, h: 152 }

// 괴물이 창문을 뚫고 나오는 시작 위치와 끝 위치입니다.
const MONSTER_START = { x: 409, y: 100 }
const MONSTER_END = { x: 240, y: 150 }

// 천장 형광등 세 줄과 그 빛의 번짐을 그립니다.
function drawCeilingLights(ctx) {
  rect(ctx, 46, 8, 128, 12, 'rgba(255, 243, 196, 0.12)')
  rect(ctx, 50, 4, 110, 4, '#fff3c4')
  rect(ctx, 180, 22, 120, 6, 'rgba(255, 243, 196, 0.12)')
  rect(ctx, 190, 24, 100, 3, '#fff3c4')
  rect(ctx, 220, 36, 40, 2, '#fff3c4')
}

// 복도 바닥의 타일 줄무늬: 소실점(가운데 안쪽)을 향해 좁아지는 가로줄입니다.
function drawFloorLines(ctx) {
  for (const y of [222, 248, 272]) {
    const leftX = 160 - ((y - 200) * 160) / 88
    const rightX = 320 + ((y - 200) * 160) / 88
    rect(ctx, leftX, y, rightX - leftX, 1, '#503f30')
  }
}

// 복도 벽, 천장, 바닥, 안쪽 끝 벽을 원근감 있게 그립니다.
function drawCorridorStructure(ctx) {
  polygon(ctx, [[0, 0], [480, 0], [320, 60], [160, 60]], '#202a3d')
  polygon(ctx, [[0, 0], [160, 60], [160, 200], [0, 288]], '#3a4a63')
  polygon(ctx, [[480, 0], [320, 60], [320, 200], [480, 288]], '#34425a')
  polygon(ctx, [[0, 288], [160, 200], [320, 200], [480, 288]], '#6b5440')
  drawFloorLines(ctx)
  rect(ctx, 160, 60, 160, 140, '#2b3850')
}

// 복도 바닥에 떨어진 피투성이 쪽지의 영역입니다. 누르면 쪽지 내용이 크게 나타납니다.
export const BLOOD_NOTE_BOX = { x: 280, y: 226, w: 48, h: 40 }

// 바닥에 흩뿌려진 피와 그 위에 놓인 쪽지입니다.
function drawBloodNote(ctx) {
  const blood = '#7a0f14'
  const brightBlood = '#c81e24'
  rect(ctx, 284, 236, 5, 5, blood)
  rect(ctx, 318, 226, 4, 4, blood)
  rect(ctx, 326, 254, 6, 6, blood)
  rect(ctx, 272, 252, 4, 4, brightBlood)
  rect(ctx, 334, 238, 3, 3, brightBlood)
  rect(ctx, 298, 262, 5, 4, blood)
  rect(ctx, 290, 228, 38, 32, '#d98f84')
  rect(ctx, 290, 228, 38, 32, 'rgba(200, 30, 36, 0.45)')
  rect(ctx, 292, 230, 34, 28, '#e9d6c8')
  rect(ctx, 292, 230, 34, 28, 'rgba(160, 20, 26, 0.35)')
  rect(ctx, 296, 236, 9, 6, blood)
  rect(ctx, 310, 244, 12, 8, brightBlood)
  rect(ctx, 302, 254, 5, 4, blood)
  rect(ctx, 319, 234, 4, 4, blood)
  rect(ctx, 316, 252, 6, 3, brightBlood)
}

// 복도 끝의 출구 표지판과 어두운 문입니다.
function drawCorridorEnd(ctx) {
  rect(ctx, 206, 74, 68, 14, '#1f5a44')
  ctx.fillStyle = '#e9f2e6'
  ctx.font = 'bold 10px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('출구', 240, 85)
  ctx.textAlign = 'start'
  rect(ctx, 214, 120, 52, 80, '#16202f')
  rect(ctx, 256, 160, 3, 10, '#d9b25f')
}

// 왼쪽 벽의 교실 문: 누르면 교실로 돌아갑니다.
function drawClassroomDoor(ctx) {
  polygon(ctx, [[22, 84], [78, 104], [78, 214], [22, 238]], '#2e2119')
  polygon(ctx, [[28, 90], [72, 108], [72, 206], [28, 230]], '#6b4a2e')
  rect(ctx, 36, 70, 28, 10, '#1f5a44')
  ctx.fillStyle = '#e9f2e6'
  ctx.font = '8px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('교실', 50, 78)
  ctx.textAlign = 'start'
  rect(ctx, 64, 152, 4, 8, '#d9b25f')
}

// 교실 반대편 벽의 창문입니다. shakeX만큼 흔들리고, 쾅 소리가 나면 showImpact가 켜집니다.
// monsterProgress가 0보다 크면 유리가 깨져 구멍이 보입니다.
function drawCorridorWindow(ctx, { shakeX, showImpact, monsterProgress }) {
  const dx = shakeX
  const isBroken = monsterProgress > 0
  // 창틀: 벽의 원근법을 따라 기울어진 사각형입니다.
  polygon(ctx, [[366 + dx, 52], [452 + dx, 20], [452 + dx, 197], [366 + dx, 150]], '#5a4632')
  polygon(ctx, [[372 + dx, 60], [446 + dx, 32], [446 + dx, 184], [372 + dx, 138]], isBroken ? '#050008' : '#0b1a33')
  if (!isBroken) {
    // 유리를 나누는 세로살과 가로살
    polygon(ctx, [[407 + dx, 46], [410 + dx, 45], [410 + dx, 161], [407 + dx, 161]], '#5a4632')
    polygon(ctx, [[372 + dx, 98], [446 + dx, 107], [446 + dx, 110], [372 + dx, 101]], '#5a4632')
  }
  if (showImpact) {
    ctx.fillStyle = '#ff6b6b'
    ctx.font = 'bold 12px "Malgun Gothic", "Noto Sans KR", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('쾅!', 352, 70)
    ctx.textAlign = 'start'
  }
}

// 괴물이 창문에서 뛰쳐나와 복도 가운데로 다가오는 모습입니다. progress: 0~1
function drawMonsterEntering(ctx, progress) {
  const cx = Math.round(MONSTER_START.x + (MONSTER_END.x - MONSTER_START.x) * progress)
  const cy = Math.round(MONSTER_START.y + (MONSTER_END.y - MONSTER_START.y) * progress)
  const radius = Math.round(6 + 84 * progress)
  drawMonster(ctx, cx, cy, radius)
}

// 복도 전체를 그립니다.
// hoveredBox: 마우스가 올라간 영역(없으면 null)
// shakeX: 창문이 흔들리는 가로 거리(픽셀), showImpact: 쾅 표시 여부
// monsterProgress: 괴물이 창문에서 나오는 정도(0: 아직 없음, 1: 완전히 나옴)
export function drawCorridor(ctx, { hoveredBox, shakeX = 0, showImpact = false, monsterProgress = 0 }) {
  drawCorridorStructure(ctx)
  drawCeilingLights(ctx)
  drawCorridorEnd(ctx)
  drawClassroomDoor(ctx)
  drawBloodNote(ctx)
  drawCorridorWindow(ctx, { shakeX, showImpact, monsterProgress })
  if (monsterProgress > 0) {
    drawMonsterEntering(ctx, monsterProgress)
  }
  drawVignette(ctx)
  if (hoveredBox) {
    drawHighlight(ctx, hoveredBox)
  }
}
