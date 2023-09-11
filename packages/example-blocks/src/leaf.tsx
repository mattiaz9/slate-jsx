import { Text } from "slate"
import { SlateLeaf } from "slate-jsx"

import type { inferLeafElement, RenderLeafProps } from "slate-jsx"

export type LeafElement = inferLeafElement<Leaf>

export class Leaf extends SlateLeaf<{
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strikethrough?: boolean
  code?: boolean
  subscript?: boolean
  superscript?: boolean
}> {
  protected _assert = (node: unknown) => {
    return Text.isText(node)
  }

  render(props: RenderLeafProps<Leaf>) {
    const style = {
      whiteSpace: "pre",
    }
    if (props.leaf.bold) {
      return (
        <strong {...props.attributes} style={style}>
          {props.children}
        </strong>
      )
    }
    if (props.leaf.italic) {
      return (
        <em {...props.attributes} style={style}>
          {props.children}
        </em>
      )
    }
    if (props.leaf.underline) {
      return (
        <u {...props.attributes} style={style}>
          {props.children}
        </u>
      )
    }
    if (props.leaf.strikethrough) {
      return (
        <s {...props.attributes} style={style}>
          {props.children}
        </s>
      )
    }
    if (props.leaf.code) {
      return (
        <code
          {...props.attributes}
          style={{
            ...style,
            "background-color": "hsl(0 0% 50% / 0.2)",
            "border-radius": "0.2em",
          }}
        >
          {props.children}
        </code>
      )
    }
    if (props.leaf.subscript) {
      return (
        <sub {...props.attributes} style={style}>
          {props.children}
        </sub>
      )
    }
    if (props.leaf.superscript) {
      return (
        <sup {...props.attributes} style={style}>
          {props.children}
        </sup>
      )
    }
    return (
      <span {...props.attributes} style={style}>
        {props.children}
      </span>
    )
  }
}
