import { SlateLeaf } from "@mattiaz9/slate-jsx"
import { Text } from "slate"

import type { inferLeafElement, RenderLeafProps } from "@mattiaz9/slate-jsx"

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
      fontWeight: props.leaf.bold ? "bold" : undefined,
      fontStyle: props.leaf.italic ? "italic" : undefined,
      textDecoration: props.leaf.underline
        ? "underline"
        : props.leaf.strikethrough
        ? "line-through"
        : undefined,
      backgroundColor: props.leaf.code ? "hsl(0 0% 50% / 0.2)" : undefined,
      borderRadius: props.leaf.code ? "0.2em" : undefined,
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
        <code {...props.attributes} style={style}>
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
