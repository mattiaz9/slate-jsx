import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Editor, Element, Path, Range } from "slate"

import { ParagraphBlock } from "./paragraph"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"

export type SnippetType = inferBlockType<SnippetBlock>
export type SnippetElement = inferBlockElement<SnippetBlock>

export class SnippetBlock extends SlateBlock<"snippet", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "snippet"
  }

  constructor() {
    super("snippet", {
      emptyBlock: {
        type: "snippet",
        children: [new ParagraphBlock().emptyBlock],
      },
      allowedChildren: [ParagraphBlock.withId("p")],
      behaviours: [
        {
          trigger: "enter",
          action: "move",
          when: ({ editor, element, path }) => {
            const lastPreviuosChildPath = [...path, element.children.length - 2]
            const lastChildPath = [...path, element.children.length - 1]

            if (!editor.selection || !Range.isCollapsed(editor.selection)) return false
            if (!Path.isAncestor(lastChildPath, editor.selection.focus.path)) return false

            // last 2 lines are empty
            if (element.children.length < 2) return false
            const last2Paths = [lastPreviuosChildPath, lastChildPath]
            return last2Paths.every(p => Editor.string(editor, p) === "")
          },
          target: ({ element, path }) => {
            const lastChildPath = [...path, element.children.length - 1]
            return lastChildPath
          },
          to: ({ path }) => {
            return Path.next(path)
          },
        },
      ],
    })
  }

  render(props: RenderElementProps<SnippetBlock>): JSX.Element {
    return (
      <section
        {...props.attributes}
        style={{
          "border-radius": "8px",
          "background-color": `hsl(0 0% 50% / 0.25)`,
        }}
      >
        {props.children}
      </section>
    )
  }
}
