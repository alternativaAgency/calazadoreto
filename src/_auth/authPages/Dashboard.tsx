import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

// Define a type for your Notion item, adjust based on your Notion DB schema
interface NotionItem {
  id: string;
  name: string;
  status: string;
  tags: string[];
  lastEdited: string;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [notionData, setNotionData] = useState<NotionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotionData = async () => {
      try {
        // In a real application, this would be a call to your backend/serverless function
        // which then calls the Notion API securely.
        // Example: const response = await fetch('/api/get-notion-items');
        // For demonstration, we'll use a mock API call.

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock Notion data (replace with actual fetch result from your backend)
        const mockData: NotionItem[] = [
          { id: '1', name: 'Project Alpha', status: 'In Progress', tags: ['Work', 'Urgent'], lastEdited: '2025-06-28' },
          { id: '2', name: 'Meeting Notes', status: 'Completed', tags: ['Meeting', 'Docs'], lastEdited: '2025-06-25' },
          { id: '3', name: 'Plan Marketing Campaign', status: 'To Do', tags: ['Marketing'], lastEdited: '2025-06-30' },
          { id: '4', name: 'Review Q2 Report', status: 'Blocked', tags: ['Finance', 'Report'], lastEdited: '2025-06-29' },
        ];

        setNotionData(mockData);
      } catch (err) {
        console.error('Failed to fetch Notion data:', err);
        setError('Failed to load Notion data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotionData();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Dashboard</h1>
      <p className="text-lg text-gray-200 mb-6">
        Hello, {user?.firstName || user?.username || 'Authenticated User'}!
        This is your personalized dashboard.
      </p>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-400"></div>
          <p className="ml-4 text-lg text-gray-300">Loading Notion data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg text-center">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && notionData.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>No Notion items found.</p>
        </div>
      )}

      {!loading && !error && notionData.length > 0 && (
        <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-gray-500 text-gray-100">
            <thead>
              <tr className="bg-gray-900 text-indigo-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left rounded-tl-lg">Name</th>
                <th className="py-3 px-6 text-left">Status</th>
                <th className="py-3 px-6 text-left">Tags</th>
                <th className="py-3 px-6 text-left rounded-tr-lg">Last Edited</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 text-sm font-light">
              {notionData.map((item) => (
                <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150">
                  <td className="py-3 px-6 text-left whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold
                      ${item.status === 'In Progress' ? 'bg-blue-600 text-blue-100' : ''}
                      ${item.status === 'Completed' ? 'bg-green-600 text-green-100' : ''}
                      ${item.status === 'To Do' ? 'bg-yellow-600 text-yellow-100' : ''}
                      ${item.status === 'Blocked' ? 'bg-red-600 text-red-100' : ''}
                    `}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-left">
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="bg-gray-600 text-gray-200 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-6 text-left">
                    {item.lastEdited}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
