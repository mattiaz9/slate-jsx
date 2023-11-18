import { CodeBlock } from "./code"
import { HeadingBlock } from "./heading"
import { ImageBlock } from "./image"
import { ListBlock } from "./list"
import { ListItemBlock } from "./list-item"
import { ParagraphBlock } from "./paragraph"
import { QuoteBlock } from "./quote"
import { SnippetBlock } from "./snippet"
import { TableBlock } from "./table"
import { TableCellBlock } from "./table-cell"
import { TableRowBlock } from "./table-row"

export {
  CodeBlock,
  HeadingBlock,
  ImageBlock,
  ListItemBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  SnippetBlock,
  TableBlock,
  TableCellBlock,
  TableRowBlock,
}

export const blocks = [
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
  new CodeBlock(),
  new ImageBlock(),
  new TableBlock(),
  new TableRowBlock(),
  new TableCellBlock("td"),
  new TableCellBlock("th"),
  new SnippetBlock(),
] as const

export type { HeadingElement, HeadingType } from "./heading"
