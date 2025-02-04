import { UserGroups } from '../GroupList';
import { UserSearch } from '../UserSearch';
import DashboardHeader from './DashboardHeader';

const Dashboard = async () => {
  return (
    <div className="pb-4">
      <DashboardHeader />
      <UserSearch
        mode="profile"
        label="Search users"
        className="max-w-md mx-auto p-2"
      />
      <UserGroups />
    </div>
  );
};

export default Dashboard;
