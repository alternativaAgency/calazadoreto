import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET,
});

interface User {
  id: string;
  name: string;
  email: string;
  number: string;
  role: string;
}

// Define interface for your services database
interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  status: string;
  category: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { database } = req.query;

  try {
    if (database === 'users' || !database) {
      // Users database logic
      const databaseId = process.env.NOTION_USERS_DATABASE_ID;
      
      if (!databaseId) {
        return res.status(500).json({ message: 'NOTION_USERS_DATABASE_ID environment variable is not set' });
      }
      
      const response = await notion.databases.query({
        database_id: databaseId,
      });

      const users: User[] = response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page) => ({
          id: page.id,
          name: page.properties.Name?.type === 'title' && page.properties.Name.title?.[0]?.plain_text 
            ? page.properties.Name.title[0].plain_text 
            : '',
          email: page.properties.Email?.type === 'email' && page.properties.Email.email
            ? page.properties.Email.email
            : '',
          number: page.properties.Number?.type === 'phone_number' && page.properties.Number.phone_number
            ? page.properties.Number.phone_number
            : '',
          role: page.properties.Role?.type === 'select' && page.properties.Role.select?.name
            ? page.properties.Role.select.name
            : '',
        }));

      res.status(200).json(users);
    } else if (database === 'services') {
      // Services database logic
      const servicesDatabaseId = process.env.NOTION_SERVICES_DATABASE_ID;
      
      if (!servicesDatabaseId) {
        return res.status(500).json({ message: 'NOTION_SERVICES_DATABASE_ID environment variable is not set' });
      }
      
      const response = await notion.databases.query({
        database_id: servicesDatabaseId,
      });

      const services: Service[] = response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page) => ({
          id: page.id,
          name: page.properties.Name?.type === 'title' && page.properties.Name.title?.[0]?.plain_text 
            ? page.properties.Name.title[0].plain_text 
            : '',
          description: page.properties.Description?.type === 'rich_text' && page.properties.Description.rich_text?.[0]?.plain_text
            ? page.properties.Description.rich_text[0].plain_text
            : '',
          price: page.properties.Price?.type === 'number' && page.properties.Price.number
            ? `$${page.properties.Price.number}`
            : page.properties.Price?.type === 'rich_text' && page.properties.Price.rich_text?.[0]?.plain_text
            ? page.properties.Price.rich_text[0].plain_text
            : '',
          status: page.properties.Status?.type === 'select' && page.properties.Status.select?.name 
            ? page.properties.Status.select.name 
            : '',
          category: page.properties.Category?.type === 'select' && page.properties.Category.select?.name
            ? page.properties.Category.select.name
            : page.properties.Category?.type === 'multi_select' && page.properties.Category.multi_select?.[0]?.name
            ? page.properties.Category.multi_select[0].name
            : '',
        }));

      res.status(200).json(services);
    } else {
      res.status(400).json({ message: 'Invalid database parameter. Use "users" or "services"' });
    }
  } catch (error) {
    console.error('Error fetching Notion data:', error);
    res.status(500).json({ message: 'Failed to fetch data from Notion' });
  }
}