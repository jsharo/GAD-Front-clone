import React from 'react';

const Button = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    style={{ padding: '8px 12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: 6 }}
  >
    {children}
  </button>
);

export default Button;
