// 복도 바닥의 쪽지를 눌렀을 때 나타나는 상세 보기 창을 준비합니다.
export function setupBloodNoteDialog() {
  const dialog = document.querySelector('#blood-note-dialog')
  const closeButton = dialog.querySelector('.dialog-close')

  closeButton.addEventListener('click', () => dialog.close())

  return {
    open: () => dialog.showModal(),
  }
}
