// Defensive HTML entity decoder for scraped/imported text.
// Run twice to handle double-encoding (e.g. &amp;#039; → &#039; → ').
export function decodeHtmlEntities(text: string): string {
  return decodeOnce(decodeOnce(text))
}

function decodeOnce(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}
