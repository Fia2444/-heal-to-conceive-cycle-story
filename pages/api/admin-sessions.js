import { notion, DATABASE_ID } from '../../lib/notion';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();

  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      page_size: 100,
    });

    const sessions = response.results.map(page => {
      const props = page.properties;
      return {
        id: page.id,
        name: props['Name']?.title[0]?.plain_text || '',
        email: props['Email']?.email || '',
        cycle_story: props['Cycle Story']?.select?.name || '',
        recommended_module: props['Module']?.select?.name || '',
        created_at: page.created_time,
        notion_url: `https://notion.so/${page.id.replace(/-/g, '')}`,
      };
    });

    return res.json(sessions);
  } catch (error) {
    console.error('Notion admin fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch from Notion' });
  }
}
