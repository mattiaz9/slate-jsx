<template>
  <div>
    <div id="editor" ref="slate" class="editor"></div>
  </div>
</template>

<script setup lang="tsx">
import { h, hydrate, onMounted, ref } from "vue"
import { renderToString } from "vue/server-renderer"
import { initSlate } from "@mattiaz9/slate-jsx"
import { blocks } from "example-blocks/blocks"
import { Leaf } from "example-blocks/leaf"
import { initialValue } from "example-blocks/placeholder"

const slate = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const editor = initSlate(slate.value!, {
    defaultValue: initialValue,
    blocks,
    leaf: new Leaf(),
    renderToString,
    hydrate: hydrate,
    h,
  })
})
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
</style>
