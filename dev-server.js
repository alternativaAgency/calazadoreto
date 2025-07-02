import express from 'express';
import cors from 'cors';
import { Client } from '@notionhq/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3001;

// Initialize Notion client
const notion = new Client({
  auth: process.env.NOTION_INTEGRATION_SECRET,
});

// Middleware
app.use(cors());
app.use(express.json());

// Notion API route
app.get('/api/notion', async (req, res) => {
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

      const users = response.results
        .filter((page) => 'properties' in page)
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

      const services = response.results
        .filter((page) => 'properties' in page)
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
});

app.listen(PORT, () => {
  console.log(`Development API server running on http://localhost:${PORT}`);
});
