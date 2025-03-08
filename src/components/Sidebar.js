"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ButtonLogout } from "./atoms/button";
import { Home, Book, Users, User, Layers } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: <Home className="w-5 h-5" /> },
  { name: "Class", path: "/dashboard/class", icon: <Layers className="w-5 h-5" /> },
  { name: "Subject", path: "/dashboard/subject", icon: <Book className="w-5 h-5" /> },
  { name: "Student", path: "/dashboard/student", icon: <Users className="w-5 h-5" /> },
  { name: "Teacher", path: "/dashboard/teacher", icon: <User className="w-5 h-5" /> },
];

export default function ModernSidebar() {
  const pathname = usePathname();

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen flex flex-col shadow-lg">
      <div className="text-center py-4 text-xl font-semibold">Admin Panel</div>
      <div className="absolute top-4 right-4 text-white hover:text-gray-400" />

      <div className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            as={Link}
            href={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-300 ${item.path === pathname ? "bg-gray-700" : ""}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-auto border-t border-gray-700 p-4">
        <ButtonLogout className="w-full" />
      </div>
    </div>
  );
}
