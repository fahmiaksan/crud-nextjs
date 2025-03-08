'use client';

import { Button, Input, Card } from '@heroui/react';
import { LoginAuth } from './atoms/button';
import { useActionState, useState } from 'react';
import { SignInCredentials } from '@/lib/action';
import { FcGoogle } from "react-icons/fc";
export default function LoginComponent() {
  const [state, formAction] = useActionState(SignInCredentials, null);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-800">
      <Card className="p-6 w-full max-w-md space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Login</h2>

          {
            state?.message ? (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
                role="alert">
                <span className="font-medium">Error!</span> {state?.message}
              </div>
            ) : null
          }

          <p className="text-gray-500 text-sm mt-2">
            Hey, Enter your details to get sign in to your account
          </p>
        </div>

        {/* Form */}
        <form action={formAction} className="space-y-3">
          <div>
            <Input label="Enter Email" type='email' name='email' />
            <p className="text-red-500 text-sm">{state?.error?.email}</p>
          </div>

          <div className="relative">
            <Input
              label="Passcode"
              name='password'
              type={showPassword ? 'text' : 'password'}
            />
            <p className="text-red-500 text-sm">{state?.error?.password}</p>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-sm text-gray-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>


          <LoginAuth />
        </form>

        {/* Social Login */}
        <div className="text-center text-gray-500">Or Sign in with</div>
        <div className="flex justify-center gap-4">
          <Button variant="outline" className="w-28">
            <FcGoogle className="mr-2" /> Google
          </Button>

        </div>

        <div className="text-center text-sm text-gray-600">
          Dont have an account?{' '}
          <a href="/sign-up" className="text-blue-500 font-medium">
            Request Now
          </a>
        </div>
        <div className="text-center text-xs text-gray-500">
          Copyright @myedu 2025{' '}

        </div>
      </Card>
    </div>
  );
}
