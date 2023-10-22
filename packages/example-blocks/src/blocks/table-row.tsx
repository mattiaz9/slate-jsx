import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Editor, Element, Point, Range, Text, Transforms } from "slate"

import { ParagraphBlock } from "./paragraph"
import { TableCellBlock } from "./table-cell"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"
import type { BaseText } from "slate"

export type TableRowType = inferBlockType<TableRowBlock>
export type TableRowElement = inferBlockElement<TableRowBlock>

export class TableRowBlock extends SlateBlock<"tr", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "tr"
  }

  constructor() {
    super("tr", {
      emptyBlock: {
        type: "tr",
        children: [new ParagraphBlock().emptyBlock],
      },
      allowedChildren: [TableCellBlock.withId("td"), TableCellBlock.withId("th")],
      behaviours: [
        {
          trigger: ["backspace", "del"],
          action: "stop",
          when: ({ editor }) => {
            if (editor.selection && Range.isExpanded(editor.selection)) {
              const entries = Array.from(
                Editor.nodes<BaseText>(editor, {
                  match: n => Text.isText(n),
                  mode: "all",
                })
              )

              const higherPoint = Point.isBefore(editor.selection.anchor, editor.selection.focus)
                ? editor.selection.anchor
                : editor.selection.focus
              const lowerPoint = Point.isBefore(editor.selection.anchor, editor.selection.focus)
                ? editor.selection.focus
                : editor.selection.anchor

              Editor.withoutNormalizing(editor, () => {
                for (const [i, entry] of entries.entries()) {
                  const [node, path] = entry
                  const startOffset = i === 0 ? higherPoint.offset : 0
                  const endOffset = i === entries.length - 1 ? lowerPoint.offset : node.text.length

                  if (startOffset !== endOffset) {
                    Transforms.delete(editor, {
                      at: {
                        anchor: {
                          path,
                          offset: startOffset,
                        },
                        focus: {
                          path,
                          offset: endOffset,
                        },
                      },
                    })
                  }
                }
              })

              return true
            }
            return false
          },
        },
      ],
    })
  }

  render(props: RenderElementProps<TableRowBlock>): JSX.Element {
    return <tr {...props.attributes}>{props.children}</tr>
  }
}
