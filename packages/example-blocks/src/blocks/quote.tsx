import { Element } from "slate"
import { SlateBlock } from "slate-jsx"

import { Leaf } from "../leaf"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "slate-jsx"

export type QuoteType = inferBlockType<QuoteBlock>
export type QuoteElement = inferBlockElement<QuoteBlock>

export class QuoteBlock extends SlateBlock<"blockquote", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "blockquote"
  }

  constructor() {
    super("blockquote", {
      emptyBlock: {
        type: "blockquote",
        children: [{ text: "", italic: true }],
      },
      allowedChildren: [Leaf],
    })
  }

  render(props: RenderElementProps<QuoteBlock>): JSX.Element {
    return (
      <blockquote
        {...props.attributes}
        style={{
          "border-left": "4px solid hsl(0 0% 50% / 0.5)",
          padding: "8px",
          "margin-left": "0",
          "margin-right": "0",
        }}
      >
        {props.children}
      </blockquote>
    )
  }
}
