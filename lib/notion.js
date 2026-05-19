import { Client } from '@notionhq/client';

export const notion = new Client({ auth: process.env.NOTION_API_KEY });
export const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Notion rich_text items have a 2000 char limit — split long text into chunks
export function textToRichText(text) {
  const chunks = [];
  for (let i = 0; i < text.length; i += 1900) {
    chunks.push({ type: 'text', text: { content: text.slice(i, i + 1900) } });
  }
  return chunks;
}

// Convert messages array into Notion page blocks
export function messagesToBlocks(messages) {
  const blocks = [
    {
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: [{ type: 'text', text: { content: 'Conversation' } }] },
    },
  ];

  for (const msg of messages) {
    if (!msg.content?.trim()) continue;

    if (msg.role === 'assistant') {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          icon: { type: 'emoji', emoji: '✦' },
          rich_text: textToRichText(msg.content),
        },
      });
    } else {
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: { rich_text: textToRichText(msg.content) },
      });
    }
  }

  return blocks;
}

// Parse Notion page blocks back into messages array
export function blocksToMessages(blocks) {
  const messages = [];
  for (const block of blocks) {
    if (block.type === 'callout') {
      const text = block.callout.rich_text.map(r => r.plain_text).join('');
      if (text) messages.push({ role: 'assistant', content: text });
    } else if (block.type === 'quote') {
      const text = block.quote.rich_text.map(r => r.plain_text).join('');
      if (text) messages.push({ role: 'user', content: text });
    }
  }
  return messages;
}
