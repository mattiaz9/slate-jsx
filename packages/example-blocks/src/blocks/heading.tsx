import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element } from "slate"

import { Leaf } from "../leaf"
import { ParagraphBlock } from "./paragraph"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"

export type HeadingType = inferBlockType<HeadingBlock<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">>
export type HeadingElement = inferBlockElement<
  HeadingBlock<"h1" | "h2" | "h3" | "h4" | "h5" | "h6">
>

export class HeadingBlock<Id extends "h1" | "h2" | "h3" | "h4" | "h5" | "h6"> extends SlateBlock<
  Id,
  {}
> {
  protected _assert = (node: unknown) => {
    return (
      Element.isElement(node) &&
      "type" in node &&
      ["h1", "h2", "h3", "h4", "h5", "h6"].includes(node.type as string)
    )
  }

  constructor(id: Id) {
    super(id, {
      emptyBlock: {
        type: id,
        children: [{ text: "" }],
      },
      allowedChildren: [Leaf],
      behaviours: [
        {
          trigger: "enter",
          action: "replace",
          withBlock: new ParagraphBlock(),
        },
      ],
    })
  }

  render(props: RenderElementProps<HeadingBlock<Id>>): JSX.Element {
    switch (this.id) {
      case "h1":
        return <h1 {...props.attributes}>{props.children}</h1>
      case "h2":
        return <h2 {...props.attributes}>{props.children}</h2>
      case "h3":
        return <h3 {...props.attributes}>{props.children}</h3>
      case "h4":
        return <h4 {...props.attributes}>{props.children}</h4>
      case "h5":
        return <h5 {...props.attributes}>{props.children}</h5>
      case "h6":
        return <h6 {...props.attributes}>{props.children}</h6>
      default:
        return <div {...props.attributes}>{props.children}</div>
    }
  }
}
