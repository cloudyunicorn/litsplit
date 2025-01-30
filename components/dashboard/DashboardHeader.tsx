import { auth } from "@/auth";
import UserButton from "../shared/header/user-button";

const DashboardHeader = async () => {
  const session = await auth();

  return (
    <header className="p-4 flex justify-between items-center">
      <h1 className="text-xl">Welcome, {session?.user?.name}</h1>
      <div className="flex items-center space-x-4">
        <UserButton />
      </div>
    </header>
  );
};

export default DashboardHeader;