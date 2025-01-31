
import CreateGroupForm from "../CreateGroupForm";
import { UserGroups } from "../GroupList";
import AllUserBox from '../shared/all-users';
import DashboardHeader from './DashboardHeader';

const Dashboard = async () => {
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
