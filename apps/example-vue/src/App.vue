<template>
  <div>
    <div id="editor" ref="slate" class="editor"></div>
  </div>
</template>

<script setup lang="tsx">
import { h, hydrate, onMounted, ref } from "vue"
import { renderToString } from "vue/server-renderer"
import {
  HeadingBlock,
  ListBlock,
  ListItemBlock,
  ParagraphBlock,
  QuoteBlock,
  SnippetBlock,
  TableBlock,
  TableCellBlock,
  TableRowBlock,
} from "example-blocks/blocks"
import { Leaf } from "example-blocks/leaf"
import { initSlate } from "slate-jsx"

const slate = ref<HTMLDivElement | null>(null)

onMounted(() => {
  const editor = initSlate(slate.value!, {
    defaultValue: [
      {
        type: "h1",
        children: [{ text: "Hello " }, { text: "slate-jsx", code: true }],
      },
      {
        type: "p",
        children: [{ text: "This is editable plain text, just like a <textarea>!" }],
      },
      {
        type: "blockquote",
        children: [{ text: "This is editable plain text, just like a <textarea>!" }],
      },
      {
        type: "ul",
        children: [
          {
            type: "li",
            level: 0,
            children: [{ text: "First item" }],
          },
          {
            type: "ol",
            children: [
              {
                type: "li",
                level: 1,
                children: [
                  { text: "You can split a list by pressing enter/backspace in an empty item" },
                ],
              },
              {
                type: "li",
                level: 1,
                children: [{ text: "Try it!" }],
              },
            ],
          },
          {
            type: "li",
            level: 0,
            children: [{ text: "Second item" }],
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "" }],
      },
      {
        type: "snippet",
        children: [
          {
            type: "p",
            children: [{ text: "This is a custom block" }],
          },
          {
            type: "p",
            children: [
              {
                text: "It has a custom behaviour that moves the current paragraph outside after 2 consecutive empty lines.",
              },
            ],
          },
          {
            type: "p",
            children: [{ text: "Try pressing enter 3 times below!" }],
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "" }],
      },
      {
        type: "table",
        children: [
          {
            type: "tr",
            children: [
              {
                type: "th",
                children: [
                  {
                    type: "p",
                    children: [{ text: "First item" }],
                  },
                ],
              },
              {
                type: "th",
                children: [
                  {
                    type: "p",
                    children: [{ text: "Second item" }],
                  },
                ],
              },
              {
                type: "th",
                children: [
                  {
                    type: "p",
                    children: [{ text: "Third item" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tr",
            children: [
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tr",
            children: [
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
              {
                type: "td",
                children: [
                  {
                    type: "p",
                    children: [{ text: "" }],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "p",
        children: [{ text: "end!" }],
      },
    ],
    blocks: [
      new ParagraphBlock(),
      new HeadingBlock("h1"),
      new HeadingBlock("h2"),
      new HeadingBlock("h3"),
      new HeadingBlock("h4"),
      new HeadingBlock("h5"),
      new HeadingBlock("h6"),
      new ListBlock("ul"),
      new ListBlock("ol"),
      new ListItemBlock(),
      new QuoteBlock(),
      new TableBlock(),
      new TableRowBlock(),
      new TableCellBlock("td"),
      new TableCellBlock("th"),
      new SnippetBlock(),
    ],
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
