import Link from 'next/link';
import AllUserBox from '../shared/all-users';
import { Button } from '../ui/button';
import DashboardHeader from './DashboardHeader';
import { auth } from '@/auth';
import { getAllGroupsByUser } from '@/lib/actions/user.action';
import { Group } from '@prisma/client';
import { ScrollArea } from '@radix-ui/react-scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const Dashboard = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  const allGroups = (await getAllGroupsByUser(userId)) as Group[];
  console.log(userId);
  return (
    <div className="pb-4">
      <DashboardHeader />
      <AllUserBox />
      {/* <div className="flex-center">
        <h2>Groups</h2>
        <ul>
          {allGroups.map((group: Group) => (
            <li key={group.id}>
              <h3>{group.name}</h3>
            </li>
          ))}
        </ul>
      </div> */}
      <div className="w-full max-w-sm mx-auto mt-4">
        {/* Scrollable area for the list */}
        <ScrollArea className="flex-grow space-y-4">
          {/* Loop through groups and display them */}
          {allGroups.map((group: Group) => (
            <Card key={group.id} className="w-full">
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">group!!!</p>
              </CardContent>
              <div className="px-4 pb-4">
                <Button variant="outline" className="w-full">
                  <Link href={`/group/${group.id}`}>view Details</Link>
                </Button>
              </div>
            </Card>
          ))}
        </ScrollArea>
      </div>
    </div>
  );
};

export default Dashboard;
