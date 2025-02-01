// import { ExpenseList } from "@/components/ExpenseList";
// import { AddExpensePopup } from '@/components/expenses/AddExpensePopup';
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { getGroupById } from '@/lib/actions/user.action';
// import { notFound } from 'next/navigation';
// import React from 'react';

// const GroupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
//   const resolvedParams = await params;
//   const group = await getGroupById(resolvedParams.id);
//   if (!group) notFound();

//   // Get members directly from the group data
//   const members = group.userGroups.map((member) => ({
//     id: member.userId,
//     name: member.user.name,
//     balance: member.balance
//   }));
//   // console.log(group);
//   // console.log(members);

//   return (
//     <div className="container mx-auto p-4 space-y-6">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold">{group.name}</h1>
//         <AddExpensePopup
//           groupId={group.id}
//           members={group.userGroups.map(ug => ({
//             id: ug.user.id,
//             name: ug.user.name
//           }))}
//         />
//       </div>

//       <div className="space-y-4">
//         <h2 className="text-xl font-semibold">Expense History</h2>
//         <ExpenseList expenses={group.expenses} />
//       </div>

//       {/* Existing members list */}
//       <div className="mt-8">
//         <h2 className="text-xl font-semibold mb-4">Group Members</h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           {group.userGroups.map((userGroup) => (
//             <div
//               key={userGroup.user.id}
//               className="flex items-center justify-between p-4 border rounded-lg"
//             >
//               <div className="flex items-center gap-3">
//                 <Avatar>

//                   <AvatarFallback>
//                     {userGroup.user.name[0].toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <span>{userGroup.user.name}</span>
//               </div>
//               <span className={`font-medium ${
//                 userGroup.balance > 0 ? 'text-green-500' : 'text-red-500'
//               }`}>
//                 ₹{parseFloat(userGroup.balance.toString()).toLocaleString()}
//               </span>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//     // <>
//     //   <section>
//     //     <AddExpensePopup groupId={group.id} members={members} />
//     //     <div className="grid grid-cols-1 md:grid-cols-5">
//     //       {/* Rest of your layout */}
//     //       <div className="col-span-2 p-5 flex flex-col h-[400px]">
//     //         <div className="flex flex-col gap-6">
//     //           <h1 className="h3-bold">{group.name}</h1>
//     //         </div>
//     //         <div className="mt-10">
//     //           <p className="font-semibold">Members</p>
//     //           {members.map((member) => (
//     //             <p key={member.id}>{member.name} <span>Balance : </span>{member.balance}</p>
//     //           ))}
//     //         </div>
//     //         <div className="mt-auto">
//     //           <div>
//     //             Created on :{' '}
//     //             <span className="text-sm text-muted-foreground">
//     //               {new Date(group.createdAt).toLocaleDateString('en-US', {
//     //                 year: 'numeric',
//     //                 month: 'short',
//     //                 day: 'numeric',
//     //               })}
//     //             </span>
//     //           </div>
//     //           <div>
//     //             Last Updated on :{' '}
//     //             <span className="text-sm text-muted-foreground">
//     //               {new Date(group.updatedAt).toLocaleDateString('en-US', {
//     //                 year: 'numeric',
//     //                 month: 'short',
//     //                 day: 'numeric',
//     //               })}
//     //             </span>
//     //           </div>
//     //         </div>
//     //       </div>
//     //     </div>
//     //   </section>
//     // </>
//   );
// };

// export default GroupPage;

// app/group/[groupId]/page.tsx
import { getGroupById } from '@/lib/actions/user.action';
import { notFound } from 'next/navigation';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpensePopup } from '@/components/expenses/AddExpensePopup';
import { GroupBalance } from '@/components/GroupBalance';
import { auth } from '@/auth';

const GroupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const group = await getGroupById(resolvedParams.id);
  if (!group) notFound();
  const session = await auth();

  const members = Array.isArray(group.userGroups)
    ? group.userGroups.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
      }))
    : [];

  const expenses = group.expenses.map((expense) => ({
    id: expense.id,
    amount: expense.amount.toString(),
    description: expense.description,
    createdAt: expense.createdAt.toString(),
    paidBy: {
      name: expense.paidBy.name,
      image: expense.paidBy.image || null,
    },
  }));

  console.log(typeof(session?.user?.id));

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{group.name}</h1>
        <GroupBalance
          userId={session?.user?.id || ''}
          userGroups={group.userGroups}
        />
        <AddExpensePopup groupId={group.id} members={members} />
      </div>

      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default GroupPage;
