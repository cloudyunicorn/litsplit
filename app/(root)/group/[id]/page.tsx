import { AddExpensePopup } from '@/components/expenses/AddExpensePopup';
import { getGroupById } from '@/lib/actions/user.action';
import { notFound } from 'next/navigation';
import React from 'react';

const GroupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const group = await getGroupById(resolvedParams.id);
  if (!group) notFound();

  // Get members directly from the group data
  const members = group.userGroups.map((member) => ({
    id: member.userId,
    name: member.user.name,
    balance: member.balance
  }));
  // console.log(group);
  // console.log(members);

  return (
    <>
      <section>
        <AddExpensePopup groupId={group.id} members={members} />
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Rest of your layout */}
          <div className="col-span-2 p-5 flex flex-col h-[400px]">
            <div className="flex flex-col gap-6">
              <h1 className="h3-bold">{group.name}</h1>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Members</p>
              {members.map((member) => (
                <p key={member.id}>{member.name} <span>Balance : </span>{member.balance}</p>
              ))}
            </div>
            <div className="mt-auto">
              <div>
                Created on :{' '}
                <span className="text-sm text-muted-foreground">
                  {new Date(group.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                Last Updated on :{' '}
                <span className="text-sm text-muted-foreground">
                  {new Date(group.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GroupPage;
