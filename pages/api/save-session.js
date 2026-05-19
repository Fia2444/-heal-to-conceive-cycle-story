import { notion, DATABASE_ID, messagesToBlocks } from '../../lib/notion';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, name, email, cycleStory, recommendedModule, messages } = req.body;
  if (!sessionId || !name) return res.status(400).json({ error: 'Missing required fields' });

  try {
    // Check if a page already exists for this session
    const existing = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: 'Session ID', rich_text: { equals: sessionId } },
    });

    const properties = {
      Name: { title: [{ text: { content: name } }] },
      'Session ID': { rich_text: [{ text: { content: sessionId } }] },
      ...(email && { Email: { email } }),
      ...(cycleStory && { 'Cycle Story': { select: { name: cycleStory } } }),
      ...(recommendedModule && { Module: { select: { name: recommendedModule } } }),
    };

    const blocks = messagesToBlocks(messages || []);

    if (existing.results.length > 0) {
      const pageId = existing.results[0].id;
      await notion.pages.update({ page_id: pageId, properties });
      // Clear existing blocks and rewrite conversation
      const existingBlocks = await notion.blocks.children.list({ block_id: pageId });
      for (const block of existingBlocks.results) {
        await notion.blocks.delete({ block_id: block.id });
      }
      await notion.blocks.children.append({ block_id: pageId, children: blocks });
    } else {
      await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties,
        children: blocks,
      });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Notion save error:', error);
    return res.status(500).json({ error: 'Failed to save to Notion' });
  }
}
