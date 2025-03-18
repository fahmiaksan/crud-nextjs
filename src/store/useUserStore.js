import {
  create,
} from "zustand";
import {
  persist
} from 'zustand/middleware';

export const useUserStore = create(
  persist((set) => ({
    users: [],
    setUser: user => set({ user }),
    createUserStore: user => set(state => (
      {
        users: user.id === state.id ? user : [...state.user, user]
      }
    )),
    updateUserStore: (user) => set(state => ({
      users: state.user.map(u => u.id === user.id ? user : u)
    })),
    deleteUserStore: id => set(state =>
    ({
      users: state.user.filter(u => u.id !== id)
    })),
  }), {
    name: 'user-storage'
  }
  ),
)