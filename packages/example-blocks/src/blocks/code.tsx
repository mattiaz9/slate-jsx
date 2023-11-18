import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element } from "slate"

import { ParagraphBlock } from "./paragraph"

import type { inferBlockElement, inferBlockType, RenderElementProps } from "@mattiaz9/slate-jsx"

export type CodeType = inferBlockType<CodeBlock>
export type CodeElement = inferBlockElement<CodeBlock>

export class CodeBlock extends SlateBlock<"code", {}> {
  protected _assert = (node: unknown) => {
    return Element.isElement(node) && "type" in node && node.type === "code"
  }

  constructor() {
    super("code", {
      emptyBlock: {
        type: "code",
        children: [{ type: "p", children: [{ text: "" }] }],
      },
      allowedChildren: [ParagraphBlock.withId("p")],
    })
  }

  render(props: RenderElementProps<CodeBlock>) {
    return (
      <code
        {...props.attributes}
        style={{
          display: "block",
          padding: "8px",
          "border-radius": "4px",
          "background-color": "hsl(0 0% 50% / 0.1)",
          "white-space": "pre-wrap",
        }}
      >
        {props.children}
      </code>
    )
  }
}
