import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      loginWithToken(token).then(() => {
        navigate("/", { replace: true });
      });
    } else {
      navigate("/login?error=auth_failed", { replace: true });
    }
  }, [searchParams]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-gray-600">Completing sign in...</p>
    </div>
  );
};
