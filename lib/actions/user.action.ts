'use server';

import {
  createGroupSchema,
  signInFormSchema,
  signUpFormSchema
} from '../validators';
import { auth, signIn, signOut } from '@/auth';
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";
import { z } from "zod";

type CreateGroupForm = z.infer<typeof createGroupSchema>;

// Sign in the user with credentials
export async function signInWithCredentials(
  prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: 'Invalid email or password' };
  }
}

// Sign user out
export async function signOutUser() {
  await signOut({redirectTo: '/'});
}

// Sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    const plainPassword = user.password;

    user.password = await hashSync(user.password);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: 'User registered successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
  });

  return users.map((user) => ({
    ...user,
    totalBalance: user.totalBalance.toString(), // Convert Decimal
  }));
}

export async function getUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id: id },
  });
}

export async function getGroupById(id: string) {
  const group = await prisma.group.findFirst({
    where: { id },
    include: { userGroups: true }, // Include userGroups
  });

  if (!group) return null;

  return {
    ...group,
    userGroups: group.userGroups.map((ug) => ({
      ...ug,
      balance: ug.balance.toString(), // Convert Decimal to string
    })),
  };
}

export async function createGroup(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; data?: unknown }> {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: "Not authenticated" };
    }

    // Parse form data safely
    const rawData = {
      name: formData.get("name") as string || "",
      memberEmails: JSON.parse(formData.get("memberEmails") as string || "[]"),
    };

    // Validate using Zod
    const validatedData: CreateGroupForm = createGroupSchema.parse(rawData);

    // Get current user ID
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    // Transaction to create group and manage members
    const result = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name: validatedData.name,
          userGroups: {
            create: [{ userId: currentUser.id }],
          },
        },
        include: { userGroups: true },
      });

      // Remove duplicates and exclude self
      const cleanEmails = [...new Set(validatedData.memberEmails)].filter(
        (email) => email !== session?.user?.email
      );

      // Find existing users
      const existingUsers = await tx.user.findMany({
        where: { email: { in: cleanEmails } },
        select: { id: true, email: true },
      });

      // Add existing users to the group
      await tx.userGroup.createMany({
        data: existingUsers.map((user) => ({
          userId: user.id,
          groupId: newGroup.id,
          balance: 0,
        })),
      });

      // Identify new emails (users not in DB)
      const existingEmails = existingUsers.map((user) => user.email);
      const newEmails = cleanEmails.filter(
        (email) => !existingEmails.includes(email)
      );

      // Create invitations for new emails
      await tx.invitation.createMany({
        data: newEmails.map((email) => ({
          email,
          groupId: newGroup.id,
          senderId: currentUser.id,
          status: "PENDING",
        })),
      });

      return newGroup;
    });

    return {
      success: true,
      message: `Group '${result.name}' created successfully!`,
      data: {
    ...result,
    userGroups: result.userGroups.map((ug) => ({
      ...ug,
      balance: ug.balance.toString(), // Convert Decimal
    })),
  },
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      success: false,
      message: formatError(error),
      data: null,
    };
  }
}

// export async function getAllGroupsByUser() {
//   const session = await auth();
//   if (!session?.user?.email) return [];

//   return await prisma.userGroup.findMany({
//     where: { userId: session.user.id },
//     include: {
//       group: {
//         select: {
//           id: true,
//           name: true,
//           createdAt: true,
//           currency: true
//         }
//       }
//     },
//   });
// }

export async function getAllGroupsByUser() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return {
        success: false,
        message: "Not authenticated",
        data: null
      };
    }

    // First get raw results from Prisma
    const rawGroups = await prisma.userGroup.findMany({
      where: { 
        userId: session.user.id 
      },
      include: {
        group: {
          include: {
            userGroups: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            expenses: {
              take: 3,
              orderBy: {
                createdAt: 'desc'
              }
            }
          }
        }
      }
    });

    // Manually transform Decimal values to strings
    const groups = rawGroups.map(userGroup => ({
      ...userGroup,
      balance: userGroup.balance.toString(),
      group: {
        ...userGroup.group,
        expenses: userGroup.group.expenses.map(expense => ({
          ...expense,
          amount: expense.amount.toString()
        }))
      }
    }));

    return {
      success: true,
      message: "Groups fetched successfully",
      data: groups
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      data: null
    };
  }
}
