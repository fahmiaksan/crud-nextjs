import { create } from "zustand";
import useClassStore from "./useClassStore";
import { persist } from "zustand/middleware";

const useStudentStore = create(
  persist(
    (set) => ({
      students: [], // State awal
      setStudents: (students) => set({ students }),
      addStudent: (newStudent) =>
        set((state) => ({ students: [...state.students, newStudent] })),

      updateStudent: (updatedStudent) => {
        set((state) => ({
          students: state.students.map((std) =>
            std.id === updatedStudent.id ? updatedStudent : std
          ),
        }));
      },

      deleteStudent: (id) => {

        set((state) => ({
          students: state.students.filter((std) => std.id !== id),
        }));
      },
    }), {
    name: 'students-storage'
  }));

export default useStudentStore;
