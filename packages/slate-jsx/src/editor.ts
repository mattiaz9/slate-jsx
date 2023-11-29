import { createEditor as createSlateEditor, Editor, Element, Path, Text, Transforms } from "slate"

import { SlateBlock } from "./block"
import { SlateLeaf } from "./leaf"

import type { Node, NodeEntry, SlateElement } from "slate"
import type { BlockBehaviour, BlockBehaviourFuncContext, BlockBehaviourTrigger } from "./block"
import type { BlockEditor } from "./types"

export function createEditor<
  const T extends readonly SlateBlock<any, any>[],
  L extends SlateLeaf<{}>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(blocks: T, leaf: L) {
  const editor = createSlateEditor() as BlockEditor<T, L>

  const {
    normalizeNode,
    isInline,
    isVoid,
    insertBreak,
    deleteBackward,
    deleteForward,
    delete: del,
  } = editor

  function isElement(node: Node): node is SlateElement<string, unknown> {
    return Element.isElement(node) && !Editor.isEditor(node) && "type" in node
  }

  let isDispatching = false

  editor.isInline = element => {
    if (Element.isElement(element) && "type" in element) {
      const block = editor.blocks.find(b => b.id === element.type)
      if (block) {
        return block.options.isInline ?? false
      }
    }
    return isInline(element)
  }
  editor.isVoid = element => {
    if (Element.isElement(element) && "type" in element) {
      const block = editor.blocks.find(b => b.id === element.type)
      if (block) {
        return block.options.isVoid ?? false
      }
    }
    return isVoid(element)
  }
  editor.canExecuteElementCommand = (
    entry: NodeEntry<SlateElement<string>>,
    command: BlockBehaviour<any>
  ) => {
    const [element, path] = entry
    const tree = Array.from(
      Editor.levels(editor, {
        at: Path.parent(path),
        reverse: true,
      })
    )
    const ctx = { editor, element, path, tree } satisfies BlockBehaviourFuncContext<any>
    const shouldRun = command.when?.(ctx) ?? true

    return shouldRun
  }
  editor.executeElementCommand = (
    entry: NodeEntry<SlateElement<string>>,
    command: BlockBehaviour<any>
  ) => {
    const [element, path] = entry
    const tree = Array.from(
      Editor.levels(editor, {
        at: Path.parent(path),
        reverse: true,
      })
    )
    const ctx = { editor, element, path, tree } satisfies BlockBehaviourFuncContext<any>
    executeCommand(command, ctx)
  }
  editor.dispatchCommand = (trigger: BlockBehaviourTrigger, next: () => void) => {
    if (isDispatching) {
      next()
      return
    }

    isDispatching = true

    const { selection } = editor

    let hasSomeRuns = false

    if (selection) {
      const entries = Array.from(
        Editor.nodes<SlateElement<any>>(editor, {
          match: n => {
            return isElement(n) && blocks.some(b => b.id === n.type && b.options.behaviours?.length)
          },
          mode: "all",
          at: selection,
        })
      )
      for (const entry of entries) {
        const [element] = entry

        if (isElement(element)) {
          const block = editor.blocks.find(b => b.id === element.type)
          const commands = (
            block?.options.behaviours?.filter(b =>
              typeof b.trigger === "string" ? b.trigger === trigger : b.trigger.includes(trigger)
            ) ?? []
          ).filter(c => editor.canExecuteElementCommand(entry, c))
          for (const command of commands) {
            editor.executeElementCommand(entry, command)
            hasSomeRuns = true
          }
        }
      }
    }

    isDispatching = false

    if (!hasSomeRuns) {
      next()
    }
  }
  editor.insertBreak = () => {
    editor.dispatchCommand("enter", () => {
      insertBreak()
    })
  }
  editor.delete = opts => {
    editor.dispatchCommand("backspace", () => {
      del(opts)
    })
  }
  editor.deleteBackward = unit => {
    editor.dispatchCommand("backspace", () => {
      deleteBackward(unit)
    })
  }
  editor.deleteForward = unit => {
    editor.dispatchCommand("del", () => {
      deleteForward(unit)
    })
  }
  editor.indent = () => {
    editor.dispatchCommand("indent", () => {
      Editor.insertText(editor, "\u2003".toString())
    })
  }
  editor.outdent = () => {
    editor.dispatchCommand("outdent", () => {
      const { selection } = editor
      if (selection) {
        const [prev] = Editor.nodes(editor, {
          match: n => Text.isText(n) && n.text.endsWith("\u2003".toString()),
          mode: "lowest",
          at: selection,
          reverse: true,
        })
        if (prev) {
          editor.deleteBackward("character")
        }
      }
    })
  }
  editor.normalizeNode = (entry, opts) => {
    const [node, path] = entry

    if (isElement(node)) {
      const block = editor.blocks.find(b => b.id === node.type)

      if (!block) return

      // run normalization commands
      const normalizeCommands = (block.options.behaviours ?? []).filter(
        b => b.trigger === "normalize"
      )
      if (normalizeCommands.length) {
        for (const command of normalizeCommands) {
          editor.executeElementCommand(entry as NodeEntry<SlateElement<any>>, command)
        }
      }
      // run allowed children filter
      if (Array.isArray(block.options.allowedChildren)) {
        // filter children
        const children = [...node.children]
        for (let i = children.length - 1; i >= 0; i--) {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          const child = children[i]!
          let remove = false
          if (isElement(child)) {
            remove = !block.options.allowedChildren.some(
              allowedBlock =>
                allowedBlock.prototype instanceof SlateBlock &&
                "id" in allowedBlock &&
                allowedBlock.id === child.type
            )
          }
          if (Text.isText(child)) {
            remove = !block.options.allowedChildren.some(
              allowedBlock => allowedBlock.prototype instanceof SlateLeaf
            )
          }
          if (remove) {
            if (children.length === 1) {
              Transforms.removeNodes(editor, { at: path })
            } else {
              Transforms.removeNodes(editor, { at: [...path, i] })
              children.splice(i, 1)
            }
          }
        }
      }
    }

    normalizeNode(entry, opts)
  }

  return editor
}

