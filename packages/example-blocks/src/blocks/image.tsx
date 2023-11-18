import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element } from "slate"

import { Leaf } from "../leaf"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"

export type ImageType = inferBlockType<ImageBlock>
export type ImageElement = inferBlockElement<ImageBlock>

export class ImageBlock extends SlateBlock<"img", { src?: string; caption?: string }> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "img"
  }

  constructor() {
    super("img", {
      emptyBlock: {
        type: "img",
        children: [{ text: "" }],
      },
      allowedChildren: [Leaf],
    })
  }

  render(props: RenderElementProps<ImageBlock>) {
    return (
      <span {...props.attributes} style={{ width: "100%" }}>
        <img src={props.element.src} alt={props.element.caption} style={{ width: "100%" }} />
        {props.children}
      </span>
    )
  }
}
