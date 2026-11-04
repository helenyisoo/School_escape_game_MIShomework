import './style.css'
import { OBJECTS, NOTE_BOX, KEY_BOX, LOCKER_CODE } from './classroom-data.js'
import { drawClassroom } from './classroom-draw.js'
import { drawCorridor, CORRIDOR_BACK_BOX, CORRIDOR_WINDOW_BOX, CORRIDOR_EXIT_BOX, BLOOD_NOTE_BOX } from './corridor-draw.js'
import { drawEscapeScene, drawGameOverScene } from './ending-draw.js'
import { findItem } from './item-data.js'
import { renderInventory } from './inventory-view.js'
import { setupBoardDialog } from './board-dialog.js'
import { setupCodeDialog } from './code-dialog.js'
import { setupBloodNoteDialog } from './blood-note-dialog.js'
import { unlockAudio } from './sound-engine.js'
import {
  playDrawerOpen,
  playLockerOpen,
  playPaper,
  playKeyJingle,
  playClassroomDoor,
  playExitDoor,
  playSuccess,
  playScream,
  playFailure,
} from './sound-effects.js'
import { setupOpeningScreen } from './opening-screen.js'
import { setMusicMode, KNOCK_PERIOD_MS } from './background-music.js'

// 화면에 있는 요소들을 찾아 둡니다.
const canvas = document.querySelector('#classroom')
const ctx = canvas.getContext('2d')
const progressEl = document.querySelector('#progress')
const resultTitleEl = document.querySelector('#result-title')
const resultTextEl = document.querySelector('#result-text')
const restartButton = document.querySelector('#restart-button')
const inventorySlots = document.querySelectorAll('.inventory-slots .slot')

// 아이템 id와 그림 속 영역 id는 같은 이름을 씁니다.
const NOTE_ID = 'note'
const KEY_ID = 'key'
const BACK_ID = 'back'
const CORRIDOR_WINDOW_ID = 'corridor-window'
const EXIT_ID = 'exit'
const BLOOD_NOTE_ID = 'blood-note'

// 복도에 나온 뒤 탈출 제한 시간(1분)과 괴물이 창문으로 들어오는 연출 시간입니다.
const ESCAPE_TIME_MS = 60 * 1000
const MONSTER_DURATION_MS = 2500
const EXIT_RIDDLE_ANSWER = '시간'

// 게임 진행 상황을 담는 변수 모음입니다. 새로고침하면 처음부터 다시 시작합니다.
// currentView 값: 'classroom', 'corridor', 'monster'(괴물 등장), 'escape'(탈출 성공), 'gameover'(게임 오버)
const gameState = {
  currentView: 'classroom',
  visitedIds: new Set(), // 조사한 물건 id 목록 (중복 없이 저장)
  foundClueIds: new Set(), // 발견한 숨겨진 문장 id 목록
  collectedItemIds: [], // 획득한 아이템 id 목록 (얻은 순서대로)
  selectedItemId: null, // 가방에서 지금 선택한 아이템 id
  isDrawerOpen: false, // 책상 서랍을 열어 두었는지
  drawerProgress: 0, // 서랍이 열린 정도 (0: 닫힘, 1: 완전히 열림)
  isLockerOpen: false, // 사물함 자물쇠를 풀었는지
  doorProgress: 0, // 출입문이 열린 정도 (0: 닫힘, 1: 완전히 열림)
  deadline: null, // 탈출 제한 시각(밀리초). 복도에 처음 나온 순간 정해집니다.
  monsterStartedAt: null, // 괴물이 창문으로 뛰어든 시각
  hoveredHotspot: null, // 마우스가 올라가 있는 영역
  drawerFrameId: null, // 서랍 애니메이션 프레임 번호
  doorFrameId: null, // 출입문 애니메이션 프레임 번호
}

const boardDialog = setupBoardDialog(handleClueFound)
const bloodNoteDialog = setupBloodNoteDialog()
const lockerDialog = setupCodeDialog({
  prefix: 'locker',
  answer: LOCKER_CODE,
  sanitize: (value) => value.replace(/\D/g, '').slice(0, 4),
  lengthMessage: '숫자 4자리를 입력해 주세요.',
  onSolve: handleLockerUnlocked,
})
const riddleDialog = setupCodeDialog({
  prefix: 'riddle',
  answer: EXIT_RIDDLE_ANSWER,
  sanitize: (value) => value.replace(/\s/g, '').slice(0, 2),
  lengthMessage: '빈칸을 모두 채워 주세요.',
  onSolve: handleEscape,
})

