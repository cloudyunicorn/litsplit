import Menu from './menu';
import Link from 'next/link';
import Logo from "@/components/Logo";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Background with blur effect */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl border-b border-border/40" />

      {/* Existing structure with relative positioning */}
      <div className="relative flex justify-between">
        <div data-hide-on-theme="dark" className="p-5">
          <Link href="/">
            <Logo />
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;