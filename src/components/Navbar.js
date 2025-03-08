import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button } from "@heroui/react";
import { useSession } from 'next-auth/react';

export const AcmeLogo = () => {

  return (
    <svg fill="none" height="36" viewBox="0 0 32 32" width="36">
      <path
        clipRule="evenodd"
        d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};


const NavbarComponent = () => {
  const session = useSession();
  return (
    <Navbar>
      <NavbarBrand>
        <AcmeLogo />
        <p className="font-bold text-inherit">MyEdu</p>
      </NavbarBrand>

      <NavbarContent justify="end">

        {
          session.status === "authenticated" ? (
            <NavbarItem className="hidden lg:flex">
              <Link href="/dashboard">Dashboard</Link>
            </NavbarItem>
          ) : session.status === "unauthenticated" && (
            <>
              <NavbarItem className="hidden lg:flex">
                <Link href="/login">Login</Link>
              </NavbarItem>
              <NavbarItem>
                <Button as={Link} color="primary" href="/sign-up" variant="flat">
                  Sign Up
                </Button>
              </NavbarItem>
            </>
          )
        }

        {
          session.status === "loading" ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : null
        }
      </NavbarContent>

    </Navbar>
  );
}

export default NavbarComponent;