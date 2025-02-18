import CreatePost from "@/components/CreatePost";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  //make the create post section only visible if user is logged in
  const user = await currentUser();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {/* if the user is signed in, show createpost, otherwise null*/}
        {user ? <CreatePost /> : null}
      </div>
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        Who to Follow
      </div>
    </div>
  );
}
