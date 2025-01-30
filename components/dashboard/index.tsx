
import CreateGroupForm from "../CreateGroupForm";
import { UserGroups } from "../GroupList";
import AllUserBox from '../shared/all-users';
import DashboardHeader from './DashboardHeader';
import { auth } from '@/auth';

const Dashboard = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  console.log(userId);
  return (
    <div className="pb-4">
      <DashboardHeader />
      <AllUserBox />
      <UserGroups />
      <CreateGroupForm />

    </div>
  );
};

export default Dashboard;
