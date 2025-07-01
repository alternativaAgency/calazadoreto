import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const NOTION_API_KEY = process.env.NOTION_INTEGRATION_SECRET;
const DATABASE_ID = process.env.NOTION_DATABASE_ID;

// Debug environment variables
console.log('Environment variables loaded:');
console.log('NOTION_API_KEY:', NOTION_API_KEY ? `${NOTION_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('DATABASE_ID:', DATABASE_ID ? `${DATABASE_ID.substring(0, 10)}...` : 'NOT SET');
console.log('Current working directory:', process.cwd());

app.post('/api/notion-data', async (req, res) => {
  try {
    // Check if environment variables are set
    if (!NOTION_API_KEY || !DATABASE_ID) {
      return res.status(400).json({
        error: 'Missing required environment variables',
        missing: [
          !NOTION_API_KEY ? 'NOTION_INTEGRATION_SECRET' : null,
          !DATABASE_ID ? 'NOTION_DATABASE_ID' : null
        ].filter(Boolean)
      });
    }

    console.log('Fetching data from Notion database:', DATABASE_ID);
    
    const response = await axios.post(
      `https://api.notion.com/v1/databases/${DATABASE_ID}/query`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('Successfully fetched data from Notion');
    res.json(response.data);
  } catch (err) {
    console.error('Notion API Error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Failed to fetch from Notion API', 
      details: err.response?.data || err.message 
    });
  }
});

// Test endpoint to check API connection and configuration
app.get('/api/test-connection', async (req, res) => {
  try {
    // Check if environment variables are set
    if (!NOTION_API_KEY) {
      return res.status(400).json({
        success: false,
        error: 'NOTION_INTEGRATION_SECRET environment variable is not set'
      });
    }

    if (!DATABASE_ID) {
      return res.status(400).json({
        success: false,
        error: 'NOTION_DATABASE_ID environment variable is not set'
      });
    }

    // Test API connection by fetching database info
    const response = await axios.get(
      `https://api.notion.com/v1/databases/${DATABASE_ID}`,
      {
        headers: {
          'Authorization': `Bearer ${NOTION_API_KEY}`,
          'Notion-Version': '2022-06-28'
        }
      }
    );

    res.json({
      success: true,
      message: 'Successfully connected to Notion API',
      database: {
        id: response.data.id,
        title: response.data.title?.[0]?.plain_text || 'Untitled',
        created_time: response.data.created_time,
        last_edited_time: response.data.last_edited_time
      }
    });
  } catch (err) {
    console.error('Connection test failed:', err.message);
    res.status(500).json({
      success: false,
      error: 'Failed to connect to Notion API',
      details: err.response?.data || err.message
    });
  }
});

app.listen(3001, () => {
  console.log('Server running on http://localhost:3001');
});
