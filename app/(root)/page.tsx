import UserButton from '@/components/shared/header/user-button';
import Image from 'next/image';
import React from 'react';
import hero from '@/assets/hero.svg';

const Home = () => {
  return (
    <div className="flex-center flex-col gap-10">
      <Image src={hero} alt="hero image" width={400} height={400} className="w-full"/>
      <div className="flex-center"></div>

      <UserButton />
    </div>
  );
};

export default Home;
