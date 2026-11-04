import { rect, pixelCircle, drawHighlight, drawVignette } from './pixel-draw.js'
import { OBJECTS } from './classroom-data.js'

// 동그라미 시계 바늘 끝 좌표를 계산합니다. 각도 0도는 12시 방향입니다.
function handTip(cx, cy, degrees, length) {
  const radians = (degrees * Math.PI) / 180
  return {
    x: cx + length * Math.sin(radians),
    y: cy - length * Math.cos(radians),
  }
}

function drawWall(ctx) {
  rect(ctx, 0, 0, 480, 200, '#2a3347')
  for (let x = 0; x < 480; x += 40) {
    rect(ctx, x, 0, 2, 150, '#262e42')
  }
  // 벽 아래쪽의 어두운 몰딩
  rect(ctx, 0, 150, 480, 50, '#222a3c')
  // 천장
  rect(ctx, 0, 0, 480, 12, '#161c2a')
  // 꺼져 있는 형광등
  rect(ctx, 190, 4, 100, 4, '#3b3f4c')
}

function drawFloor(ctx) {
  rect(ctx, 0, 200, 480, 88, '#5b4534')
  // 마루 판자 줄무늬: 줄마다 세로 이음새 위치를 엇갈리게 합니다.
  for (let row = 0; row * 12 + 200 < 288; row++) {
    const y = 200 + row * 12
    rect(ctx, 0, y, 480, 1, '#4a3628')
    for (let x = (row % 2) * 20; x < 480; x += 40) {
      rect(ctx, x, y, 1, 12, '#4a3628')
    }
  }
}

// 창문 바깥은 밤하늘입니다. 클릭하면 조사 결과가 나타납니다.
function drawWindow(ctx) {
  rect(ctx, 28, 28, 96, 84, '#3b4256')
  rect(ctx, 32, 32, 88, 76, '#0b1a33')
  pixelCircle(ctx, 96, 50, 8, '#f4eed2')
  pixelCircle(ctx, 100, 48, 7, '#0b1a33')
  const stars = [
    [46, 42],
    [56, 70],
    [40, 92],
    [72, 96],
    [112, 84],
  ]
  for (const [x, y] of stars) {
    rect(ctx, x, y, 1, 1, '#ffffff')
  }
  rect(ctx, 32, 68, 88, 3, '#3b4256')
  rect(ctx, 76, 32, 3, 76, '#3b4256')
  rect(ctx, 24, 108, 104, 4, '#4a5266')
}

function drawBoard(ctx) {
  rect(ctx, 150, 30, 180, 98, '#8a6a4a')
  rect(ctx, 156, 36, 168, 86, '#1f3a33')
  ctx.textAlign = 'center'
  ctx.fillStyle = '#e9f2e6'
  ctx.font = 'bold 16px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('마지막 시험', 240, 66)
  rect(ctx, 190, 74, 100, 1, '#e9f2e6')
  ctx.font = '10px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.fillText('집에 가야한다', 240, 92)
  ctx.textAlign = 'start'
  // 네 모서리의 숫자: 왼쪽 위 3, 오른쪽 위 1, 오른쪽 아래 7, 왼쪽 아래 4
  ctx.fillStyle = '#e9f2e6'
  ctx.font = 'bold 14px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  ctx.fillText('3', 162, 40)
  ctx.textAlign = 'right'
  ctx.fillText('1', 318, 40)
  ctx.textBaseline = 'bottom'
  ctx.fillText('7', 318, 116)
  ctx.textAlign = 'left'
  ctx.fillText('4', 162, 116)
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'start'
  // 지우다 만 숫자 흔적
  rect(ctx, 196, 104, 10, 1, 'rgba(233, 242, 230, 0.35)')
  rect(ctx, 216, 104, 8, 1, 'rgba(233, 242, 230, 0.35)')
  rect(ctx, 234, 104, 12, 1, 'rgba(233, 242, 230, 0.35)')
  // 분필 받침대
  rect(ctx, 170, 128, 140, 4, '#6b5238')
}

function drawClock(ctx) {
  const cx = 390
  const cy = 60
  pixelCircle(ctx, cx, cy, 21, '#6b5a48')
  pixelCircle(ctx, cx, cy, 18, '#f1ece0')
  // 시간 눈금: 12개의 작은 점
  for (let i = 0; i < 12; i++) {
    const tip = handTip(cx, cy, i * 30, 15)
    rect(ctx, Math.round(tip.x), Math.round(tip.y), 2, 2, '#2a2a2a')
  }
  // 분침: 47분을 가리키며 퍼즐의 방향을 알려 줍니다.
  const minute = handTip(cx, cy, 282, 13)
  ctx.strokeStyle = '#1b1b1b'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(minute.x, minute.y)
  ctx.stroke()
  rect(ctx, cx - 1, cy - 1, 3, 3, '#1b1b1b')
}

// 사물함 안에 있는 열쇠 그림입니다.
function drawKey(ctx) {
  rect(ctx, 47, 152, 6, 6, '#d9b25f')
  rect(ctx, 49, 154, 2, 2, '#15171f')
  rect(ctx, 53, 154, 7, 2, '#d9b25f')
  rect(ctx, 57, 156, 2, 3, '#d9b25f')
}

