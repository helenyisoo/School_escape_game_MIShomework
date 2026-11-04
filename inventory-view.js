import { findItem } from './item-data.js'

// 가방 칸들을 획득한 아이템 목록에 맞게 다시 그립니다.
// slots: 가방 칸 요소들, itemIds: 획득한 아이템 id 목록 (얻은 순서대로), selectedItemId: 지금 선택된 아이템 id
export function renderInventory(slots, itemIds, selectedItemId) {
  slots.forEach((slot, index) => {
    slot.replaceChildren()
    const itemId = itemIds[index]
    slot.classList.toggle('selected', Boolean(itemId) && itemId === selectedItemId)
    if (!itemId) {
      slot.classList.remove('filled')
      slot.setAttribute('aria-label', '빈 칸')
      return
    }

    const item = findItem(itemId)
    const icon = document.createElement('canvas')
    icon.width = 16
    icon.height = 16
    icon.className = 'item-icon'
    item.drawIcon(icon.getContext('2d'))

    slot.append(icon)
    slot.classList.add('filled')
    slot.setAttribute('aria-label', item.name)
  })
}
