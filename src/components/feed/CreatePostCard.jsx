import React, { useState, useRef } from "react";
import { Image, Send, Video, FileText, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import API from "../../services/api";

export const CreatePostCard = ({ onPostCreated }) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setContent("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsOpen(false);
  };

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
      onPostCreated?.(res.data);
      resetForm();
    } catch (err) {
      alert(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    setIsOpen(true);
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const actions = [
    {
      label: "Video",
      Icon: Video,
      color: "text-[#0a8f4e]",
      iconClass: "h-6 w-6",
    },
    {
      label: "Photo",
      Icon: Image,
      color: "text-[#0a66c2]",
      iconClass: "h-6 w-6",
    },
    {
      label: "Write article",
      Icon: FileText,
      color: "text-[#b45309]",
      iconClass: "h-6 w-6",
    },
  ];

  return (
    <>
      <div className="mb-4 rounded-[30px] border border-[#d8d8d8] bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={
              user?.avatar ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt="User avatar"
            className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm"
          />

          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="flex-1 rounded-full border border-[#8c8c8c] bg-white px-3 py-2 text-left text-sm font-normal text-gray-500 transition hover:border-gray-500 hover:bg-gray-50"
          >
            Start a post
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-200 pt-4">
          {actions.map(({ label, Icon, color, iconClass }) => (
            <button
              key={label}
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-base font-medium text-gray-800 transition hover:bg-gray-100"
            >
              <Icon className={`${color} ${iconClass}`} />
              <span className="text-[#1f1f1f]">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">
                Create a post
              </h2>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <textarea
                rows={6}
                placeholder="What do you want to share?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-base outline-none focus:border-[#0a66c2] focus:bg-white"
              />

              <input
                type="text"
                placeholder="Add hashtags"
                className="mt-3 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm outline-none focus:border-[#0a66c2] focus:bg-white"
              />

              {image && (
                <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm text-gray-600">
                    <span>Attached: {image.name}</span>
                    <button
                      type="button"
                      onClick={() => setImage(null)}
                      className="text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => setImage(e.target.files[0])}
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={triggerUpload}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#0a66c2] hover:bg-blue-50"
                  >
                    <Image className="h-5 w-5 text-blue-600" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#0a8f4e] hover:bg-green-50"
                  >
                    <Video className="h-5 w-5 text-green-600" />
                    <span>Video</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-[#b45309] hover:bg-amber-50"
                  >
                    <FileText className="h-5 w-5 text-amber-700" />
                    <span>Write article</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading || (!content.trim() && !image)}
                  className="ml-4 flex items-center gap-2 rounded-full bg-[#0a66c2] px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#004182]"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Posting..." : "Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
