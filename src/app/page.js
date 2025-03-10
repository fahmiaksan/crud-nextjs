"use client";
import NavbarComponent from "@/components/Navbar";
import SearchComponent from "@/components/atoms/search";

export default function Home() {
  return (
    <>
      <NavbarComponent />
      <main className="flex min-h-screen flex-col items-center p-24 space-y-6">
        <h1 className="text-4xl font-bold">Hello world!</h1>
        <SearchComponent />
      </main>
    </>
  );
}