function hasItem(itemId) {
  return gameState.collectedItemIds.includes(itemId)
}

// 마우스 위치(화면 픽셀)를 캔버스 그림 좌표로 바꿉니다.
function getScenePosition(event) {
  const rect = canvas.getBoundingClientRect()
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  }
}

// 쪽지는 서랍이 완전히 열렸고 아직 가방에 없을 때만 누를 수 있습니다.
function isNoteReachable() {
  return gameState.isDrawerOpen && gameState.drawerProgress >= 1 && !hasItem(NOTE_ID)
}

// 열쇠는 사물함이 열려 있고 아직 가방에 없을 때만 누를 수 있습니다.
function isKeyReachable() {
  return gameState.isLockerOpen && !hasItem(KEY_ID)
}

// 지금 장면에서 누를 수 있는 모든 영역 목록입니다. 서랍과 사물함 안의 물건이 먼저 잡힙니다.
function getHotspots() {
  if (gameState.currentView === 'corridor') {
    return [
      { id: BACK_ID, box: CORRIDOR_BACK_BOX },
      { id: CORRIDOR_WINDOW_ID, box: CORRIDOR_WINDOW_BOX },
      { id: EXIT_ID, box: CORRIDOR_EXIT_BOX },
      { id: BLOOD_NOTE_ID, box: BLOOD_NOTE_BOX },
    ]
  }
  if (gameState.currentView !== 'classroom') {
    return []
  }
  const hotspots = []
  if (isNoteReachable()) {
    hotspots.push({ id: NOTE_ID, box: NOTE_BOX })
  }
  if (isKeyReachable()) {
    hotspots.push({ id: KEY_ID, box: KEY_BOX })
  }
  return hotspots.concat(OBJECTS)
}

// 그 위치에 있는 영역을 찾습니다. 없으면 null을 돌려줍니다.
function findHotspotAt(position) {
  const hit = getHotspots().find(({ box }) =>
    position.x >= box.x &&
    position.x <= box.x + box.w &&
    position.y >= box.y &&
    position.y <= box.y + box.h
  )
  return hit ?? null
}

// 복도 창문이 쾅쾅 흔들리는 상태입니다. 남은 시간이 줄수록 더 세게 흔들립니다.
function getKnockState(now) {
  const remainingRatio = Math.max(0, (gameState.deadline - now) / ESCAPE_TIME_MS)
  const strength = 1 + Math.round(3 * (1 - remainingRatio))
  const phase = now % KNOCK_PERIOD_MS
  const isKnocking = phase < 120
  return {
    shakeX: isKnocking ? (phase < 60 ? strength : -strength) : 0,
    showImpact: isKnocking,
  }
}

// 괴물이 창문에서 나오는 정도(0~1)를 계산합니다.
function getMonsterProgress(now) {
  return Math.min(1, (now - gameState.monsterStartedAt) / MONSTER_DURATION_MS)
}

function renderScene(now = performance.now()) {
  const hoveredBox = gameState.hoveredHotspot ? gameState.hoveredHotspot.box : null
  const view = gameState.currentView

  if (view === 'escape') {
    drawEscapeScene(ctx)
    return
  }
  if (view === 'gameover') {
    drawGameOverScene(ctx)
    return
  }
  if (view === 'corridor' || view === 'monster') {
    const knock = view === 'corridor' ? getKnockState(now) : { shakeX: 0, showImpact: false }
    drawCorridor(ctx, {
      hoveredBox,
      shakeX: knock.shakeX,
      showImpact: knock.showImpact,
      monsterProgress: view === 'monster' ? getMonsterProgress(now) : 0,
    })
    return
  }
  drawClassroom(ctx, {
    hoveredBox,
    visitedIds: gameState.visitedIds,
    drawer: {
      progress: gameState.drawerProgress,
      showNote: !hasItem(NOTE_ID),
    },
    locker: {
      isOpen: gameState.isLockerOpen,
      showKey: isKeyReachable(),
    },
    doorProgress: gameState.doorProgress,
  })
}

