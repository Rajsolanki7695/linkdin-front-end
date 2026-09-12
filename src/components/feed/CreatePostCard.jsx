import React, { useState, useRef } from "react";
import { Image, Send } from "lucide-react";
import API from "../../services/api";

export const CreatePostCard = ({ onPostCreated }) => {
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      const res = await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setContent("");
      setImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      onPostCreated(res.data);
    } catch (err) {
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mb-4">
      <form onSubmit={handleSubmit}>
        <textarea
          rows={3}
          placeholder="Start a post..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none rounded-md border border-gray-200 p-2.5 text-sm outline-none focus:border-[#0a66c2]"
        />

        {image && (
          <div className="mt-2 text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-2 rounded">
            <span>Attached: {image.name}</span>
            <button
              type="button"
              onClick={() => setImage(null)}
              className="text-red-500"
            >
              Remove
            </button>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#0a66c2]"
          >
            <Image className="h-4 w-4 text-blue-500" />
            <span>Photo</span>
          </button>

          <button
            type="submit"
            disabled={loading || (!content.trim() && !image)}
            className="flex items-center gap-1.5 rounded-full bg-[#0a66c2] px-4 py-1.5 text-sm font-semibold text-white disabled:opacity-50 hover:bg-[#004182] transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{loading ? "Posting..." : "Post"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
