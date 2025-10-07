import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="flex-grow p-4 pb-20"> 
        {children}
      </main>
      <Footer/>
      
    </>
  );
};

export default MainLayout;