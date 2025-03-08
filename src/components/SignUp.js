"use client";

import { useActionState } from "react";
import { Input, Card } from "@heroui/react";
import { signUpCredentials } from "@/lib/action";
import { ButtonAuth } from "./atoms/button";
export default function RegisterComponent() {
  const [state, formAction] = useActionState(signUpCredentials, null);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800">
      <Card className="p-6 w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Register</h2>
          <p className=" text-gray-500 text-sm mt-2">
            Fill in your details to create an account
          </p>
          {
            state?.message ? (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                role="alert">
                <span className="font-medium">Error!</span> {state?.message}
              </div>
            ) : null
          }
        </div>

        {/* Form Register */}
        <form action={formAction} className="space-y-3">
          <div>
            <Input label="Full Name" name="fullname" />
            <p className="text-red-500 text-sm">{state?.error?.fullname}</p>
          </div>

          <div>
            <Input label="Email" type="email" name="email" />
            <p className="text-red-500 text-sm">{state?.error?.email}</p>

          </div>

          <div>
            <Input label="Password" type="password" name="password" />
            <p className="text-red-500 text-sm">{state?.error?.password}</p>

          </div>

          <div>
            <Input label="ConfirmPassword" name="ConfirmPassword" type="password" />
            <p className="text-red-500 text-sm">{state?.error?.ConfirmPassword}</p>
          </div>

          <ButtonAuth />
        </form>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 font-medium">
            Sign in
          </a>
        </div>
      </Card>
    </div>
  );
}
