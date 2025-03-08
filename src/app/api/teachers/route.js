import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { class: true, subjects: true },
    });
    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json({ error: "Failed to fetch teachers" }, { status: 500 });
  }
}

// 📌 Tambah teacher baru
export async function POST(req) {
  try {
    const { fullname, email, password, classId } = await req.json();
    if (!fullname || !email || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const validation = await prisma.teacher.findUnique({ where: { email } });
    if (validation) {  // Hanya jika email sudah ada, munculkan error
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      const existingUser = await prisma.teacher.findUnique({ where: { email } });
      hashedPassword = existingUser ? existingUser.password : null;
    }
    const newTeacher = await prisma.teacher.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
        classId: classId ? Number(classId) : null
      },
      include: { class: true },
    });


    return NextResponse.json(newTeacher, { status: 201, message: "Teacher created successfully" });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ message: "Failed to create teacher" }, { status: 500 });
  }
}

