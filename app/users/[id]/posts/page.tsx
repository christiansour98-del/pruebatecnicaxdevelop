"use client";
import { useFavPostStore } from "@/app/store/favPostStore";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";

type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

type Comment = {
  id: number;
  name: string;
  email: string;
  body: string;
};

async function fetchPostsByUser(userId: string): Promise<Post[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${userId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

async function fetchCommentsByPost(postId: number): Promise<Comment[]> {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts/${postId}/comments`,
  );
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
}

// Separate component per post so each has its own query
function PostItem({ post }: { post: Post }) {
  const favPosts = useFavPostStore((state) => state.favPosts);
  const isFav = favPosts.some((fav: Post) => fav.id === post.id); // ← fixed

  console.log(favPosts);
  const [expanded, setExpanded] = useState(false);
  const { addFavPost, removeFavPost } = useFavPostStore();
  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", post.id],
    queryFn: () => fetchCommentsByPost(post.id),
    enabled: expanded, // ← only fetches when expanded
  });

  return (
    <li style={{ borderBottom: "1px solid #eee", padding: "12px 0" }}>
      <strong>{post.title}</strong>
      <p style={{ color: "#666", marginTop: 4 }}>{post.body}</p>

      <button
        onClick={() => setExpanded((prev) => !prev)}
        style={{ marginTop: 8, padding: "4px 10px", cursor: "pointer" }}
      >
        {expanded ? "Hide comments" : "Show comments"}
      </button>
      <button
        style={{
          marginLeft: 8,
          marginTop: 8,
          padding: "4px 10px",
          cursor: "pointer",
        }}
        onClick={() =>
          !isFav
            ? addFavPost({
                userId: post.userId,
                id: post.id,
                title: post.title,
                body: post.body,
              })
            : removeFavPost(post.id)
        }
      >
        {" "}
        {isFav ? "Favorite" : "Add to fav"}
      </button>
      {expanded && (
        <div
          style={{
            marginTop: 12,
            paddingLeft: 16,
            borderLeft: "3px solid #eee",
          }}
        >
          {isLoading ? (
            <p style={{ color: "#aaa" }}>Loading comments...</p>
          ) : (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {comments?.map((comment) => (
                <li key={comment.id} style={{ marginBottom: 12 }}>
                  <strong style={{ fontSize: 13 }}>{comment.name}</strong>
                  <span style={{ fontSize: 12, color: "#888", marginLeft: 8 }}>
                    {comment.email}
                  </span>
                  <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
                    {comment.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}

export default function UserPostsPage() {
  const { id } = useParams();

  const {
    data: posts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["posts", id],
    queryFn: () => fetchPostsByUser(id as string),
  });

  if (isLoading) return <p>Loading posts...</p>;
  if (isError) return <p>Error: {(error as Error).message}</p>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Posts for user {id}</h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {posts?.map((post) => (
          <PostItem key={post.id} post={post} />
        ))}
      </ul>
    </div>
  );
}
