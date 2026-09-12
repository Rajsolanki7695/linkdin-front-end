import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { Edit3, MessageSquare } from "lucide-react";

export const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", headline: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState(null);

  const isSelf = currentUser?._id === id;

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/users/${id}`);
      setProfile(res.data);
      setFormData({
        name: res.data.name || "",
        headline: res.data.headline || "",
        bio: res.data.bio || "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const handleToggleFollow = async () => {
    try {
      const res = await API.post(`/follows/${id}/toggle`);
      setProfile((prev) => ({
        ...prev,
        isFollowing: res.data.isFollowing,
        followersCount: res.data.isFollowing
          ? prev.followersCount + 1
          : prev.followersCount - 1,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMessageUser = () => {
    if (!profile.isFollowing) {
      alert("You must follow this user before starting a chat.");
      return;
    }
    navigate(`/chat?userId=${profile._id}`);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("headline", formData.headline);
    data.append("bio", formData.bio);
    if (avatarFile) data.append("avatar", avatarFile);

    try {
      const res = await API.put("/users/profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile((prev) => ({ ...prev, ...res.data }));
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#f3f2ef]">
        <Navbar />
        <p className="text-center text-sm py-10">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <main className="mx-auto max-w-2xl py-6 px-3">
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
          <div className="h-28 bg-[#a0b4b7]" />
          <div className="relative px-6 pb-6 pt-0">
            <img
              src={
                profile.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Avatar"
              className="absolute -top-12 h-24 w-24 rounded-full border-4 border-white object-cover shadow"
            />

            <div className="pt-14 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.name}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {profile.headline || "No headline set"}
                </p>
                <div className="mt-2 flex gap-4 text-xs font-semibold text-gray-500">
                  <span>{profile.followersCount} Followers</span>
                  <span>{profile.followingCount} Following</span>
                </div>
              </div>

              {isSelf ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1 text-sm font-semibold text-[#0a66c2] border border-[#0a66c2] rounded-full px-4 py-1 hover:bg-blue-50"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleFollow}
                    className={`rounded-full px-5 py-1 text-sm font-semibold transition ${
                      profile.isFollowing
                        ? "border border-gray-400 text-gray-700 hover:bg-gray-100"
                        : "bg-[#0a66c2] text-white hover:bg-[#004182]"
                    }`}
                  >
                    {profile.isFollowing ? "Following" : "Follow"}
                  </button>
                  <button
                    onClick={handleMessageUser}
                    className="flex items-center gap-1.5 rounded-full border border-[#0a66c2] text-[#0a66c2] px-4 py-1 text-sm font-semibold hover:bg-blue-50 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-800">About</h3>
              <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                {profile.bio || "No bio added yet."}
              </p>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
              <h3 className="text-base font-bold text-gray-900 mb-4">
                Edit Profile
              </h3>
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full mt-1 border rounded p-2 text-sm outline-none focus:border-[#0a66c2]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) =>
                      setFormData({ ...formData, headline: e.target.value })
                    }
                    className="w-full mt-1 border rounded p-2 text-sm outline-none focus:border-[#0a66c2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full mt-1 border rounded p-2 text-sm outline-none focus:border-[#0a66c2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600">
                    Avatar Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                    className="w-full mt-1 text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 text-xs text-gray-600 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-[#0a66c2] text-white rounded font-semibold hover:bg-[#004182]"
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
