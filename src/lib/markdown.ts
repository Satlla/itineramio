import { marked } from 'marked'

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert \n to <br>
})

export function markdownToHtml(markdown: string): string {
  return marked.parse(markdown) as string
}
