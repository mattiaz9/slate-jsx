import { Element } from "slate"
import { SlateBlock } from "slate-jsx"

import { Leaf } from "../leaf"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "slate-jsx"

export type ParagraphType = inferBlockType<ParagraphBlock>
export type ParagraphElement = inferBlockElement<ParagraphBlock>

export class ParagraphBlock extends SlateBlock<"p", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "p"
  }

  constructor() {
    super("p", {
      emptyBlock: {
        type: "p",
        children: [{ text: "" }],
      },
      allowedChildren: [Leaf],
    })
  }

  render(props: RenderElementProps<ParagraphBlock>): JSX.Element {
    return <p {...props.attributes}>{props.children}</p>
  }
}
