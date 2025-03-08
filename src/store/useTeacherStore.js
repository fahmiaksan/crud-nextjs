import { create } from "zustand";
import { persist } from "zustand/middleware";
const useTeacherStore = create(
  persist(
    (set) => ({
      teachers: [],

      setTeachers: (teachers) => set({ teachers }),

      addTeacher: (teacher) => set((state) => ({
        teachers: [...state.teachers, teacher],
      })),

      updatedTeacher: (updatedTeacher) => {

        set((state) => ({
          teachers: state.teachers.map((t) =>
            t.id === updatedTeacher.id ? { ...t, ...updatedTeacher } : t
          ),
        }));
      },


      deleteTeacher: (id) => set((state) => ({
        teachers: state.teachers.filter((t) => t.id !== id),
      })),
    }), {
    name: 'teachers-storage',
  }));

export default useTeacherStore;
