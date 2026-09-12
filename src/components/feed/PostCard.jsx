import React, { useState } from "react";
import { ThumbsUp, Trash2, Edit2, Check, X } from "lucide-react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const PostCard = ({ post, onPostUpdated, onPostDeleted }) => {
  const { user } = useAuth();
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const isOwner = user?._id === post.author?._id;

  const handleToggleLike = async () => {
    try {
      const res = await API.post(`/posts/${post._id}/like`);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    try {
      const res = await API.put(`/posts/${post._id}`, { content: editContent });
      setIsEditing(false);
      onPostUpdated(res.data);
    } catch (err) {
      alert("Failed to update post");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/posts/${post._id}`);
      onPostDeleted(post._id);
    } catch (err) {
      alert("Failed to delete post");
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-4">
      <div className="flex items-start justify-between">
        <Link
          to={`/profile/${post.author?._id}`}
          className="flex items-center gap-3"
        >
          <img
            src={
              post.author?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={post.author?.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div>
            <h4 className="text-sm font-semibold text-gray-900 leading-tight hover:underline">
              {post.author?.name}
            </h4>
            <p className="text-xs text-gray-500">
              {post.author?.headline || "Member"}
            </p>
          </div>
        </Link>

        {isOwner && (
          <div className="flex items-center gap-2 text-gray-400">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="hover:text-gray-700"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button onClick={handleDelete} className="hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-800">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              rows={2}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-[#0a66c2]"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                className="flex items-center gap-1 rounded bg-[#0a66c2] px-3 py-1 text-xs text-white"
              >
                <Check className="h-3 w-3" /> Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-1 rounded bg-gray-200 px-3 py-1 text-xs text-gray-700"
              >
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="whitespace-pre-line">{post.content}</p>
        )}
      </div>

      {post.image && (
        <div className="mt-3 overflow-hidden rounded border border-gray-100">
          <img
            src={post.image}
            alt="Post content"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-2">
        <button
          onClick={handleToggleLike}
          className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded hover:bg-gray-100 ${
            isLiked ? "text-[#0a66c2]" : "text-gray-600"
          }`}
        >
          <ThumbsUp className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{likesCount} Likes</span>
        </button>
      </div>
    </div>
  );
};
