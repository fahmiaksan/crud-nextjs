"use client";

import { useActionState } from "react";
import { Input, Card, Button } from "@heroui/react";
import { signUpCredentials } from "@/lib/action";
import { useFormStatus } from "react-dom";
export default function RegisterComponent() {
  const [state, formAction] = useActionState(signUpCredentials, null);
  const { pending } = useFormStatus();
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

          <Button
            type="submit"
            disabled={pending}
            className={`w-full ${pending ? 'cursor-wait' : 'cursor-pointer'} bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 `}
          >
            {
              pending ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) :
                "Register"
            }
          </Button>
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
