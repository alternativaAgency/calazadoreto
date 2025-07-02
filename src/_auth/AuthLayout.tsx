import { UserButton, useUser } from '@clerk/clerk-react';
import { Link, Outlet } from 'react-router-dom';

const AuthLayout = () => {
  const { user, isLoaded } = useUser();
  return (
    <>
      <div className="min-h-screen flex flex-col text-gray-100 font-inter">
        {/* Global Header */}
        <header className="shadow-lg py-4 px-7 flex justify-between items-center rounded-b-lg">
          <Link to="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Development App
          </Link>
          <nav>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <h2 className="text-lg font-semibold">
                  Olá,{" "}
                  {isLoaded ? user?.fullName || user?.username || "User" : "Loading..."}
                </h2>
                <p className="text-sm">Bem-vindo de volta!</p>
              </div>
              <div className="transform hover:scale-105 transition-transform duration-200">
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-12 h-12 ring-1 ring-blue-100 hover:ring-blue-200 transition-all"
                    }
                  }}
                />
              </div>
            </div>
          </nav>
        </header>

        {/* Main Content Area - where children (AuthLayout or PublicLayout) will render */}
        <main className="flex-grow flex flex-col p-4">
          <Outlet /> {/* Renders the child route if signed in */}
        </main>

        {/* Global Footer */}
        <footer className="shadow-inner p-4 text-center text-gray-400 rounded-t-lg mt-auto">
          <p>&copy; {new Date().getFullYear()} mateusloubach. All rights reserved.</p>
        </footer>
      </div>
    </>
  )
}

export default AuthLayout