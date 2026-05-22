import React from 'react';

const Header = ({ title }: { title?: string }) => {
  return (
    <header style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ margin: 0 }}>{title || 'GAD Cañar'}</h1>
    </header>
  );
};

export default Header;
