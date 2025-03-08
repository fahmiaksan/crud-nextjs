import { create } from "zustand";
import { persist } from "zustand/middleware";
import useTeacherStore from "./useTeacherStore";
const useSubjectStore = create(
  persist(
    (set) => ({
      subjects: [],
      fetchSubjects: async () => {
        const res = await fetch("/api/subjects", { cache: "no-store", method: "GET" });
        if (res.ok) set({ subjects: await res.json() });
      },
      setSubjects: (subjects) => set({ subjects }),
      addSubject: (subject) => set((state) => ({ subjects: [...state.subjects, subject] })),
      updateSubject: (updatedSubject) => {
        set((state) => {
          return ({
            subjects: state.subjects.map((s) => (s.id === updatedSubject.id ? updatedSubject : s)),
          })
        });
      },
      deleteSubject: (id) =>
        set((state) => ({
          subjects: state.subjects.filter((s) => s.id !== id),
        })),
    }),
    {
      name: 'subjects-storage'
    }));

export default useSubjectStore;
