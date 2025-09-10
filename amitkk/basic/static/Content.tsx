import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

export function sanitizeHtml(html: string): string {
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window as any);
  return DOMPurify.sanitize(html);
}