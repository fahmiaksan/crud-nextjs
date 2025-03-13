'use server';
import bcrypt from "bcryptjs";
import { RegisterSchema } from "./zod";
import prisma from "./prisma";
import { redirect } from "next/navigation"
import { auth, signIn } from "@/auth";
import { AuthError } from "next-auth";
import { SignInSchema } from "@/lib/zod";


export async function signUpCredentials(prevState, formData) {
  const validateFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    }
  }
  const {
    fullname,
    email,
    password
  } = validateFields.data;

  const hashPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.teacher.findUnique({
      where: {
        email
      }
    });

    if (user) {
      return {
        message: "Email already registered"
      };
    }

    await prisma.teacher.create({
      data: {
        fullname,
        email,
        password: hashPassword
      }
    })
  } catch (error) {
    return {
      message: "Failed to register user"
    };
  }

  redirect('/login');
}


export async function SignInCredentials(prevState, formData) {
  const validateFields = SignInSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!validateFields.success) {
    return {
      error: validateFields.error.flatten().fieldErrors,
    }
  }
  const {
    email,
    password
  } = validateFields.data;

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/dashboard'
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            message: "Email or password is incorrect!"
          };
        default:
          return {
            message: "Something went wrong! please try again"
          };
      }
    }
    throw error;
  }
}
