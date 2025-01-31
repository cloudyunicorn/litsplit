import Menu from './menu';
import Link from 'next/link';
import Logo from "@/components/Logo";

const Header = () => {
  return (
    <header className="w-full border-b ">
      <div className="flex justify-between">
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
