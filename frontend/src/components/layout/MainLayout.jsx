import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingBackButton from '../ui/FloatingBackButton';

const MainLayout = ({ children, noPadding = false }) => {
 return (
 <div className="flex flex-col min-h-screen ">
 <Navbar />
  <main className={`flex-grow ${noPadding ? "" : "pt-28 p-4 md:p-8 lg:p-12"} pb-32 md:pb-24`}> {children}
  </main>
      <Footer />
 <FloatingBackButton />
 </div>
 );
};

export default MainLayout;