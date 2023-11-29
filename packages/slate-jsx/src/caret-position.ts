const baseRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
} as DOMRect

export class CaretPosition {
  range: Range | null = null
  rect = baseRect

  constructor(target: HTMLElement) {
    this.updateRect()

    const update = () => {
      const selection = document.getSelection()

      this.range = selection?.rangeCount ? selection.getRangeAt(0) : null

      this.updateRect()
    }

    setTimeout(() => {
      target.addEventListener("mouseup", update)
      target.addEventListener("keydown", update)
      target.addEventListener("keyup", update)
      document.querySelector("#main-content")?.addEventListener("scroll", update)
    }, 500)
  }

  updateRect() {
    if (this.range) {
      this.rect = this.range.getBoundingClientRect()
    } else {
      this.rect = baseRect
    }

    this.rectChangedCallback(this.rect)
  }

  rectChangedCallback(_rect: DOMRect) {
    // Abstract to be implemented
  }

  getBoundingClientRect() {
    return this.rect
  }

  get clientWidth() {
    return this.rect.width
  }

  get clientHeight() {
    return this.rect.height
  }
}
