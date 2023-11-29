import { Editor, Element, Range, Transforms } from "slate"

import { copyFragment, cutFragment, pasteFragment } from "./clipboard"
import { getCurrentRange, selectionToDOMRange } from "./dom"
import { createEditor } from "./editor"

import type { Path } from "slate"
import type { SlateBlock } from "./block"
import type { SlateLeaf } from "./leaf"
import type { inferBlocksDescendant, SlateDescendant } from "./types"

export type EditorSetup<
  TBlocks extends readonly SlateBlock<any, any>[],
  TLeaf extends SlateLeaf<any>,
> = {
  defaultValue: inferBlocksDescendant<TBlocks, TLeaf>[]
  blocks: TBlocks
  leaf: TLeaf
  renderToString: (input: any) => Promise<string> | string
  hydrate: (input: any, container: HTMLElement) => void
  h: (type: string, children?: any) => JSX.Element
}

const options = {
  isComposing: false,
}

export function initSlate<const T extends readonly SlateBlock<any, any>[], L extends SlateLeaf<{}>>(
  element: HTMLElement,
  setup: EditorSetup<T, L>
) {
  const { defaultValue, blocks, leaf, renderToString, hydrate, h } = setup

  const editor = createEditor<T, L>(blocks, leaf)
  editor.blocks = blocks
  editor.children = defaultValue

  async function renderEditor() {
    const tree = h("div", renderTree(editor, editor.children as SlateDescendant[], [], leaf))
    const html = await renderToString(tree)
    element.innerHTML = html

    hydrate(tree, element)
  }

  async function rehydrate(path: Path) {
    const nodeEl = document.querySelector(`[data-slate-path="${JSON.stringify(path)}"]`)
    if (!nodeEl) return

    const node = Editor.node(editor, path)[0]

    const html = await renderToString(renderElement(editor, node, path, leaf))

    if (nodeEl.parentNode) {
      nodeEl.outerHTML = html

      const tree = h("div", renderTree(editor, editor.children as SlateDescendant[], [], leaf))
      hydrate(tree, element)
    }
  }

  function restoreCursor() {
    if (editor.selection) {
      const range = selectionToDOMRange(editor)
      const docSelection = document.getSelection()
      if (range && docSelection) {
        docSelection.removeAllRanges()
        docSelection.addRange(range)
      }
    }
  }

  editor.onChange = op => {
    if (!op?.operation) return
    if (op.operation.type === "set_selection") return

    const isInlineOperation =
      op.operation.type === "insert_text" ||
      op.operation.type === "remove_text" ||
      op.operation.type === "set_node"

    if (isInlineOperation) {
      rehydrate(op.operation.path).then(restoreCursor).catch(console.error)
    } else {
      renderEditor().then(restoreCursor).catch(console.error)
    }
  }

  element.contentEditable = "true"
  element.style.outline = "none"
  element.style.zIndex = "-1"
  element.onkeydown = e => {
    // tabs
    if (e.key === "Tab" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault()
      if (e.shiftKey) {
        editor.outdent()
      } else {
        editor.indent()
      }
    }
  }
  element.onbeforeinput = e => {
    e.preventDefault()

    const type = e.inputType

    // COMPAT: If the selection is expanded, even if the command seems like
    // a delete forward/backward command it should delete the selection.
    if (editor.selection && Range.isExpanded(editor.selection) && type.startsWith("delete")) {
      const direction = type.endsWith("Backward") ? "backward" : "forward"
      Editor.deleteFragment(editor, { direction })
      return
    }

    switch (type) {
      case "deleteByComposition":
      case "deleteByCut":
      case "deleteByDrag": {
        Editor.deleteFragment(editor)
        break
      }

      case "deleteContent":
      case "deleteContentForward": {
        Editor.deleteForward(editor)
        break
      }

      case "deleteContentBackward": {
        Editor.deleteBackward(editor)
        break
      }

      case "deleteEntireSoftLine": {
        Editor.deleteBackward(editor, { unit: "line" })
        Editor.deleteForward(editor, { unit: "line" })
        break
      }

      case "deleteHardLineBackward": {
        Editor.deleteBackward(editor, { unit: "block" })
        break
      }

      case "deleteSoftLineBackward": {
        Editor.deleteBackward(editor, { unit: "line" })
        break
      }

      case "deleteHardLineForward": {
        Editor.deleteForward(editor, { unit: "block" })
        break
      }

      case "deleteSoftLineForward": {
        Editor.deleteForward(editor, { unit: "line" })
        break
      }

      case "deleteWordBackward": {
        Editor.deleteBackward(editor, { unit: "word" })
        break
      }

      case "deleteWordForward": {
        Editor.deleteForward(editor, { unit: "word" })
        break
      }

      case "insertLineBreak":
        Editor.insertSoftBreak(editor)
        break

      case "insertParagraph": {
        Editor.insertBreak(editor)
        break
      }

      case "insertFromComposition":
      case "insertFromDrop":
      case "insertFromPaste":
      case "insertFromYank":
      case "insertReplacementText":
      case "insertText": {
        if (type === "insertFromComposition") {
          // COMPAT: in Safari, `compositionend` is dispatched after the
          // `beforeinput` for "insertFromComposition". But if we wait for it
          // then we will abort because we're still composing and the selection
          // won't be updated properly.
          // https://www.w3.org/TR/input-events-2/
          if (options.isComposing) {
            options.isComposing = false
          }
        }

        const data = e.dataTransfer || e.data || undefined

        // use a weak comparison instead of 'instanceof' to allow
        // programmatic access of paste events coming from external windows
        // like cypress where cy.window does not work realibly
        if (data?.constructor.name === "DataTransfer") {
          pasteFragment(editor, data as DataTransfer)
        } else if (typeof data === "string") {
          Editor.insertText(editor, data)
        }

        break
      }
    }
  }
  element.onfocus = () => {
    setTimeout(() => {
      const range = getCurrentRange()
      if (range) {
        Transforms.select(editor, range)
      }
    }, 10)
  }
  element.oncopy = e => {
    e.preventDefault()
    e.stopPropagation()
    e.clipboardData && copyFragment(editor, e.clipboardData)
  }
  element.oncut = e => {
    e.preventDefault()
    e.stopPropagation()
    e.clipboardData && cutFragment(editor, e.clipboardData)
  }
  element.onpaste = e => {
    e.preventDefault()
    e.stopPropagation()
    e.clipboardData && pasteFragment(editor, e.clipboardData)
  }
  document.addEventListener("selectionchange", () => {
    const range = getCurrentRange()
    if (range) {
      Transforms.setSelection(editor, range)
    }
  })

  renderEditor().catch(err => {
    console.error(err)
  })

  return editor
}

