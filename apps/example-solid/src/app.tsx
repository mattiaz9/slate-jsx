import { getOwner, onMount } from "solid-js"
import h from "solid-js/h"
import { hydrate } from "solid-js/web"
import { initSlate } from "@mattiaz9/slate-jsx"
import { blocks } from "example-blocks/blocks"
import { Leaf } from "example-blocks/leaf"
import { initialValue } from "example-blocks/placeholder"

import "./app.css"

export default function App() {
  let slate: HTMLDivElement | undefined

  onMount(() => {
    if (!slate) return

    const _editor = initSlate(slate, {
      defaultValue: initialValue,
      blocks,
      leaf: new Leaf(),
      renderToString: jsx => {
        if (jsx) {
          if (typeof jsx === "function") {
            return jsx().outerHTML
          }
          if (jsx instanceof HTMLElement) {
            return jsx.outerHTML
          }
        }
        return ""
      },
      hydrate: (input, container) =>
        hydrate(() => input, container, {
          owner: getOwner(),
        }),
      h,
    })
  })

  return <div id="editor" class="editor" ref={slate} />
}
