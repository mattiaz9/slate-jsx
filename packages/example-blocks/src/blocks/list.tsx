import { Element } from "slate"
import { SlateBlock } from "slate-jsx"

import { ListItemBlock } from "./list-item"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "slate-jsx"

export type ListType = inferBlockType<ListBlock<"ol" | "ul">>
export type ListElement = inferBlockElement<ListBlock<"ol" | "ul">>

export class ListBlock<Id extends "ol" | "ul"> extends SlateBlock<Id, {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && ["ol", "ul"].includes(node.type as string)
  }

  constructor(id: Id, level = 0) {
    super(id, {
      emptyBlock: {
        type: id,
        children: [new ListItemBlock("li", level).emptyBlock],
      },
      allowedChildren: [ListItemBlock.withId("li"), ListBlock.withId("ol"), ListBlock.withId("ul")],
    })
  }

  render(props: RenderElementProps<ListBlock<Id>>): JSX.Element {
    switch (this.id) {
      case "ol":
        return (
          <ol {...props.attributes} style={{ paddingLeft: 0, listStylePosition: "inside" }}>
            {props.children}
          </ol>
        )
      case "ul":
        return (
          <ul {...props.attributes} style={{ paddingLeft: 0, listStylePosition: "inside" }}>
            {props.children}
          </ul>
        )
      default:
        return <div {...props.attributes}>{props.children}</div>
    }
  }
}
