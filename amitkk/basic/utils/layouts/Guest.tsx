import React from 'react';
import dynamic from 'next/dynamic';
import Footer from '@amitkk/basic/static/Footer';
import Header from '@amitkk/basic/static/Header';

const ToasterComponent = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

const GuestLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <>
      <ToasterComponent position='top-center' />
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

export default GuestLayout;