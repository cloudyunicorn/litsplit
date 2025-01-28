import React from 'react';
import Modetoggle from './mode-toggle';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { EllipsisVertical, ShoppingCart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import UserButton from "./user-button";

const Menu = () => {
  return (
    <div className="flex justify-end gap-3 p-5">
      <nav className="hidden md:flex w-full max-w-xs gap-1">
        <Modetoggle />
        <Button asChild variant="ghost">
          <Link href="/cart">
            <ShoppingCart /> Cart
          </Link>
        </Button>
        <UserButton />
      </nav>
      <nav className="md:hidden">
        <Sheet>
          <SheetTrigger className="align-middle">
            <EllipsisVertical />
          </SheetTrigger>
          <SheetContent className="flex flex-col items-start">
            <SheetTitle>Menu</SheetTitle>
            <Modetoggle />
            <Button asChild variant="ghost">
              <Link href="/cart">
                <ShoppingCart /> Shop
              </Link>
            </Button>
            <UserButton />
            <SheetDescription></SheetDescription>
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  );
};

export default Menu;
