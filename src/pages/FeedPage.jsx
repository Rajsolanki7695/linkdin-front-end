import React, { useEffect, useState } from "react";
import API from "../services/api";
import { Navbar } from "../components/common/Navbar";
import { CreatePostCard } from "../components/feed/CreatePostCard";
import { PostCard } from "../components/feed/PostCard";

export const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      const res = await API.get("/posts");
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const handlePostCreated = (newPost) =>
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  const handlePostUpdated = (updated) =>
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updated._id ? updated : p)),
    );
  const handlePostDeleted = (id) =>
    setPosts((prevPosts) => prevPosts.filter((p) => p._id !== id));

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <main className="mx-auto max-w-xl py-6 px-3">
        <CreatePostCard onPostCreated={handlePostCreated} />
        {loading ? (
          <p className="text-center text-sm text-gray-500 py-6">
            Loading feed...
          </p>
        ) : posts.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-6">
            No posts yet. Be the first to share something!
          </p>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onPostUpdated={handlePostUpdated}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </main>
    </div>
  );
};
