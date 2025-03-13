"use client";

import { Button, Input, Card } from "@heroui/react";
import { useActionState, useState } from "react";
import { SignInCredentials } from "@/lib/action";
import { useFormStatus } from "react-dom";

export default function LoginComponent() {
  const [state, formAction] = useActionState(SignInCredentials, null);
  const [showPassword, setShowPassword] = useState(false);
  const { pending } = useFormStatus();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800">
      <Card className="p-6 w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Login</h2>

          {state?.message && (
            <div
              className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
              role="alert"
            >
              <span className="font-medium">Error!</span> {state?.message}
            </div>
          )}

          <p className="text-gray-500 text-sm mt-2">
            Hey, Enter your details to sign in to your account
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-3">
          <div>
            <Input label="Enter Email" type="email" name="email" />
            <p className="text-red-500 text-sm">{state?.error?.email}</p>
          </div>

          <div className="relative">
            <Input
              label="Passcode"
              name="password"
              type={showPassword ? "text" : "password"}
            />
            <p className="text-red-500 text-sm">{state?.error?.password}</p>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
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
                "Login"
            }
          </Button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="text-blue-500 font-medium">
            Request Now
          </a>
        </div>
        <div className="text-center text-xs text-gray-500">
          Copyright @myedu 2025{" "}
        </div>
      </Card>
    </div>
  );
}