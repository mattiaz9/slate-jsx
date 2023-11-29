<template>
  <div>
    <div id="editor" ref="slate" class="editor"></div>
    <div class="format-menu" :style="formatMenuStyle">
      <button
        v-for="mark in marks"
        :class="{ active: selectionMarkers[mark], [mark]: true }"
        @click="toggleMark(mark)"
      >
        {{ mark[0] }}
      </button>
    </div>
  </div>
</template>

<script setup lang="tsx">
import { CSSProperties, h, hydrate, onMounted, reactive, ref } from "vue"
import { renderToString } from "vue/server-renderer"
import { CaretPosition, initSlate } from "@mattiaz9/slate-jsx"
import { blocks } from "example-blocks/blocks"
import { Leaf } from "example-blocks/leaf"
import { initialValue } from "example-blocks/placeholder"
import { Editor, Range } from "slate"

import type { LeafElement } from "example-blocks/leaf"

type LeafProps = Omit<LeafElement, "text">
type BlockEditor = ReturnType<typeof createEditor>

const slate = ref<HTMLDivElement | null>(null)
const editor = ref<BlockEditor | null>(null)
const marks = ref(["bold", "italic", "underline", "strikethrough", "code"] as const)
const caretPosition = ref<CaretPosition>()
const formatMenuStyle = reactive<CSSProperties>({
  position: "fixed",
  left: "0",
  top: "0",
})
const selectionMarkers = reactive<LeafProps>({
  bold: false,
  italic: false,
  underline: false,
  strikethrough: false,
  code: false,
  subscript: false,
  superscript: false,
})

onMounted(() => {
  if (!slate.value) return

  caretPosition.value = new CaretPosition(slate.value)
  caretPosition.value.rectChangedCallback = () => {
    updateFormatMenu()
  }

  editor.value = createEditor()

  slate.value.focus()
})

function createEditor() {
  const editor = initSlate(slate.value!, {
    defaultValue: initialValue,
    blocks,
    leaf: new Leaf(),
    renderToString,
    hydrate: hydrate,
    h,
  })

  return editor
}

function updateFormatMenu() {
  if (!editor.value) return
  if (!caretPosition.value) return

  const rect = caretPosition.value.rect

  if (editor.value.selection && Range.isExpanded(editor.value.selection)) {
    // update selection markers
    const marks = Editor.marks(editor.value) as LeafProps | null
    selectionMarkers.bold = marks?.bold === true
    selectionMarkers.italic = marks?.italic === true
    selectionMarkers.underline = marks?.underline === true
    selectionMarkers.strikethrough = marks?.strikethrough === true
    selectionMarkers.code = marks?.code === true
    selectionMarkers.superscript = marks?.superscript === true
    selectionMarkers.subscript = marks?.subscript === true
    // update format menu position
    formatMenuStyle.top = `${rect.top - 8}px`
    formatMenuStyle.left = `${rect.left + rect.width / 2}px`
    formatMenuStyle.visibility = "visible"
  } else {
    formatMenuStyle.visibility = undefined
  }
}

function toggleMark(mark: keyof LeafProps) {
  if (!editor.value) return

  const isActive = selectionMarkers[mark]
  Editor.addMark(editor.value, mark, !isActive)

  updateFormatMenu()
}
</script>

<style>
.editor {
  text-align: left;
  padding: 8px;
  padding: 2cm;
  width: 21cm;
  min-height: 29.7cm;
  background-color: hsl(0 0% 50% / 0.1);
}

.editor p {
  margin-block: unset;
}

.format-menu {
  visibility: hidden;
  position: fixed;
  transform: translate(-50%, -100%);
  border-radius: 0.75rem;
  background-color: black;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.format-menu > button {
  color: white;
  text-transform: uppercase;
  font-weight: 500;
  padding: 0.35rem;
  width: 2rem;
  height: 2rem;
}
.format-menu > button.active {
  background-color: #880e98;
}
.format-menu > button.bold {
  font-weight: bold;
}
.format-menu > button.italic {
  font-style: italic;
}
.format-menu > button.underline {
  text-decoration: underline;
}
.format-menu > button.strikethrough {
  text-decoration: line-through;
}
.format-menu > button.code {
  font-family: monospace;
}
</style>
