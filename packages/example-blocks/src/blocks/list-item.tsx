import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element, Range, Transforms } from "slate"

import { Leaf } from "../leaf"
import { ListBlock } from "./list"
import { ParagraphBlock } from "./paragraph"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"

export type ListItemType = inferBlockType<ListItemBlock>
export type ListItemElement = inferBlockElement<ListItemBlock>

export class ListItemBlock extends SlateBlock<"li", { level: number }> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "li"
  }

  constructor(id = "li" as const, level = 0) {
    super(id, {
      emptyBlock: {
        type: "li",
        level,
        children: [{ text: "" }],
      },
      allowedChildren: [Leaf],
      behaviours: [
        {
          trigger: ["enter", "backspace"],
          action: "split",
          withBlock: new ParagraphBlock(),
          when: ({ editor, element }) => {
            if (!editor.selection || !Range.isCollapsed(editor.selection)) return false
            // check if the current list item is empty
            return element.children.length === 1 && element.children[0].text === ""
          },
          target: ({ tree }) => {
            // the root list block
            const reversedTree = [...tree].reverse()
            const path = reversedTree.find(([entry]) => ListBlock.assert(entry))?.[1]
            return path
          },
        },
        {
          trigger: "indent",
          withBlock: null,
          action: ({ editor, element }) => {
            Transforms.setNodes(editor, { level: element.level + 1 } as Partial<ListItemElement>)
          },
        },
        {
          trigger: "outdent",
          withBlock: null,
          action: ({ editor, element }) => {
            Transforms.setNodes(editor, {
              level: Math.max(0, element.level - 1),
            } as Partial<ListItemElement>)
          },
        },
      ],
    })
  }

  render(props: RenderElementProps<ListItemBlock>): JSX.Element {
    return (
      <li {...props.attributes} style={{ paddingLeft: `${20 * props.element.level}px` }}>
        {props.children}
      </li>
    )
  }
}
