// 게임을 시작하기 전 오프닝 화면을 준비합니다. 시작 버튼을 누르면 화면이 천천히 사라집니다.
const FADE_OUT_MS = 400

export function setupOpeningScreen() {
  const screen = document.querySelector('#opening-screen')
  const startButton = screen.querySelector('#start-button')
  const tipButton = screen.querySelector('#tip-button')
  const tipDialog = document.querySelector('#tip-dialog')

  tipButton.addEventListener('click', () => tipDialog.showModal())
  tipDialog.querySelector('.dialog-close').addEventListener('click', () => tipDialog.close())

  startButton.addEventListener('click', () => {
    screen.classList.add('is-leaving')
    setTimeout(() => {
      screen.hidden = true
    }, FADE_OUT_MS)
  })
}
