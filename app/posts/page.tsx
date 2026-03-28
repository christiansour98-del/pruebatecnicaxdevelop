"use client";
import { TextField, Button, Box } from "@mui/material";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

type Post = { userId: number; title: string; body: string; id?: number };

async function fetchAddPost(
  userId: number,
  title: string,
  body: string,
): Promise<Post> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    body: JSON.stringify({ title, body, userId }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  });
  if (!res.ok) throw new Error("Failed to add post");
  return res.json();
}

async function fetchModifyPost(
  id: number,
  userId: number,
  title: string,
  body: string,
): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title, body, userId, id }),
    headers: { "Content-type": "application/json; charset=UTF-8" },
  });
  if (!res.ok) throw new Error("Failed to modify post");
  return res.json();
}

export default function PostPage() {
  const role = useAuthStore((state) => state.role);
  const [post, setPost] = useState<Post>({ userId: 1, title: "", body: "" });

  const { mutate, data, isPending } = useMutation({
    mutationFn: () => fetchAddPost(post.userId, post.title, post.body),
  });

  return (
    <div className="w-full min-h-screen">
      <h3>Add Post</h3>
      <Box sx={{ gap: "1rem", display: "flex" }}>
        <TextField
          label="userId"
          value={post.userId}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, userId: Number(e.target.value) }))
          }
        />
        <TextField
          label="title"
          value={post.title}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <TextField
          label="body"
          value={post.body}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, body: e.target.value }))
          }
        />
        <Button
          variant="outlined"
          onClick={() => mutate()}
          disabled={role !== "admin" || isPending}
        >
          {isPending ? "Sending..." : "Send Request"}
        </Button>
      </Box>

      {data && (
        <ul>
          <li>{data.userId}</li>
          <li>{data.id}</li>
          <li>{data.title}</li>
          <li>{data.body}</li>
        </ul>
      )}

      <ModifyPost />
    </div>
  );
}

function ModifyPost() {
  const role = useAuthStore((state) => state.role);
  const [post, setPost] = useState<Post>({
    userId: 1,
    id: 1,
    title: "",
    body: "",
  });

  const { mutate, data, isPending } = useMutation({
    mutationFn: () =>
      fetchModifyPost(post.id!, post.userId, post.title, post.body),
  });

  return (
    <div className="w-full min-h-screen">
      <h3>Modify Post</h3>
      <Box sx={{ gap: "1rem", display: "flex" }}>
        <TextField
          label="userId"
          value={post.userId}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, userId: Number(e.target.value) }))
          }
        />
        <TextField
          label="Id"
          value={post.id}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, id: Number(e.target.value) }))
          }
        />
        <TextField
          label="title"
          value={post.title}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <TextField
          label="body"
          value={post.body}
          onChange={(e) =>
            setPost((prev) => ({ ...prev, body: e.target.value }))
          }
        />
        <Button
          variant="outlined"
          onClick={() => mutate()}
          disabled={role !== "admin" || isPending}
        >
          {isPending ? "Sending..." : "Send Request"}
        </Button>
      </Box>

      {data && (
        <ul>
          <li>{data.userId}</li>
          <li>{data.id}</li>
          <li>{data.title}</li>
          <li>{data.body}</li>
        </ul>
      )}
    </div>
  );
}
