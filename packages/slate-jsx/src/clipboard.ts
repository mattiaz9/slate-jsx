import { Editor, Node, Range, Transforms } from "slate"

import { selectionToDOMRange } from "./dom"

import type { BlockEditor } from "./types"

const SLATE_MIME_TYPE = "application/x-slate-fragment"

export function copyFragment(editor: BlockEditor<any, any>, data: DataTransfer) {
  const { selection } = editor

  if (!selection || Range.isCollapsed(selection)) return

  // fragments
  const fragment = editor.getFragment()
  const string = JSON.stringify(fragment)
  const encoded = window.btoa(encodeURIComponent(string))
  data.setData(SLATE_MIME_TYPE, encoded)
  // html
  const domRange = selectionToDOMRange(editor)
  if (domRange) {
    const contents = domRange.cloneContents()
    const div = contents.ownerDocument.createElement("div")
    div.appendChild(contents)
    div.setAttribute("hidden", "true")
    contents.ownerDocument.body.appendChild(div)
    data.setData("text/html", div.innerHTML)
    // text
    data.setData("text/plain", getPlainText(div))
  }
}

export function cutFragment(editor: BlockEditor<any, any>, data: DataTransfer) {
  copyFragment(editor, data)

  const { selection } = editor

  if (selection) {
    if (Range.isExpanded(selection)) {
      Editor.deleteFragment(editor)
    } else {
      const node = Node.parent(editor, selection.anchor.path)
      if (Editor.isVoid(editor, node)) {
        Transforms.delete(editor)
      }
    }
  }
}

export function pasteFragment(editor: BlockEditor<any, any>, data: DataTransfer) {
  const fragment = parseSlateFragment(data)
  if (fragment) {
    editor.insertFragment(fragment)
    return
  }

  const text = data.getData("text/plain")

  if (text) {
    const lines = text.split(/\r\n|\r|\n/)
    let split = false
    for (const line of lines) {
      if (split) {
        Transforms.splitNodes(editor, { always: true })
      }
      editor.insertText(line)
      split = true
    }
  }
}

export function parseSlateFragment(data: DataTransfer) {
  let fragmentData = data.getData(SLATE_MIME_TYPE)

  if (!fragmentData) {
    const htmlData = data.getData("text/html")
    if (htmlData) {
      const [, fragment] = /data-slate-fragment="(?<name>.+?)"/m.exec(htmlData) || []
      fragmentData = fragment ?? ""
    }
  }

  if (fragmentData) {
    const decoded = decodeURIComponent(window.atob(fragmentData))
    const parsed = JSON.parse(decoded) as Node[]
    return parsed
  }

  return null
}

export function getPlainText(domNode: globalThis.Node) {
  let text = ""
  domNode.nodeType

  // text node
  if (domNode.nodeType === 3 && domNode.nodeValue) {
    return domNode.nodeValue
  }
  // element node
  if (domNode.nodeType === 1) {
    const el = domNode as HTMLElement
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode)
    }

    const display = getComputedStyle(el).getPropertyValue("display")

    if (display === "block" || display === "list" || el.tagName === "BR") {
      text += "\n"
    }
  }

  return text
}
