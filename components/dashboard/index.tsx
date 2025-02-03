
import { UserGroups } from "../GroupList";
import DashboardHeader from './DashboardHeader';

const Dashboard = async () => {
  return (
    <div className="pb-4">
      <DashboardHeader />
      {/* <AllUserBox /> */}
      <UserGroups />

    </div>
  );
};

export default Dashboard;
