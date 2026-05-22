import React from 'react';

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6, width: '100%' }}
  />
);

export default Input;
