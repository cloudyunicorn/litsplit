import React from 'react';
import Menu from './menu';

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="flex justify-between">
        <div className="p-5">
          <h1 className="font-bold text-2xl">LitSplit</h1>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
