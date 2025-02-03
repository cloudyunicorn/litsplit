import UserButton from '@/components/shared/header/user-button';
import Image from 'next/image';
import React from 'react';
import hero from '@/assets/hero.svg';
import { auth } from "@/auth";
import Dashboard from "@/components/dashboard";

const Home = async () => {
  const session = await auth();
  if(!session) {
    return (
    <div className="flex-center flex-col gap-10">
      <Image
        src={hero}
        alt="hero image"
        width={400}
        height={400}
        className="w-full"
      />
      
      <div className="flex-center">
        <UserButton />
      </div>
    </div>
  );
  }
  return (
    <Dashboard />
  );
};

export default Home;
