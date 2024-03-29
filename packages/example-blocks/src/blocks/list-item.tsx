import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element, Range, Text, Transforms } from "slate"

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
          when: ({ editor, element, tree }) => {
            if (!editor.selection || !Range.isCollapsed(editor.selection)) return false
            const isOnlyChild =
              tree.flatMap(([entry]) =>
                Element.isElement(entry) ? entry.children.filter(c => ListItemBlock.assert(c)) : []
              ).length === 1
            // check if the current list item is empty
            return (
              !isOnlyChild &&
              element.children.length === 1 &&
              Text.isText(element.children[0]) &&
              element.children[0].text === ""
            )
          },
          target: ({ tree }) => {
            // the root list block
            const reversedTree = [...tree].reverse()
            const path = reversedTree.find(([entry]) => ListBlock.assert(entry))?.[1]
            return path
          },
        },
        {
          trigger: ["enter", "backspace"],
          action: "replace",
          withBlock: new ParagraphBlock(),
          when: ({ editor, element, tree }) => {
            if (!editor.selection || !Range.isCollapsed(editor.selection)) return false
            const isOnlyChild =
              tree.flatMap(([entry]) =>
                ListBlock.assert(entry) ? entry.children.filter(c => ListItemBlock.assert(c)) : []
              ).length === 1
            // check if the current list item is empty
            return (
              isOnlyChild &&
              element.children.length === 1 &&
              Text.isText(element.children[0]) &&
              element.children[0].text === ""
            )
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
