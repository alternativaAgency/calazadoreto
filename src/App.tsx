import { Route, Routes } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

import AuthLayout from './_auth/AuthLayout';
import RootLayout from './_root/RootLayout';

import Dashboard from './_auth/authPages/Dashboard';
import Home from './_root/rootPages/Home';

const App = () => {
  return (
    <>
      <SignedIn>
        <Routes>
          {/* If signed in, render the AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </SignedIn>
      <SignedOut>
        <Routes>
          {/* If signed out, render the RootLayout */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
          </Route>
        </Routes>
      </SignedOut>
    </>
  );
};

export default App;