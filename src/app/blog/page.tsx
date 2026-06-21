import { Effect } from "effect";
import type { Metadata } from "next";
import { PostList } from "@/components/post-list";
import { getAllPosts } from "@/lib/blog";

export const metadata: Metadata = {
        title: "Writing | Faris Habib",
        description: "",
};

export default async function BlogPage() {
        const posts = await Effect.runPromise(
                getAllPosts.pipe(Effect.orElseSucceed(() => [])),
        );

        return (
                <div>
                        <h1 className="sr-only">Writing</h1>
                        <PostList posts={posts} />
                </div>
        );
}
