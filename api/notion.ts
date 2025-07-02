import { Client } from '@notionhq/client';
import type { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import type { VercelRequest, VercelResponse } from '@vercel/node';

interface User {
  id: string;
  name: string;
  email: string;
  number: string;
  role: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  status: string;
  category: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check environment variables first
    if (!process.env.NOTION_INTEGRATION_SECRET) {
      console.error('NOTION_INTEGRATION_SECRET is missing');
      return res.status(500).json({ 
        message: 'NOTION_INTEGRATION_SECRET environment variable is not set'
      });
    }

    // Initialize Notion client inside the handler
    const notion = new Client({
      auth: process.env.NOTION_INTEGRATION_SECRET,
    });

    const { database } = req.query;

    console.log('Environment check:');
    console.log('NOTION_INTEGRATION_SECRET exists:', !!process.env.NOTION_INTEGRATION_SECRET);
    console.log('NOTION_USERS_DATABASE_ID exists:', !!process.env.NOTION_USERS_DATABASE_ID);
    console.log('NOTION_SERVICES_DATABASE_ID exists:', !!process.env.NOTION_SERVICES_DATABASE_ID);
    console.log('Requested database:', database);

    if (database === 'users' || !database) {
      // Users database logic
      const databaseId = process.env.NOTION_USERS_DATABASE_ID;
      
      if (!databaseId) {
        console.error('Missing NOTION_USERS_DATABASE_ID');
        return res.status(500).json({ 
          message: 'NOTION_USERS_DATABASE_ID environment variable is not set'
        });
      }
      
      console.log('Querying users database:', databaseId.slice(-8));
      const response = await notion.databases.query({
        database_id: databaseId,
      });

      const users: User[] = response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page) => {
          try {
            return {
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
            };
          } catch (mapError) {
            console.error('Error mapping user:', mapError);
            return {
              id: page.id,
              name: 'Error loading name',
              email: '',
              number: '',
              role: '',
            };
          }
        });

      console.log(`Successfully fetched ${users.length} users`);
      return res.status(200).json(users);

    } else if (database === 'services') {
      // Services database logic
      const servicesDatabaseId = process.env.NOTION_SERVICES_DATABASE_ID;
      
      if (!servicesDatabaseId) {
        console.error('Missing NOTION_SERVICES_DATABASE_ID');
        return res.status(500).json({ 
          message: 'NOTION_SERVICES_DATABASE_ID environment variable is not set'
        });
      }
      
      console.log('Querying services database:', servicesDatabaseId.slice(-8));
      const response = await notion.databases.query({
        database_id: servicesDatabaseId,
      });

      const services: Service[] = response.results
        .filter((page): page is PageObjectResponse => 'properties' in page)
        .map((page) => {
          try {
            return {
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
            };
          } catch (mapError) {
            console.error('Error mapping service:', mapError);
            return {
              id: page.id,
              name: 'Error loading service',
              description: '',
              price: '',
              status: '',
              category: '',
            };
          }
        });

      console.log(`Successfully fetched ${services.length} services`);
      return res.status(200).json(services);

    } else {
      return res.status(400).json({ 
        message: 'Invalid database parameter. Use "users" or "services"' 
      });
    }

  } catch (error) {
    console.error('Serverless function error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null,
      name: error instanceof Error ? error.name : null
    });
    
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}