// 남은 시간을 "분:초" 모양의 글자로 바꿉니다.
function formatRemainingTime(now) {
  const seconds = Math.ceil(Math.max(0, gameState.deadline - now) / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

// 진행 상황 문장을 현재 상태에 맞춰 바꿉니다.
function renderProgress(now = performance.now()) {
  const view = gameState.currentView
  if (view === 'escape') {
    progressEl.textContent = '탈출 성공! 학교 밖으로 나왔다.'
    return
  }
  if (view === 'gameover') {
    progressEl.textContent = '게임 오버'
    return
  }
  if (view === 'monster') {
    progressEl.textContent = '괴물이 창문을 깨고 들어온다!'
    return
  }

  const count = gameState.visitedIds.size
  const total = OBJECTS.length
  let stage
  if (count === 0) {
    stage = '막 깨어났다. 교실을 살펴보자'
  } else if (count < total) {
    stage = '교실 탐색 중'
  } else {
    stage = '모든 물건을 조사했다. 다음 단서를 기다리는 중'
  }
  const timer = gameState.deadline === null ? '' : `탈출까지 ${formatRemainingTime(now)} · `
  progressEl.textContent = `${timer}${stage} (조사 ${count} / ${total})`
}

// 조사 결과 글을 보여 줍니다. 같은 자리에서 다시 나타나도록 애니메이션을 다시 시작합니다.
function showResult(title, text) {
  resultTitleEl.textContent = title
  resultTextEl.textContent = text
  resultTextEl.classList.remove('fade-in')
  void resultTextEl.offsetWidth
  resultTextEl.classList.add('fade-in')
}

function markVisited(id) {
  gameState.visitedIds.add(id)
  renderProgress()
}

// 일반 물건(시계, 칠판 등)을 조사했을 때 글을 보여 줍니다.
function inspectObject(id) {
  const object = OBJECTS.find((item) => item.id === id)
  const isRepeat = gameState.visitedIds.has(id)
  markVisited(id)
  showResult(object.name, isRepeat ? object.again : object.first)
}

// 책상 서랍을 열거나 닫습니다.
function toggleDrawer() {
  gameState.isDrawerOpen = !gameState.isDrawerOpen
  markVisited('desk')
  if (gameState.isDrawerOpen) {
    playDrawerOpen()
    showResult(
      '책상',
      hasItem(NOTE_ID)
        ? '서랍을 열었다. 안은 비어 있다.'
        : '서랍을 열었다. 안에 종이 한 장이 들어 있다.'
    )
  } else {
    showResult('책상', '서랍을 다시 닫았다.')
  }
  animateDrawer()
}

// 서랍을 목표 위치까지 부드럽게 움직입니다.
function animateDrawer() {
  cancelAnimationFrame(gameState.drawerFrameId)
  const target = gameState.isDrawerOpen ? 1 : 0
  const step = () => {
    const gap = target - gameState.drawerProgress
    gameState.drawerProgress =
      Math.abs(gap) < 0.02 ? target : gameState.drawerProgress + gap * 0.25
    renderScene()
    if (gameState.drawerProgress !== target) {
      gameState.drawerFrameId = requestAnimationFrame(step)
    }
  }
  gameState.drawerFrameId = requestAnimationFrame(step)
}

// 물건을 가방에 넣습니다. 이미 가지고 있으면 다시 넣지 않습니다.
function collectItem(itemId, message) {
  if (hasItem(itemId)) return
  gameState.collectedItemIds.push(itemId)
  gameState.hoveredHotspot = null
  showResult(findItem(itemId).name, message)
  renderInventory(inventorySlots, gameState.collectedItemIds, gameState.selectedItemId)
  renderScene()
}

// 사물함을 눌렀을 때: 잠겨 있으면 숫자 입력창, 열려 있으면 안의 상태를 알려 줍니다.
function handleLockerClick() {
  if (gameState.isLockerOpen) {
    markVisited('locker')
    showResult(
      '사물함',
      hasItem(KEY_ID) ? '열린 사물함 안은 비어 있다.' : '열린 사물함 안에 작은 열쇠가 보인다.'
    )
    return
  }
  inspectObject('locker')
  lockerDialog.open()
}

// 숫자 입력창에서 정답을 맞혔을 때 사물함을 엽니다.
function handleLockerUnlocked() {
  gameState.isLockerOpen = true
  playLockerOpen()
  showResult('사물함', '자물쇠가 딸깍 소리를 내며 열렸다. 안에 작은 열쇠가 보인다.')
  renderScene()
}

// 선택한 열쇠로 출입문을 엽니다. 문이 열리는 모습을 보여 준 뒤 복도 장면으로 바꿉니다.
function openDoor() {
  markVisited('door')
  playClassroomDoor()
  cancelAnimationFrame(gameState.doorFrameId)
  const step = () => {
    gameState.doorProgress = Math.min(1, gameState.doorProgress + 0.04)
    if (gameState.doorProgress < 1) {
      renderScene()
      gameState.doorFrameId = requestAnimationFrame(step)
    } else {
      enterCorridor('열쇠로 출입문을 열었다. 문이 천천히 열리며 긴 복도가 나타난다. 창밖에서 무언가 쾅쾅 유리를 두드린다! 1분 안에 출구로 나가야 한다.')
    }
  }
  gameState.doorFrameId = requestAnimationFrame(step)
}

// 복도 장면으로 바꿉니다. 처음 나온 순간부터 1분 제한 시간이 시작됩니다.
function enterCorridor(message) {
  if (gameState.deadline === null) {
    gameState.deadline = performance.now() + ESCAPE_TIME_MS
    setMusicMode('urgent')
  }
  gameState.currentView = 'corridor'
  gameState.hoveredHotspot = null
  canvas.style.cursor = 'default'
  showResult('복도', message)
  renderScene()
}

// 교실 장면으로 돌아옵니다.
function returnToClassroom() {
  gameState.currentView = 'classroom'
  gameState.hoveredHotspot = null
  canvas.style.cursor = 'default'
  showResult('교실', '다시 교실로 들어왔다. 열린 출입문 너머로 복도 불빛이 새어 든다.')
  renderScene()
}

// 출입문을 눌렀을 때: 열리는 중이면 무시, 이미 열렸으면 복도로 나가고, 아니면 열쇠 사용 여부를 확인합니다.
function handleDoorClick() {
  if (gameState.doorProgress > 0 && gameState.doorProgress < 1) return
  if (gameState.doorProgress === 1) {
    enterCorridor('복도로 나왔다. 천장의 형광등이 환하게 켜져 있다.')
    return
  }
  if (gameState.selectedItemId === KEY_ID) {
    openDoor()
    return
  }
  if (gameState.selectedItemId) {
    markVisited('door')
    showResult('출입문', '이 물건으로는 문이 열리지 않는다.')
    return
  }
  if (hasItem(KEY_ID)) {
    markVisited('door')
    showResult('출입문', '잠겨 있다. 가방에서 열쇠를 선택한 뒤 다시 눌러 보자.')
    return
  }
  inspectObject('door')
}

// 제한 시간이 끝나면 괴물이 창문으로 뛰어들고, 연출이 끝나면 게임 오버가 됩니다.
function updateCorridorTimer(now) {
  if (gameState.deadline === null) return

  const view = gameState.currentView
  if (view === 'classroom' || view === 'corridor') {
    if (now >= gameState.deadline) {
      startMonster(now)
    }
  } else if (view === 'monster' && now - gameState.monsterStartedAt >= MONSTER_DURATION_MS) {
    showGameOver()
  }
}

function startMonster(now) {
  gameState.currentView = 'monster'
  gameState.monsterStartedAt = now
  gameState.hoveredHotspot = null
  canvas.style.cursor = 'default'
  setMusicMode('off')
  playScream()
  showResult('창문', '쾅! 유리가 산산조각 나며 괴물이 창문으로 뛰어들었다!')
}

function showGameOver() {
  gameState.currentView = 'gameover'
  playFailure()
  showResult('게임 오버', '시간 안에 탈출하지 못했다. 괴물에게 잡아먹혔다.')
  restartButton.hidden = false
  renderScene()
}

// 질문에 정답을 맞혀 출구 문을 통과했을 때 탈출 화면으로 바꿉니다.
function handleEscape() {
  if (gameState.currentView !== 'corridor') return
  gameState.currentView = 'escape'
  gameState.hoveredHotspot = null
  canvas.style.cursor = 'default'
  setMusicMode('off')
  playExitDoor()
  playSuccess(1.6)
  showResult('탈출 성공', '문틈으로 새벽빛이 쏟아진다. 드디어 학교 밖으로 나왔다.')
  restartButton.hidden = false
  renderScene()
}

// 칠판의 숨겨진 문장을 처음 발견했을 때만 기록합니다.
function handleClueFound(clueId) {
  if (gameState.foundClueIds.has(clueId)) return
  gameState.foundClueIds.add(clueId)
  showResult('칠판', '지워진 자국 속에서 숨겨진 문장을 발견했다.')
}

// 캔버스에서 영역을 눌렀을 때 맞는 동작을 실행합니다.
function handleHotspotClick(id) {
  if (id === BACK_ID) {
    returnToClassroom()
  } else if (id === CORRIDOR_WINDOW_ID) {
    showResult('창문', '창밖에서 무언가 쾅쾅 유리를 두드리고 있다. 시간이 얼마 없다.')
  } else if (id === EXIT_ID) {
    riddleDialog.open()
  } else if (id === BLOOD_NOTE_ID) {
    showResult('쪽지', '바닥에 쪽지가 떨어져 있다. 피로 범벅이 되어 있다.')
    bloodNoteDialog.open()
  } else if (id === NOTE_ID) {
    playPaper()
    collectItem(NOTE_ID, '서랍 안에서 수상한 쪽지를 발견했다. 가방에 넣었다.')
  } else if (id === KEY_ID) {
    playKeyJingle()
    collectItem(KEY_ID, '사물함 안에서 작은 열쇠를 찾았다. 가방에 넣었다.')
  } else if (id === 'desk') {
    toggleDrawer()
  } else if (id === 'locker') {
    handleLockerClick()
  } else if (id === 'door') {
    handleDoorClick()
  } else if (id === 'board') {
    inspectObject(id)
    boardDialog.open()
  } else {
    inspectObject(id)
  }
}

// 가방 칸을 눌렀을 때 아이템을 선택하거나 선택을 해제하고, 설명을 보여 줍니다.
function handleSlotClick(index) {
  const itemId = gameState.collectedItemIds[index]
  if (!itemId) return
  const item = findItem(itemId)
  const isSelecting = gameState.selectedItemId !== itemId
  gameState.selectedItemId = isSelecting ? itemId : null
  renderInventory(inventorySlots, gameState.collectedItemIds, gameState.selectedItemId)
  showResult(item.name, isSelecting ? `${item.description} 이 물건을 선택했다.` : item.description)
}

// 화면을 계속 새로 그립니다. 창문 흔들림, 남은 시간 표시, 괴물 연출이 여기서 움직입니다.
function gameLoop(now) {
  updateCorridorTimer(now)
  renderScene(now)
  renderProgress(now)
  requestAnimationFrame(gameLoop)
}

canvas.addEventListener('mousemove', (event) => {
  const hotspot = findHotspotAt(getScenePosition(event))
  const currentId = gameState.hoveredHotspot ? gameState.hoveredHotspot.id : null
  const nextId = hotspot ? hotspot.id : null
  if (nextId === currentId) return

  gameState.hoveredHotspot = hotspot
  canvas.style.cursor = hotspot ? 'pointer' : 'default'
  renderScene()
})

canvas.addEventListener('mouseleave', () => {
  if (gameState.hoveredHotspot === null) return

  gameState.hoveredHotspot = null
  canvas.style.cursor = 'default'
  renderScene()
})

canvas.addEventListener('click', (event) => {
  const hotspot = findHotspotAt(getScenePosition(event))
  if (!hotspot) return
  handleHotspotClick(hotspot.id)
})

inventorySlots.forEach((slot, index) => {
  slot.addEventListener('click', () => handleSlotClick(index))
})

restartButton.addEventListener('click', () => window.location.reload())

window.addEventListener('pointerdown', unlockAudio, { once: true })
setMusicMode('classroom')
setupOpeningScreen()

renderProgress()
renderScene()
renderInventory(inventorySlots, gameState.collectedItemIds, gameState.selectedItemId)
requestAnimationFrame(gameLoop)
