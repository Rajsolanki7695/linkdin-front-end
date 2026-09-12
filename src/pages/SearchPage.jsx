import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import API from "../services/api";
import { Navbar } from "../components/common/Navbar";

export const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setLoading(true);
    API.get(`/users/search?q=${encodeURIComponent(query)}`)
      .then((res) => setResults(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen bg-[#f3f2ef]">
      <Navbar />
      <main className="mx-auto max-w-xl py-6 px-3">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          Search results for "{query}"
        </h3>

        {loading ? (
          <p className="text-center text-sm py-4 text-gray-500">Searching...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-sm py-4 text-gray-500">
            No users found.
          </p>
        ) : (
          <div className="space-y-2">
            {results.map((u) => (
              <Link
                key={u._id}
                to={`/profile/${u._id}`}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow transition"
              >
                <img
                  src={
                    u.avatar ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt={u.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {u.name}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {u.headline || "Member"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
