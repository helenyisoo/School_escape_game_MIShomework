// 픽셀아트를 그릴 때 함께 쓰는 도우미 함수 모음입니다. 교실, 복도, 아이템 아이콘이 함께 사용합니다.

// 캔버스에 사각형 한 칸을 그립니다. 픽셀아트는 이런 사각형을 모아 만듭니다.
export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

// 동그라미를 가로줄 단위의 픽셀로 그립니다. (계단 모양이 나는 픽셀 느낌)
export function pixelCircle(ctx, cx, cy, r, color) {
  for (let dy = -r; dy <= r; dy++) {
    const half = Math.round(Math.sqrt(r * r - dy * dy))
    rect(ctx, cx - half, cy + dy, half * 2 + 1, 1, color)
  }
}

// 여러 점을 이어 만든 다각형을 채웁니다. 원근감이 있는 벽과 바닥에 씁니다.
export function polygon(ctx, points, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  points.forEach(([x, y], index) => {
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.closePath()
  ctx.fill()
}

// 밤 분위기를 주는 가장자리 어둠 효과
export function drawVignette(ctx) {
  const gradient = ctx.createRadialGradient(240, 144, 120, 240, 144, 300)
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 480, 288)
}

// 마우스를 올린 영역은 노란 점선 테두리로 강조합니다.
export function drawHighlight(ctx, box) {
  rect(ctx, box.x, box.y, box.w, box.h, 'rgba(242, 193, 78, 0.12)')
  ctx.strokeStyle = '#f2c14e'
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1)
  ctx.setLineDash([])
}
