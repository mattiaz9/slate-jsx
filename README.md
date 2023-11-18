# slate-jsx

⚠️ THIS IS PROOF OF CONCEPT AND IS NOT READY FOR PRODUCTION: USE AT YOUR OWN RISK

## Examples

- Vue.js [app/example-vue](./apps/example-vue/)
- Solid.js [app/example-solid](./apps/example-solid/)
- Custom blocks [packages/example-blocks](./packages/example-blocks/)

## Installation

```bash
pnpm i @mattiaz9/slate-jsx
npm i @mattiaz9/slate-jsx
yarn add @mattiaz9/slate-jsx
```

## Usage

script:

```ts
import { initSlate } from "@mattiaz9/slate-jsx"

const slate = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const editor = initSlate(slate.value!, {
    defaultValue: [...],
    blocks: [...],
    leaf: new Leaf(),
    renderToString: frameworkRenderToString,
    hydrate: frameworkHydrate,
    h: frameworkH,
  })
})
```

html:

```tsx
<div id="editor" ref="slate" class="editor"></div>
```

## Creating a custom Leaf element

```tsx
import { SlateLeaf } from "@mattiaz9/slate-jsx"
import { Text } from "slate"

import type { inferLeafElement, RenderLeafProps } from "@mattiaz9/slate-jsx"

export type LeafElement = inferLeafElement<Leaf>

export class Leaf extends SlateLeaf<{
  bold?: boolean
  italic?: boolean
  underline?: boolean
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
    return (
      <span {...props.attributes} style={style}>
        {props.children}
      </span>
    )
  }
}
```

## Creating a custom Block element

```tsx
import { SlateBlock } from "@mattiaz9/slate-jsx"
import { Element } from "slate"

import { Leaf } from "./leaf"
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
    }
  }
}
```

### Block behaviours

Block behaviours are a way to define how a block should behave when certain events occur.
For example, when the user presses the enter key, the block can be replaced with another block.

Triggers:

- `enter`
- `backspace`
- `del`
- `space`
- `indent`
- `outdent`
- `normalize`

Actions:

- `stop`: stop the default behaviour
- `split`: split the target block
- `replace`: replace the target block
- `move`: move the target block
- execute a custom function

Other props:

- `withBlock`: the block to replace the target block with
- `target`: the target block
- `when`: a custom condition used to execute the command. If `undefined` the command is always executed when the trigger even happens.
- `to`: a function returning the path of the target block to move to

For some example see the [example blocks](./packages/example-blocks/).
