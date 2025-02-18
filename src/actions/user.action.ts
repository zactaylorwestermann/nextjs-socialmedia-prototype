// server action -> create user data

"use server"; // making sure the code runs on the server as apposed to client

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

// updates database with current user
export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    // if there is no user id or user given, exit function
    if (!userId || !user) return;

    // check if user exists
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    // if the user is already in database, return
    if (existingUser) {
      return existingUser;
    }

    // add user data to database
    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        //if no username, take the email before the @ symbol and use that
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

// grabs the user by the clerk id
export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    // join user and follow tables for sidebar info
    include: {
      // take the number of followers, following and user posts
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

// utility function
export async function getDbUserId() {
  // comparing current user id to clerk database id
  const { userId: clerkId } = await auth();
  // no match means return error
  if (!clerkId) throw new Error("Unauthorised");

  // return the user id
  const user = await getUserByClerkId(clerkId);
  // no user id found returns error
  if (!user) throw new Error("User not found");

  return user.id;
}
