import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, title }: { children: React.ReactNode; title?: string }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header title={title} />
      <main style={{ flex: 1, padding: 16 }}>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
