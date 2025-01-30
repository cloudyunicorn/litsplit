'use server';

import {
  signInFormSchema,
  signUpFormSchema
} from '../validators';
import { signIn, signOut } from '@/auth';
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { formatError } from "../utils";

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
  return await prisma.user.findMany({
    orderBy: {name: 'asc'}
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findFirst({
    where: { id: id },
  });
}

export async function getGroupById(id: string) {
  return await prisma.group.findFirst({
    where: { id: id },
  });
}

export const createGroupByUser = async (userId: string, groupName: string, memberIds: string[]) => {
  try {
    // Step 1: Create a new group
    const newGroup = await prisma.group.create({
      data: {
        name: groupName,
        members: {
          connect: [{ id: userId }, ...memberIds.map(id => ({ id }))], // Connect the user and the other members to the group
        },
      },
    });

    // Step 2: Add the group to the user’s groups if needed
    const userUpdate = await prisma.user.update({
      where: { id: userId },
      data: {
        groups: {
          connect: { id: newGroup.id },
        },
      },
    });

    return { newGroup, userUpdate };

  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};

export const getAllGroupsByUser = async (userId: string | undefined) => {
  try {
    // Fetch all groups that the user is a member of
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: {
            id: userId,  // Look for the user in the members field of each group
          },
        },
      },
      include: {
        members: true,  // Optionally include members to see all members in the group
        expenses: true, // Optionally include expenses within each group
      },
    });

    if (groups.length === 0) {
      throw new Error('No groups found for this user');
    }

    return groups;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { success: false, message: formatError(error) };
  }
};
