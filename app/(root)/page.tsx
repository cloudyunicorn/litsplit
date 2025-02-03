import UserButton from '@/components/shared/header/user-button';
import Image from 'next/image';
import React from 'react';
import hero from '@/assets/hero.svg';
import { auth } from "@/auth";
import Dashboard from "@/components/dashboard";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const Home = async () => {
  const session = await auth();

  if(!session) {
    return (
      <div className="relative min-h-[calc(100vh-80px)]">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-sm" />
          <Image
            src={hero}
            alt="background"
            fill
            priority
            className="object-cover opacity-20"
          />
        </div>

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-purple-600 text-transparent bg-clip-text">
              Split Expenses with Friends
            </h1>
            
            {/* Subheading */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Keep track of shared expenses and balances with housemates, trips, groups, friends, and family.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <UserButton />
              <Button asChild size="lg" variant="outline" className="backdrop-blur-sm">
                <Link href="/about" className="flex items-center gap-2">
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md shadow-lg border border-border/50 hover:bg-card/80 transition-colors">
                <h3 className="text-xl font-semibold mb-2">Easy Splitting</h3>
                <p className="text-muted-foreground">Split bills instantly with groups and keep track of shared expenses.</p>
              </div>
              <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md shadow-lg border border-border/50 hover:bg-card/80 transition-colors">
                <h3 className="text-xl font-semibold mb-2">Group Management</h3>
                <p className="text-muted-foreground">Create groups for roommates, trips, or events and manage expenses together.</p>
              </div>
              <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-md shadow-lg border border-border/50 hover:bg-card/80 transition-colors">
                <h3 className="text-xl font-semibold mb-2">Balance Tracking</h3>
                <p className="text-muted-foreground">Keep track of who owes what with detailed balance calculations.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <Dashboard />;
};

export default Home;