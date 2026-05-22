import React from 'react';
import './publicLayout.css';
import gadLogo from '../../assets/logo-gad.png';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="public-root">
      <div className="public-left">
        <div className="public-brand">
          <img src={gadLogo} alt="Escudo GAD Cañar" />
          <h2>CAÑAR</h2>
          <p>GAD MUNICIPAL — ORDENAMIENTO TERRITORIAL</p>
        </div>
      </div>

      <div className="public-right">
        <div className="public-right-inner">{children}</div>
      </div>
    </div>
  );
};

export default PublicLayout;
