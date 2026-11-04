// 칠판 상세 보기 창(대화상자)을 준비합니다.
// onClueFound: 숨겨진 문장을 누를 때마다 불리는 함수 (발견 기록은 호출하는 쪽에서 처리합니다)
export function setupBoardDialog(onClueFound) {
  const dialog = document.querySelector('#board-dialog')
  const secretButton = dialog.querySelector('.chalk-secret')
  const closeButton = dialog.querySelector('.dialog-close')

  // 숨겨진 문장을 누르면 드러나고, 게임 쪽에 발견을 알립니다.
  secretButton.addEventListener('click', () => {
    secretButton.classList.add('is-revealed')
    onClueFound('board-secret')
  })

  closeButton.addEventListener('click', () => dialog.close())

  return {
    open: () => dialog.showModal(),
  }
}
