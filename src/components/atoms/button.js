import { useFormStatus } from "react-dom"
import { Button } from "@heroui/react";
import { signOut } from "next-auth/react";
import { useState } from "react";
export function ButtonAuth() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 `}
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
  )
}

export function LoginAuth() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 `}
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
  )
}

// components/ButtonLogout.js



export const ButtonLogout = () => {
  const [loading, setLoading] = useState(false);
  const handleLogout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signOut().then(() => {
        setLoading(false);
      });
    } catch (error) {
      setLoading(false);
      throw new Error(error);
    }
  };

  return (
    <form onSubmit={handleLogout}>
      <button
        type="submit"
        disabled={loading}
        className="w-full text-left p-3 bg-red-500 hover:bg-red-600 rounded-lg"
      >
        {loading ? (
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : "Logout"}

      </button>
    </form>
  );
};
