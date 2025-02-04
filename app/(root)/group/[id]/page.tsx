import { getGroupById, getGroupWithMembers } from '@/lib/actions/user.action';
import { notFound } from 'next/navigation';
import { ExpenseList } from '@/components/ExpenseList';
import { AddExpensePopup } from '@/components/expenses/AddExpensePopup';
import { GroupBalance } from '@/components/GroupBalance';
import { auth } from '@/auth';
import MemberBalance from '@/components/MemberBalance';
import { ManageGroupMembers } from "@/components/ManageGroupMembers";

const GroupPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const resolvedParams = await params;
  const group = await getGroupById(resolvedParams.id);
  const groupWithMember = await getGroupWithMembers(resolvedParams.id);
  if (!group) notFound();
  if(!groupWithMember) notFound();
  const session = await auth();

  const plainGroup = JSON.parse(
    JSON.stringify({
      ...groupWithMember,
      userGroups: groupWithMember!.userGroups.map((ug) => ({
        user: ug.user,
        balance: Number(ug.balance) // conversion from Prisma Decimal type
      }))
    })
  );

  const creatorId = plainGroup.userGroups[0]?.user?.id;

  const members = Array.isArray(group.userGroups)
    ? group.userGroups.map((mem) => ({
        id: mem.user.id,
        name: mem.user.name,
        balance: Number(mem.balance), // ✅ Now balance is included
        creditorDebt: group.expenses
          .flatMap((expense) => expense.debts)
          .filter((debt) => debt.creditor.id === mem.user.id)
          .reduce((total, debt) => total + Number(debt.amount), 0), // ✅ Total creditor debt
        debtorDebt: group.expenses
          .flatMap((expense) => expense.debts)
          .filter((debt) => debt.debtor.id === mem.user.id)
          .reduce((total, debt) => total + Number(debt.amount), 0), // ✅ Total debtor debt
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

  

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center gap-4">
        <h1 className="text-lg font-bold">{group.name}</h1>
        <GroupBalance
          userId={session?.user?.id || ''}
          userGroups={group.userGroups}
        />
        <AddExpensePopup groupId={group.id} members={members} />
      </div>
      <MemberBalance
        groupId={group.id}
        members={members}
      />

       <ManageGroupMembers
        groupId={plainGroup.id}
        currentMembers={plainGroup.userGroups}
        creatorId={creatorId}
      />

      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default GroupPage;
