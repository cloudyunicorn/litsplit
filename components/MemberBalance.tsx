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
  console.log(members);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Group Members & Balances</h2>
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex justify-between p-3 border rounded-lg"
          >
            <span className="font-medium">{member.name}</span>
            <span className="text-gray-600 dark:text-gray-300">
              ₹{member.balance}
            </span>
            <br />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberBalance;
