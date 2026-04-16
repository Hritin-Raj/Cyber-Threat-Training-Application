import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";

export const useRequireAuth = () => {
  const { isAuthenticated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated;
};

export const useRedirectIfAuth = () => {
  const { isAuthenticated } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
};
