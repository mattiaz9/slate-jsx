import type { BaseEditor, BaseElement, BaseText, NodeEntry } from "slate"
import type { BlockBehaviour, BlockBehaviourTrigger, SlateBlock } from "./block"
import type { SlateLeaf } from "./leaf"

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

export interface ElementBase {
  type: string
  children: SlateDescendant[]
}

export type SlateDescendant = SlateElement<string, any> | SlateText
export type SlateElement<T extends string, Props = Record<string, never>> = ElementBase & {
  type: T
} & Props
export type SlateText<Props = Record<string, never>> = {
  text: string
} & Props

export type BlockConstructor<T, Id extends string> = new (id: Id) => T
export type LeafConstructor<T> = new () => T

export type BlockEditor<T extends readonly SlateBlock<any, any>[], L extends SlateLeaf<{}>> = Omit<
  BaseEditor,
  "children"
> & {
  blocks: T
  children: inferBlocksDescendant<T, L>[]
  indent: () => void
  outdent: () => void
  canExecuteElementCommand: (
    entry: NodeEntry<SlateElement<string>>,
    command: BlockBehaviour<any>
  ) => boolean
  executeElementCommand: (
    entry: NodeEntry<SlateElement<string>>,
    command: BlockBehaviour<any>
  ) => void
  dispatchCommand: (trigger: BlockBehaviourTrigger, next: () => void) => void
}

export type inferBlockType<T extends SlateBlock<any, any>> = T extends SlateBlock<infer Id, any>
  ? Id
  : never

export type inferBlockProps<T extends SlateBlock<any, any>> = T extends SlateBlock<any, infer Props>
  ? Props
  : never

export type inferBlockElement<T extends SlateBlock<any, any>> = Prettify<
  BaseElement & {
    type: inferBlockType<T>
  } & inferBlockProps<T>
>

type inferBlocksDescendantHelper<
  T extends readonly SlateBlock<any, any>[],
  L extends SlateLeaf<any>,
  TFull extends readonly SlateBlock<any, any>[] = T,
> = T extends []
  ? never
  : T extends readonly [infer Head, ...infer Tail]
  ? Head extends SlateBlock<any, any>
    ? Tail extends readonly SlateBlock<any, any>[]
      ?
          | (Omit<inferBlockElement<Head>, "children"> & {
              children: inferBlocksDescendant<TFull, L>[]
            })
          | inferBlocksDescendantHelper<Tail, L, TFull>
      : never
    : never
  : never

export type inferBlocksDescendant<
  T extends readonly SlateBlock<any, any>[],
  L extends SlateLeaf<any>,
> = inferLeafElement<L> | inferBlocksDescendantHelper<T, L>

export type inferLeafProps<T extends SlateLeaf<any>> = T extends SlateLeaf<infer Props>
  ? Props
  : never

export type inferLeafElement<T extends SlateLeaf<any>> = Prettify<BaseText & inferLeafProps<T>>
