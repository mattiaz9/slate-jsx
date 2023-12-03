import type { BaseEditor, Path, Point, Range } from "slate"

export function getElementAtPath(path: Path) {
  const node = document.querySelector<HTMLElement>(`[data-slate-path='${JSON.stringify(path)}']`)
  if (!node) {
    throw new Error(`Unable to find element at path: ${JSON.stringify(path)}`)
  }
  return node
}

export function findClosestLeaf(node: globalThis.Node): HTMLElement | null {
  if (node instanceof HTMLElement && node.dataset.slatePath) {
    return node
  }
  if (node.parentElement) {
    return findClosestLeaf(node.parentElement)
  }
  return null
}

export function getCurrentRange() {
  const selection = document.getSelection()

  if (!selection?.anchorNode || !selection.focusNode) {
    return null
  }

  const anchorNode = findClosestLeaf(selection.anchorNode)
  const focusNode = findClosestLeaf(selection.focusNode)

  const anchorPath = anchorNode?.dataset.slatePath
    ? (JSON.parse(anchorNode.dataset.slatePath) as Path)
    : null
  const focusPath = focusNode?.dataset.slatePath
    ? (JSON.parse(focusNode.dataset.slatePath) as Path)
    : null

  if (anchorPath && focusPath) {
    const anchorOffset =
      anchorNode?.textContent?.length === 1 && anchorNode.textContent.charCodeAt(0) === 65279
        ? 0
        : selection.anchorOffset
    const focusOffset =
      focusNode?.textContent?.length === 1 && focusNode.textContent.charCodeAt(0) === 65279
        ? 0
        : selection.focusOffset
    const anchor: Point = {
      path: anchorPath,
      offset: anchorOffset,
    }
    const focus: Point = {
      path: focusPath,
      offset: focusOffset,
    }
    return { anchor, focus } satisfies Range
  }

  return null
}

export function selectionToDOMRange(editor: BaseEditor) {
  if (!editor.selection) return null

  return slateRangeToDOMRange(editor.selection)
}

export function slateRangeToDOMRange(range: Range) {
  const anchor = getElementAtPath(range.anchor.path)
  const focus = getElementAtPath(range.focus.path)

  const anchorNode = Array.from(anchor.childNodes).find(n => n.nodeType === Node.TEXT_NODE)
  const focusNode = Array.from(focus.childNodes).find(n => n.nodeType === Node.TEXT_NODE)

  if (!anchorNode || !focusNode) return null

  const anchorOffset =
    range.anchor.offset <= (anchorNode.textContent ?? "").length
      ? range.anchor.offset
      : (anchorNode.textContent ?? "").length
  const focusOffset =
    range.focus.offset <= (focusNode.textContent ?? "").length
      ? range.focus.offset
      : (focusNode.textContent ?? "").length

  const domRange = document.createRange()
  domRange.setStart(anchorNode, anchorOffset)
  domRange.setEnd(focusNode, focusOffset)

  return domRange
}