// locker: { isOpen: 사물함이 열렸는지, showKey: 안에 열쇠를 그릴지 }
function drawLocker(ctx, locker) {
  // 사물함 전체 틀
  rect(ctx, 10, 118, 88, 84, '#2c3446')
  // 문 3개를 나란히 그립니다.
  for (let i = 0; i < 3; i++) {
    const x = 12 + i * 29
    // 열린 가운데 문: 어두운 안쪽을 보여 주고, 문은 한쪽으로 젖혀 둡니다.
    if (i === 1 && locker.isOpen) {
      rect(ctx, x, 120, 26, 80, '#15171f')
      rect(ctx, x, 120, 3, 80, '#4a5873')
      if (locker.showKey) {
        drawKey(ctx)
      }
      continue
    }
    rect(ctx, x, 120, 26, 80, '#4a5873')
    rect(ctx, x + 8, 126, 10, 2, '#2c3446')
    rect(ctx, x + 3, 150, 2, 10, '#c7cfdc')
  }
  // 잠겨 있을 때만 가운데 사물함에 금색 자물쇠가 보입니다.
  if (!locker.isOpen) {
    rect(ctx, 48, 166, 10, 8, '#d9b25f')
    ctx.strokeStyle = '#d9b25f'
    ctx.lineWidth = 2
    ctx.strokeRect(50, 162, 6, 5)
  }
}

// drawer: { progress: 서랍이 열린 정도(0~1), showNote: 서랍 안에 쪽지를 그릴지 여부 }
function drawDesk(ctx, drawer) {
  // 책상 다리
  rect(ctx, 192, 160, 6, 40, '#6e5238')
  rect(ctx, 282, 160, 6, 40, '#6e5238')
  // 서랍 안쪽의 어두운 공간
  rect(ctx, 202, 160, 76, 12, '#2a1d14')
  // 서랍 안에 놓인 쪽지 (서랍 앞판에 가려져 있다가 열리면 보입니다)
  if (drawer.showNote) {
    rect(ctx, 212, 164, 30, 10, '#f4f1e8')
    rect(ctx, 216, 167, 20, 1, '#9aa4b8')
    rect(ctx, 216, 170, 14, 1, '#9aa4b8')
  }
  // 서랍 앞판: 열린 정도에 따라 아래로 빠져나옵니다.
  const frontY = 162 + Math.round(drawer.progress * 12)
  rect(ctx, 200, frontY, 80, 12, '#7a5a40')
  rect(ctx, 234, frontY + 5, 12, 2, '#c7a06a')
  // 책상 윗판
  rect(ctx, 186, 150, 108, 10, '#8c6a4c')
  rect(ctx, 186, 150, 108, 2, '#a6805c')
  // 윗판 위의 시험지와 연필
  rect(ctx, 214, 136, 44, 16, '#f4f1e8')
  rect(ctx, 218, 141, 36, 1, '#9aa4b8')
  rect(ctx, 218, 145, 30, 1, '#9aa4b8')
  rect(ctx, 262, 144, 20, 2, '#f2c14e')
}

// openAmount: 문이 열린 정도 (0: 닫힘, 1: 완전히 열림)
function drawDoor(ctx, openAmount) {
  // 위쪽 초록색 출입문 표지판
  rect(ctx, 410, 96, 38, 12, '#1f5a44')
  ctx.fillStyle = '#e9f2e6'
  ctx.font = '8px "Malgun Gothic", "Noto Sans KR", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('출입문', 429, 105)
  ctx.textAlign = 'start'
  // 문틀
  rect(ctx, 398, 112, 62, 92, '#2e2119')
  if (openAmount > 0) {
    // 열린 틈으로 밝은 복도 불빛이 새어 나옵니다.
    rect(ctx, 402, 116, 54, 88, '#e6eef7')
  }
  // 문짝: 열릴수록 폭이 줄어들어 옆으로 젖혀진 모습이 됩니다.
  const panelWidth = Math.round(54 * (1 - openAmount * 0.85))
  rect(ctx, 402, 116, panelWidth, 88, '#6b4a2e')
  if (openAmount === 0) {
    rect(ctx, 410, 126, 38, 30, '#5a3d26')
    rect(ctx, 416, 132, 26, 18, '#0d1a2a')
    rect(ctx, 410, 164, 38, 34, '#5a3d26')
    rect(ctx, 444, 160, 4, 8, '#d9b25f')
  }
  // 문턱
  rect(ctx, 398, 202, 62, 4, '#3a2a1c')
}

// 한 번이라도 조사한 물건의 오른쪽 위에 초록 점을 찍습니다.
function drawVisitedMark(ctx, box) {
  ctx.fillStyle = '#6fcf97'
  ctx.beginPath()
  ctx.arc(box.x + box.w - 6, box.y + 6, 3, 0, Math.PI * 2)
  ctx.fill()
}

// 교실 전체를 그립니다.
// hoveredBox: 마우스가 올라간 영역(없으면 null), visitedIds: 조사한 물건 목록,
// drawer: 책상 서랍 상태, locker: 사물함 상태, doorProgress: 출입문이 열린 정도
export function drawClassroom(ctx, { hoveredBox, visitedIds, drawer, locker, doorProgress }) {
  drawWall(ctx)
  drawFloor(ctx)
  drawWindow(ctx)
  drawBoard(ctx)
  drawClock(ctx)
  drawLocker(ctx, locker)
  drawDesk(ctx, drawer)
  drawDoor(ctx, doorProgress)
  drawVignette(ctx)

  for (const object of OBJECTS) {
    if (visitedIds.has(object.id)) {
      drawVisitedMark(ctx, object.box)
    }
  }
  if (hoveredBox) {
    drawHighlight(ctx, hoveredBox)
  }
}
