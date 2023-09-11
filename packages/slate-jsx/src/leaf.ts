import type { Path, SlateText } from "slate"
import type { BlockEditor, inferLeafElement, inferLeafProps, LeafConstructor } from "./types"

export interface RenderLeafProps<T extends SlateLeaf<any>> {
  editor: BlockEditor<readonly any[], any>
  leaf: SlateText<inferLeafProps<T>>
  path: Path
  children: JSX.Element | string
  attributes: any
}

export abstract class SlateLeaf<Props> {
  // fix infer not working properly
  protected _props?: Props

  abstract render(props: RenderLeafProps<any>): JSX.Element

  protected _assert: (node: unknown) => boolean = () => false

  static assert<T extends SlateLeaf<any>>(
    this: LeafConstructor<T>,
    node: unknown
  ): node is inferLeafElement<T> {
    return new this()._assert(node)
  }
}
