export * from "slate"

declare module "slate" {
  interface ElementBase {
    type: string
    children: SlateDescendant[]
  }

  type SlateDescendant = SlateElement<string, any> | SlateText
  type SlateElement<T extends string, Props = Record<string, never>> = ElementBase & {
    type: T
  } & Props
  type SlateText<Props = Record<string, never>> = {
    text: string
  } & Props
}
