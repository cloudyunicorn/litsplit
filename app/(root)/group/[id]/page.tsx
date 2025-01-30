import { getGroupById, getUserById } from '@/lib/actions/user.action';
import { notFound } from 'next/navigation';
import React from 'react';

const GroupPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const group = await getGroupById(id);

  if (!group) notFound();

  const memberNames = await Promise.all(
    group.userGroups.map(async (member) => {
      const memberName = await getUserById(member.userId);
      return memberName;
    })
  );

  console.log(memberNames);

  return (
    <>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Images Column */}
          <div className="col-span-2">
            {/* <ProductImages images={user.image} /> */}
          </div>
          {/* Details Column */}
          <div className="col-span-2 p-5">
            <div className="flex flex-col gap-6">
              <p>{group.name}</p>
              <h1 className="h3-bold">{group.name}</h1>
            </div>
            <div className="mt-10">
              <p className="font-semibold">Members</p>
              {memberNames.map((member) => (
                <p key={member?.id}>{member?.name}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default GroupPage;
