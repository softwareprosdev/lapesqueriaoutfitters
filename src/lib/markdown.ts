import { marked } from 'marked'
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';

// Configure marked with syntax highlighting
marked.use(markedHighlight({
  langPrefix: 'hljs language-',
  highlight(code: string, lang: string) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
}));

export const markdownToHtml = async (markdown: string): Promise<string> => {
  if (!markdown) return '';
  
  const html = await marked(markdown, {
    breaks: true,
    gfm: true,
  });
  
  return html;
};

export const extractExcerpt = (content: string, maxLength: number = 160): string => {
  if (!content) return '';
  
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');
  
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  return plainText.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
};