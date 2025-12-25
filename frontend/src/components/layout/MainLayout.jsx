import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingBackButton from '../ui/FloatingBackButton';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-grow p-4 md:p-8 lg:p-12 pb-32 md:pb-20"> 
        {children}
      </main>
      <div className="md:hidden">
        <Footer />
      </div>
      <FloatingBackButton />
    </>
  );
};

export default MainLayout;