'use client';
import React from 'react';

const MemberBalance = ({
  groupId,
  members = [],
}: {
  groupId?: string;
  members?: {
    id: string;
    name: string;
    balance: number;
    creditorDebt: number;
    debtorDebt: number;
  }[];
}) => {
  if (!groupId || !members.length) {
    return <p className="text-gray-500">Loading members...</p>;
  }

  const creditors = members.filter((m) => m.balance > 0);
  const debtors = members.filter((m) => m.balance < 0);

  // Generate transactions for settling debts
  const transactions = debtors.flatMap((debtor) =>
    creditors
      .filter((creditor) => creditor.balance > 0)
      .map((creditor) => ({
        from: debtor.name,
        to: creditor.name,
        amount: Math.min(Math.abs(debtor.balance), creditor.balance),
      }))
  );

  return (
    <div className="p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Group Members & Balances</h2>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between p-3 border rounded-lg"
          >
            <span className="font-medium">{member.name}</span>
            <span className={`${
                member.balance >= 0 ? 'text-green-500' : 'text-red-500'
              } font-semibold`}>
              ₹{member.balance}
            </span>
          </div>
        ))}
      </div>
      <h2 className="text-lg font-semibold mt-6">Who Owes Whom</h2>
      <div className="mt-3 space-y-2">
        {transactions.length > 0 ? (
          transactions.map((txn, index) => (
            <div key={index} className="p-2 border rounded-lg">
              <span className="font-medium">{txn.from}</span> owes ₹{txn.amount} to{' '}
              <span className="font-medium">{txn.to}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No pending balances</p>
        )}
      </div>
    </div>
  );
};

export default MemberBalance;
