import { create } from "zustand";
import { persist } from "zustand/middleware";

const useClassStore = create(
  persist(
    (set) => ({
      classes: [],

      setClasses: (classes) => set({ classes }),

      addClass: (newClass) =>
        set((state) => ({ classes: [...state.classes, newClass] })),

      updateClass: (updatedClass) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === updatedClass.id ? updatedClass : cls
          ),
        })),
      updateClassWithStudent: (student) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === student.classId
              ? { ...cls, students: [...(cls.students || []), student] }
              : cls
          ),
        })),
      removeStudentFromClass: (studentId, classId) =>
        set((state) => ({
          classes: state.classes.map((cls) =>
            cls.id === classId
              ? { ...cls, students: (cls.students || []).filter((s) => s.id !== studentId) } // ❌ Hapus student dari kelas
              : cls
          ),
        })),

      deleteClass: (id) =>
        set((state) => ({
          classes: state.classes.filter((cls) => cls.id !== id),
        })),
    }),
    {
      name: 'classes-storage',
    }
  ));
export default useClassStore;
