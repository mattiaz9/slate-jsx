import { Element } from "slate"
import { SlateBlock } from "slate-jsx"

import { ParagraphBlock } from "./paragraph"
import { TableRowBlock } from "./table-row"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "slate-jsx"

export type TableType = inferBlockType<TableBlock>
export type TableElement = inferBlockElement<TableBlock>

export class TableBlock extends SlateBlock<"table", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "table"
  }

  constructor() {
    super("table", {
      emptyBlock: {
        type: "table",
        children: [new ParagraphBlock().emptyBlock],
      },
      allowedChildren: [TableRowBlock.withId("tr")],
    })
  }

  render(props: RenderElementProps<TableBlock>): JSX.Element {
    return (
      <table
        {...props.attributes}
        style={{ width: "100%", "table-layout": "fixed", "border-collapse": "collapse" }}
      >
        <tbody>{props.children}</tbody>
      </table>
    )
  }
}
