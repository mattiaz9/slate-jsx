import type { NodeEntry, Path, SlateElement } from "slate"
import type { SlateLeaf } from "./leaf"
import type {
  BlockConstructor,
  BlockEditor,
  inferBlockElement,
  inferBlockProps,
  inferBlockType,
  Prettify,
} from "./types"

export interface SlateBlockWithId<Id extends string> extends SlateBlock<Id, any> {
  id: Id
}

export interface RenderElementProps<T extends SlateBlock<any, any>> {
  editor: BlockEditor<readonly any[], SlateLeaf<{}>>
  element: SlateElement<inferBlockType<T>, inferBlockProps<T>>
  path: Path
  children: JSX.Element | string
  attributes: any
}

export interface SlateBlockOptions<Id extends string, Props> {
  isVoid?: boolean
  isInline?: boolean
  /**
   * Specify the initial block structure
   */
  emptyBlock: SlateElement<Id, Props>
  /**
   * List of block types that can be inserted after this block.
   * If not specified, any block can be inserted.
   * If empty, only text leaft is allowed.
   */
  allowedChildren?: ((typeof SlateBlock<any, any> & { id: any }) | typeof SlateLeaf<any>)[]
  /**
   * List of behaviours to apply to the block.
   */
  behaviours?: BlockBehaviour<SlateBlock<Id, Props>>[]
}

export type BlockBehaviourTrigger =
  | "enter"
  | "backspace"
  | "del"
  | "space"
  | "indent"
  | "outdent"
  | "normalize"

export interface BlockBehaviourFuncContext<T extends SlateBlock<any, any>> {
  editor: BlockEditor<readonly any[], SlateLeaf<{}>>
  /**
   * Current block
   */
  element: SlateElement<inferBlockType<T>, inferBlockProps<T>>
  /**
   * Path of the current block
   */
  path: Path
  /**
   * Nodes parent tree from the lowest to the highest.
   * The first element is the closest parent to the current block.
   */
  tree: NodeEntry[]
}

interface BlockBehaviourBase<T extends SlateBlock<any, any>> {
  /**
   * Trigger to apply the command
   */
  trigger: BlockBehaviourTrigger | BlockBehaviourTrigger[]
  /**
   * A custom condition to execute the command. If `undefined` the command is always executed.
   * @param ctx - Current context
   * @returns `true` to execute the command, `false` otherwise
   */
  when?: (ctx: BlockBehaviourFuncContext<T>) => boolean
}

interface BlockBehaviourExecutable<T extends SlateBlock<any, any>> {
  /**
   * Target block to apply the command. When `undefined` the current block is used.
   * @param ctx - Current context
   * @returns The target path
   */
  target?: ((ctx: BlockBehaviourFuncContext<T>) => Path | undefined) | undefined
}

export type BlockBehaviour<T extends SlateBlock<any, any>> = Prettify<
  BlockBehaviourBase<T> &
    (
      | {
          /**
           * Command to execute:
           *  - `stop`: stop the default behaviour
           *  - `split`: split the target block
           *  - `replace`: replace the target block
           *  - `move`: move the target block
           *  - execute a custom function
           */
          action: "stop"
        }
      | ({
          /**
           * Command to execute:
           *  - `stop`: stop the default behaviour
           *  - `split`: split the target block
           *  - `replace`: replace the target block
           *  - `append`: append next to target block
           *  - `move`: move the target block
           *  - execute a custom function
           */
          action: "split" | "replace" | "append" | ((ctx: BlockBehaviourFuncContext<T>) => void)
        } & BlockBehaviourExecutable<T> & {
            /**
             * The element used in the action.
             * This should always be defined, unless the action is `stop`.
             * The element is usually a paragraph, but it can be any block.
             */
            withBlock: SlateBlock<any, any> | null
          })
      | ({
          /**
           * Command to execute:
           *  - `stop`: stop the default behaviour
           *  - `split`: split the target block
           *  - `replace`: replace the target block
           *  - `move`: move the target block
           *  - execute a custom function
           */
          action: "move"
        } & BlockBehaviourExecutable<T> & {
            /**
             * Where to move the `target` block.
             * @param ctx - Current context
             * @returns The target path
             */
            to: (ctx: BlockBehaviourFuncContext<T>) => Path
          })
    )
>

export abstract class SlateBlock<Id extends string, Props> {
  public emptyBlock: SlateElement<Id, Props>

  constructor(
    public id: Id,
    public options: SlateBlockOptions<Id, Props>
  ) {
    this.emptyBlock = options.emptyBlock
  }

  abstract render(props: RenderElementProps<any>): JSX.Element

  protected _assert: (node: unknown) => boolean = () => false

  static assert<T extends SlateBlock<any, any>>(
    this: BlockConstructor<T, any>,
    node: unknown
  ): node is inferBlockElement<T> {
    return new this((this as any).id || "_")._assert(node)
  }

  static withId<T extends SlateBlock<Id, any>, Id extends string>(
    this: BlockConstructor<T, Id>,
    id: Id
  ): typeof SlateBlock<Id, any> & { id: Id } {
    const classClone = class extends (this as any) {
      static id = id
    }
    return classClone as any
  }
}
