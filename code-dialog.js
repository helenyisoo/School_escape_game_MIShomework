// 정답을 입력받는 작은 입력창(대화상자)을 준비합니다.
// prefix: HTML에서 쓰는 이름 앞부분 (예: 'locker'이면 #locker-dialog, #locker-form 등을 찾습니다)
// answer: 정답 문자열, sanitize: 입력값에서 허용하지 않는 글자를 걸러내는 함수
// lengthMessage: 글자 수가 모자랄 때 보여 줄 안내 문구, onSolve: 정답을 맞혔을 때 불리는 함수
export function setupCodeDialog({ prefix, answer, sanitize, lengthMessage, onSolve }) {
  const dialog = document.querySelector(`#${prefix}-dialog`)
  const form = dialog.querySelector(`#${prefix}-form`)
  const input = dialog.querySelector(`#${prefix}-code`)
  const message = dialog.querySelector(`#${prefix}-message`)
  const cancelButton = dialog.querySelector(`.${prefix}-cancel`)

  input.addEventListener('input', () => {
    input.value = sanitize(input.value)
  })

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const code = input.value

    if (code.length !== answer.length) {
      message.textContent = lengthMessage
      return
    }
    if (code !== answer) {
      message.textContent = '오답이다. 다시 생각해 보자.'
      input.select()
      return
    }

    dialog.close()
    onSolve()
  })

  cancelButton.addEventListener('click', () => dialog.close())

  return {
    open: () => {
      input.value = ''
      message.textContent = ''
      dialog.showModal()
      input.focus()
    },
  }
}
