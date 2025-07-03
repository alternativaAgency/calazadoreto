
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { Link, Outlet } from 'react-router-dom';

const RootLayout = () => {
  return (
    <>
      <div className="min-h-screen flex flex-col text-gray-100 font-inter">
        {/* Global Header */}
        <header className="shadow-lg py-4 px-7 flex justify-between items-center rounded-b-lg">
          <Link to="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
            Desenvolvimento App
          </Link>
          <nav>
            <ul className="flex space-x-4 items-center">
              <SignedOut>
                <li className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition-colors">
                  <SignInButton />
                </li>
              </SignedOut>
              <SignedIn>
                <li>
                  {/* Clerk UserButton for managing user profile, sign out etc. */}
                  <UserButton />
                </li>
              </SignedIn>
            </ul>
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

export default RootLayout