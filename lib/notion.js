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

// Convert messages array into Notion page blocks using simple paragraphs
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
    const label = msg.role === 'assistant' ? 'Guide: ' : 'User: ';
    const fullText = label + msg.content;

    // Split into 1900 char chunks
    for (let i = 0; i < fullText.length; i += 1900) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ type: 'text', text: { content: fullText.slice(i, i + 1900) } }],
        },
      });
    }

    // Add a divider between messages
    blocks.push({ object: 'block', type: 'divider', divider: {} });
  }

  return blocks;
}

// Parse Notion page blocks back into messages array
export function blocksToMessages(blocks) {
  const messages = [];
  for (const block of blocks) {
    if (block.type === 'paragraph') {
      const text = block.paragraph.rich_text.map(r => r.plain_text).join('');
      if (text.startsWith('Guide: ')) {
        messages.push({ role: 'assistant', content: text.replace('Guide: ', '') });
      } else if (text.startsWith('User: ')) {
        messages.push({ role: 'user', content: text.replace('User: ', '') });
      }
    }
  }
  return messages;
}
