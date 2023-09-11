/* @refresh reload */
import { render } from "solid-js/web"

import "./index.css"

import App from "./app"

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = document.getElementById("root")!

render(() => <App />, root)
