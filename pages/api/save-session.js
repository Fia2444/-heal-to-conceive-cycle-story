import { notion, DATABASE_ID, messagesToBlocks } from '../../lib/notion';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { sessionId, name, email, cycleStory, recommendedModule, messages } = req.body;
  if (!sessionId || !name) return res.status(400).json({ error: 'Missing required fields' });

  const properties = {
    Name: { title: [{ text: { content: name } }] },
    'Session ID': { rich_text: [{ text: { content: sessionId } }] },
    ...(email && { Email: { email } }),
    ...(cycleStory && { 'Cycle Story': { select: { name: cycleStory } } }),
    ...(recommendedModule && { Module: { select: { name: recommendedModule } } }),
  };

  try {
    // Check if a page already exists for this session
    const existing = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: { property: 'Session ID', rich_text: { equals: sessionId } },
    });

    let pageId;

    if (existing.results.length > 0) {
      pageId = existing.results[0].id;
      await notion.pages.update({ page_id: pageId, properties });
    } else {
      const page = await notion.pages.create({
        parent: { database_id: DATABASE_ID },
        properties,
      });
      pageId = page.id;
    }

    // Append conversation blocks separately so metadata always saves even if this fails
    try {
      const blocks = messagesToBlocks(messages || []);
      // Remove existing blocks first
      const existingBlocks = await notion.blocks.children.list({ block_id: pageId });
      for (const block of existingBlocks.results) {
        await notion.blocks.delete({ block_id: block.id });
      }
      // Append in batches of 100 (Notion API limit)
      for (let i = 0; i < blocks.length; i += 100) {
        await notion.blocks.children.append({
          block_id: pageId,
          children: blocks.slice(i, i + 100),
        });
      }
    } catch (blockError) {
      console.error('Block append error (metadata saved):', blockError);
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Notion save error:', error);
    return res.status(500).json({ error: 'Failed to save to Notion' });
  }
}
