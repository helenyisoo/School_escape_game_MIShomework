import { rect } from './pixel-draw.js'

// 획득할 수 있는 아이템 목록입니다.
// drawIcon: 가방 칸에 보일 16x16 픽셀 아이콘을 그리는 함수
export const ITEMS = [
  {
    id: 'note',
    name: '수상한 쪽지',
    description: '구겨진 종이에 한 줄이 적혀 있다. "분침이 움직이는 방향으로"',
    drawIcon(ctx) {
      // 쪽지 테두리
      rect(ctx, 2, 1, 12, 14, '#2b3650')
      // 종이 바탕
      rect(ctx, 3, 2, 10, 12, '#f4f1e8')
      // 글씨 줄
      rect(ctx, 5, 5, 6, 1, '#9aa4b8')
      rect(ctx, 5, 8, 6, 1, '#9aa4b8')
      rect(ctx, 5, 11, 4, 1, '#9aa4b8')
      // 빨간 봉인 도장
      rect(ctx, 10, 10, 3, 3, '#c0392b')
    },
  },
  {
    id: 'key',
    name: '교실 열쇠',
    description: '사물함 안에 숨겨져 있던 작은 열쇠다. 교실 출입문의 자물쇠에 맞을 것 같다.',
    drawIcon(ctx) {
      // 열쇠 고리
      rect(ctx, 3, 5, 6, 6, '#d9b25f')
      rect(ctx, 5, 7, 2, 2, '#2b3650')
      // 열쇠 몸통과 이빨
      rect(ctx, 9, 7, 6, 2, '#d9b25f')
      rect(ctx, 13, 9, 2, 3, '#d9b25f')
    },
  },
]

// 아이템 id로 아이템 정보를 찾습니다.
export function findItem(itemId) {
  return ITEMS.find((item) => item.id === itemId)
}