function renderTree(
  editor: ReturnType<typeof createEditor>,
  elements: SlateDescendant[],
  path: Path,
  leaf: SlateLeaf<any>
): (JSX.Element | null)[] {
  const children = elements.map((element, index) =>
    renderElement(editor, element, [...path, index], leaf)
  )
  return children
}

function renderElement(
  editor: ReturnType<typeof createEditor>,
  element: SlateDescendant,
  path: Path,
  leaf: SlateLeaf<any>
): JSX.Element | null {
  if (Element.isElement(element)) {
    const block = editor.blocks.find(b => "type" in element && b.id === element.type)

    if (!block) return null

    return block.render({
      editor,
      element: element as any,
      path,
      attributes: {
        "data-slate-node": "element",
        "data-slate-void": editor.isVoid(element) ? true : undefined,
        "data-slate-inline": editor.isInline(element) ? true : undefined,
        "data-slate-path": JSON.stringify(path),
        contenteditable: editor.isVoid(element) ? false : undefined,
      },
      children: renderTree(editor, element.children, path, leaf) as any,
    })
  }
  return leaf.render({
    editor,
    leaf: element,
    path,
    attributes: {
      "data-slate-node": "text",
      "data-slate-path": JSON.stringify(path),
    },
    children: element.text || "\uFEFF",
  })
}
