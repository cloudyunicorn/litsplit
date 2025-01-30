import Menu from './menu';
import Image from 'next/image';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';
import Link from 'next/link';

const Header = () => {
  return (
    <header className="w-full border-b ">
      <div className="flex justify-between">
        <div data-hide-on-theme="dark" className="p-5">
          <Link href="/">
            <Image src={logoDark} alt="logo" width={100} height={100} />
          </Link>
        </div>
        <div data-hide-on-theme="light" className="p-5">
          <Link href="/">
            <Image src={logoLight} alt="logo" width={100} height={100} />
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
