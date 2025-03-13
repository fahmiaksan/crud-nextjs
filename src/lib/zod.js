import { array, number, object, string } from "zod";

export const RegisterSchema = object({
  fullname: string().min(3, 'Fullname must be at least 3 characters'),
  email: string().email('Invalid email format'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be at most 32 characters'),
  ConfirmPassword: string().min(8, 'Password must be at least 8 characters').max(32, 'Password must be at most 32 characters'),
}).refine(data => data.password === data.ConfirmPassword, {
  message: 'Passwords do not match',
  path: ['ConfirmPassword'],
});

export const SignInSchema = object({
  email: string().email('Invalid email format'),
  password: string()
    .min(8, 'Password must be at least 8 characters')
    .max(32, 'Password must be at most 32 characters'),
});

export const AddClassSchema = object({
  name: string().min(3, 'Class name must be at least 3 characters').max(50, 'Class name must be at most 50 characters'),
  teacherId: array(number()).optional(),
});
export const UpdateClassSchema = object({
  name: string().min(3, "Class name must be at least 3 characters").max(50, "Class name must be at most 50 characters"),
  teacherId: array(number()).optional(),
});
export const AddSubjectSchema = object({
  name: string().min(2, "Subject name must be at least 2 characters").max(50, "Subject name must be at most 50 characters"),
  teacherId: array(number()).optional(),
});
export const UpdateSubjectSchema = object({
  id: number(),
  name: string().min(2, "Subject name must be at least 2 characters").max(50, "Subject name must be at most 50 characters").optional(),
  teacherId: array(number()).optional(),
});

export const AddTeacherSchema = object({
  fullname: string().min(3, "Fullname must be at least 3 characters").max(50, "Fullname must be at most 50 characters"),
  email: string().email("Invalid email format"),
  password: string().min(8, "Password must be at least 8 characters").max(32, "Password must be at most 32 characters"),
  classId: array(number()).optional(),
  subjectId: array(number()).optional(),
});

export const updatedTeacherSchema = object({
  fullname: string().min(2, "Subject name must be at least 2 characters").max(50, "Subject name must be at most 50 characters").optional(),
  email: string().email("Invalid email format"),
  subjectId: array(number()).optional(),
  classId: array(number()).optional(),
});