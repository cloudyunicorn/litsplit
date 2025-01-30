import { getUserById } from '@/lib/actions/user.action';
import { notFound } from 'next/navigation';
import React from 'react';

const UserPage = async (props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <>
      <section>
        <div className='grid grid-cols-1 md:grid-cols-5'>
          {/* Images Column */}
          <div className='col-span-2'>
            {/* <ProductImages images={user.image} /> */}
          </div>
          {/* Details Column */}
          <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {user.email}  {user.role}
              </p>
              <h1 className='h3-bold'>{user.name}</h1>
            </div>
            <div className='mt-10'>
              <p className='font-semibold'>Description</p>
              <p>{user.totalBalance}</p>
            </div>
          </div>
          {/* Action Column */}
          {/* <div>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex justify-between'>
                  {user.totalBalance}
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default UserPage;
