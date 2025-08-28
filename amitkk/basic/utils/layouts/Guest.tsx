import React from 'react';
import {ThemeProvider} from '@mui/material/styles';
import dynamic from 'next/dynamic';
import { SettingsProvider } from '../context/SettingsContext';
import Footer from '@amitkk/basic/static/Footer';
import Header from '@amitkk/basic/static/Header';
import theme from '@amitkk/basic/utils/theme';

const ToasterComponent = dynamic(
  () => import('react-hot-toast').then((mod) => mod.Toaster),
  { ssr: false }
);

const AppLayout: React.FC<{children: React.ReactNode}> = ({children}) => {
  return (
    <ThemeProvider theme={theme}>
      <SettingsProvider>
      <ToasterComponent position='top-center' />
      <Header />
      <main>{children}</main>
      <Footer />
      </SettingsProvider>
    </ThemeProvider>
  );
};

export default AppLayout;