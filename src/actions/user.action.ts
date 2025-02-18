// server action -> create user data

"use server"; // making sure the code runs on the server as apposed to client

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

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