function executeCommand(command: BlockBehaviour<any>, ctx: BlockBehaviourFuncContext<any>): void {
  const { editor, path } = ctx

  switch (command.action) {
    case "stop": {
      return
    }
    case "split": {
      const targetPath = typeof command.target === "function" ? command.target(ctx) ?? path : path
      const FallbackBlock = editor.blocks
        .find((b: SlateBlock<string, any>) => b.id === ctx.element.type)
        ?.options.allowedChildren?.find((b: any) => b.prototype instanceof SlateBlock)
      const withElement =
        command.withBlock?.emptyBlock ?? (FallbackBlock ? new FallbackBlock("_").emptyBlock : null)
      const nextPath = Path.next(targetPath)

      Transforms.removeNodes(editor, { at: path })

      Editor.withoutNormalizing(editor, () => {
        let nextSplitPath = path
        while (
          Path.isDescendant(nextSplitPath, Path.parent(targetPath)) &&
          !Path.equals(nextSplitPath, [])
        ) {
          const exists = Editor.hasPath(editor, nextSplitPath)

          if (!exists) {
            break
          }

          Transforms.splitNodes(editor, {
            at: nextSplitPath,
          })
          nextSplitPath = Path.parent(nextSplitPath)
          nextSplitPath = Path.equals(nextSplitPath, []) ? nextSplitPath : Path.next(nextSplitPath)
        }

        if (withElement) {
          Transforms.insertNodes(editor, withElement, { at: nextPath })
          Transforms.select(editor, [...nextPath, 0])
        }
      })

      return
    }
    case "append": {
      const targetPath = typeof command.target === "function" ? command.target(ctx) ?? path : path
      const withBlock = command.withBlock

      if (withBlock) {
        Transforms.insertNodes(editor, withBlock.emptyBlock, { at: Path.next(targetPath) })
        Transforms.select(editor, Path.next(targetPath))
      }

      return
    }
    case "replace": {
      const targetPath = typeof command.target === "function" ? command.target(ctx) ?? path : path
      const withBlock = command.withBlock

      if (withBlock) {
        Transforms.insertNodes(editor, withBlock.emptyBlock, { at: Path.next(targetPath) })
        Transforms.select(editor, Path.next(targetPath))
        Transforms.delete(editor, { at: targetPath })
      }

      return
    }
    case "move": {
      const targetPath = typeof command.target === "function" ? command.target(ctx) ?? path : path

      const toPath = command.to(ctx)

      Transforms.moveNodes(editor, {
        at: targetPath,
        to: toPath,
      })
      Transforms.select(editor, toPath)

      return
    }
    default: {
      command.action(ctx)
    }
  }
}
