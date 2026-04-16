import { create } from "zustand";
import { persist } from "zustand/middleware";

const useStore = create(
  persist(
    (set, get) => ({
      // Auth state
      user: null,
      token: null,
      isAuthenticated: false,

      // UI state
      theme: "dark",
      sidebarOpen: false,

      // Actions
      setAuth: (user, token) => {
        localStorage.setItem("cga_token", token);
        localStorage.setItem("cga_user", JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData },
        }));
      },

      logout: () => {
        localStorage.removeItem("cga_token");
        localStorage.removeItem("cga_user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      toggleTheme: () => {
        set((state) => {
          const newTheme = state.theme === "dark" ? "light" : "dark";
          document.documentElement.classList.toggle("dark", newTheme === "dark");
          return { theme: newTheme };
        });
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),

      addXP: (amount) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                xp: (state.user.xp || 0) + amount,
                totalXp: (state.user.totalXp || 0) + amount,
              }
            : null,
        }));
      },

      addBadge: (badge) => {
        set((state) => ({
          user: state.user
            ? {
                ...state.user,
                badges: [...(state.user.badges || []), badge],
              }
            : null,
        }));
      },
    }),
    {
      name: "cyberguard-store",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
      }),
    }
  )
);

export default useStore;
