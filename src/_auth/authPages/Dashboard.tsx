import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

// Define types for your Notion databases
interface NotionUser {
  id: string;
  name: string;
  email: string;
  number: string;
  role: string;
}

interface NotionService {
  id: string;
  name: string;
  description: string;
  price: string;
  status: string;
  category: string;
}

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const [notionUsers, setNotionUsers] = useState<NotionUser[]>([]);
  const [notionServices, setNotionServices] = useState<NotionService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'services'>('users');

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch both users and services data
        console.log("Requesting Notion DBs: users and services");
        const [usersResponse, servicesResponse] = await Promise.all([
          fetch("/api/notion?database=users"),
          fetch("/api/notion?database=services")
        ]);
        console.log("Users DB response:", usersResponse);
        console.log("Services DB response:", servicesResponse);

        if (!usersResponse.ok || !servicesResponse.ok) {
          throw new Error("Failed to fetch data from one or more databases");
        }

        const usersData: NotionUser[] = await usersResponse.json();
        const servicesData: NotionService[] = await servicesResponse.json();
        
        setNotionUsers(usersData);
        setNotionServices(servicesData);
      } catch (err) {
        console.error("Failed to fetch Notion data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const renderUsersTable = () => (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full text-gray-100">
        <thead>
          <tr className="bg-gray-900 text-indigo-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left rounded-tl-lg">ID</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Email</th>
            <th className="py-3 px-6 text-left">Number</th>
            <th className="py-3 px-6 text-left rounded-tr-lg">Role</th>
          </tr>
        </thead>
        <tbody className="text-gray-200 text-sm font-light">
          {notionUsers.map((user) => (
            <tr
              key={user.id}
              className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <span className="font-medium text-indigo-300">
                  #{user.id.slice(-8)}
                </span>
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                  <span className="font-medium">{user.name}</span>
                </div>
              </td>
              <td className="py-3 px-6 text-left">
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  {user.email}
                </a>
              </td>
              <td className="py-3 px-6 text-left">
                <a
                  href={`tel:${user.number}`}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  {user.number || 'N/A'}
                </a>
              </td>
              <td className="py-3 px-6 text-left">
                <span
                  className={`py-1 px-3 rounded-full text-xs font-semibold
                  ${user.role === "Admin" ? "bg-red-600 text-red-100" : ""}
                  ${user.role === "Manager" ? "bg-blue-600 text-blue-100" : ""}
                  ${user.role === "Developer" ? "bg-green-600 text-green-100" : ""}
                  ${user.role === "Designer" ? "bg-purple-600 text-purple-100" : ""}
                  ${user.role === "Client" ? "bg-yellow-600 text-yellow-100" : ""}
                  ${!["Admin", "Manager", "Developer", "Designer", "Client"].includes(user.role)
                    ? "bg-gray-600 text-gray-100" : ""}`}
                >
                  {user.role || 'No Role'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderServicesTable = () => (
    <div className="overflow-x-auto rounded-lg shadow-md">
      <table className="min-w-full text-gray-100">
        <thead>
          <tr className="bg-gray-900 text-indigo-300 uppercase text-sm leading-normal">
            <th className="py-3 px-6 text-left rounded-tl-lg">ID</th>
            <th className="py-3 px-6 text-left">Name</th>
            <th className="py-3 px-6 text-left">Description</th>
            <th className="py-3 px-6 text-left">Price</th>
            <th className="py-3 px-6 text-left">Status</th>
            <th className="py-3 px-6 text-left rounded-tr-lg">Category</th>
          </tr>
        </thead>
        <tbody className="text-gray-200 text-sm font-light">
          {notionServices.map((service) => (
            <tr
              key={service.id}
              className="border-b border-gray-700 hover:bg-gray-700 transition-colors duration-150"
            >
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <span className="font-medium text-indigo-300">
                  #{service.id.slice(-8)}
                </span>
              </td>
              <td className="py-3 px-6 text-left whitespace-nowrap">
                <div className="flex items-center">
                  <span className="font-medium">{service.name}</span>
                </div>
              </td>
              <td className="py-3 px-6 text-left max-w-xs">
                <p className="truncate" title={service.description}>
                  {service.description || 'No description'}
                </p>
              </td>
              <td className="py-3 px-6 text-left">
                <span className="font-semibold text-green-400">
                  {service.price || 'N/A'}
                </span>
              </td>
              <td className="py-3 px-6 text-left">
                <span
                  className={`py-1 px-3 rounded-full text-xs font-semibold
                  ${service.status === "Active" ? "bg-green-600 text-green-100" : ""}
                  ${service.status === "Inactive" ? "bg-red-600 text-red-100" : ""}
                  ${service.status === "Pending" ? "bg-yellow-600 text-yellow-100" : ""}
                  ${service.status === "Draft" ? "bg-gray-600 text-gray-100" : ""}
                  ${!["Active", "Inactive", "Pending", "Draft"].includes(service.status)
                    ? "bg-blue-600 text-blue-100" : ""}`}
                >
                  {service.status || 'Unknown'}
                </span>
              </td>
              <td className="py-3 px-6 text-left">
                <span className="py-1 px-3 rounded-full text-xs font-semibold bg-purple-600 text-purple-100">
                  {service.category || 'Uncategorized'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">
        Management Dashboard
      </h1>
      <p className="text-lg text-gray-200 mb-6">
        Hello, {user?.firstName || user?.username || "Authenticated User"}!
        Here's your complete management dashboard.
      </p>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-400"></div>
          <p className="ml-4 text-lg text-gray-300">Loading data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-800 text-white p-4 rounded-lg text-center mb-6">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && (
        <div>
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Users ({notionUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`py-2 px-4 rounded-lg font-semibold transition-colors duration-200 ${
                activeTab === 'services'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Services ({notionServices.length})
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Users Database</h2>
              {notionUsers.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No users found.</p>
                </div>
              ) : (
                renderUsersTable()
              )}
            </div>
          )}

          {activeTab === 'services' && (
            <div>
              <h2 className="text-2xl font-semibold text-indigo-300 mb-4">Services Database</h2>
              {notionServices.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <p>No services found.</p>
                </div>
              ) : (
                renderServicesTable()
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;