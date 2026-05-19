import { notion, DATABASE_ID, blocksToMessages } from '../../lib/notion';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const { email, sessionId } = req.query;
  if (!email && !sessionId) return res.status(400).json({ error: 'Missing email or sessionId' });

  try {
    const filter = email
      ? { property: 'Email', email: { equals: email } }
      : { property: 'Session ID', rich_text: { equals: sessionId } };

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: 1,
    });

    if (response.results.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    const page = response.results[0];
    const props = page.properties;

    const blocksResponse = await notion.blocks.children.list({ block_id: page.id });
    const messages = blocksToMessages(blocksResponse.results);

    return res.json({
      id: page.id,
      name: props['Name']?.title[0]?.plain_text || '',
      email: props['Email']?.email || '',
      cycle_story: props['Cycle Story']?.select?.name || '',
      recommended_module: props['Module']?.select?.name || '',
      created_at: page.created_time,
      notion_url: `https://notion.so/${page.id.replace(/-/g, '')}`,
      messages,
    });
  } catch (error) {
    console.error('Notion fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Notion' });
  }
}
