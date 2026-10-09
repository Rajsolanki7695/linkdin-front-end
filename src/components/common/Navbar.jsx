import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  MessageSquare,
  Search,
  LogOut,
  UserGroup,
  BriefcaseBusiness,
  Bell,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-gray-200 bg-white px-4">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-bold text-[#0a66c2] tracking-tighter"
          >
            in
          </Link>
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-md bg-[#edf3f8] py-1.5 pl-9 pr-3 text-sm outline-none focus:w-72 transition-all focus:ring-1 focus:ring-[#0a66c2]"
            />
          </form>
        </div>

        <div className="flex items-center gap-6 text-gray-600">
          <Link
            to="/"
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </Link>
          <Link
            to="/"
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <UserGroup className="h-5 w-5" />
            <span>My Network</span>
          </Link>
          <Link
            to="/"
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <BriefcaseBusiness className="h-5 w-5" />
            <span>Jobs</span>
          </Link>
          <Link
            to="/"
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <Bell className="h-5 w-5" />
            <span>Notification</span>
          </Link>
          <Link
            to="/chat"
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Messaging</span>
          </Link>
          <Link
            to={`/profile/${user?._id}`}
            className="flex flex-col items-center text-xs hover:text-black"
          >
            <img
              src={
                user?.avatar ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Avatar"
              className="h-5 w-5 rounded-full object-cover"
            />
            <span>Me</span>
          </Link>
          <button
            onClick={logout}
            className="flex flex-col items-center text-xs text-red-500 hover:text-red-700"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};
