import type { inferBlocksDescendant } from "@mattiaz9/slate-jsx"
import type { blocks } from "./blocks"
import type { Leaf } from "./leaf"

export const initialValue: inferBlocksDescendant<typeof blocks, Leaf>[] = [
  {
    type: "h1",
    children: [{ text: "Hello " }, { text: "slate-jsx", code: true }],
  },
  {
    type: "p",
    children: [{ text: "This is editable plain text, just like a <textarea>!" }],
  },
  {
    type: "img",
    src: "https://cdn.leonardo.ai/users/0eece754-2954-4e23-95fe-75a72423bc7e/generations/bd89d360-7625-420b-84f3-dfb23eeae81a/PhotoReal_crea_una_imagen_de_dos_astronautas_terminando_de_con_0.jpg",
    children: [{ text: "" }],
  },
  {
    type: "blockquote",
    children: [
      {
        type: "p",
        children: [{ text: "This is quote by:", italic: true }],
      },
      {
        type: "p",
        children: [{ text: " – Anonymous", italic: true }],
      },
    ],
  },
  {
    type: "code",
    children: [
      {
        type: "p",
        children: [{ text: "This is a code block" }],
      },
    ],
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
]
