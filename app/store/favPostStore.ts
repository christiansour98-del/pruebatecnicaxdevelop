import { create } from "zustand";

type Post = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

interface FavPostStore {
  favPosts: Post[];
  addFavPost: (post: Post) => void;
  removeFavPost: (id: number) => void;
}

export const useFavPostStore = create<FavPostStore>((set) => ({
  favPosts: [],
  addFavPost: (post) =>
    set((state) => ({
      favPosts: [...state.favPosts, post],
    })),

  removeFavPost: (id) =>
    set((state) => ({
      favPosts: state.favPosts.filter((p) => p.id !== id),
    })),
}));