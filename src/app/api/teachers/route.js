import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { AddTeacherSchema } from "@/lib/zod";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { classes: true, subjects: true },
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
    const body = await req.json();
    const validationSchema = AddTeacherSchema.safeParse(body);
    if (!validationSchema.success) {
      return NextResponse.json({ error: validationSchema.error.errors.map(err => err.message) }, { status: 400 });
    }

    const { email, fullname, password, classId, subjectId } = validationSchema.data;

    const validation = await prisma.teacher.findUnique({ where: { email } });
    if (validation) {
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
        classes: { connect: classId.map((classId) => ({ id: Number(classId) })) },
        subjects: { connect: subjectId.map((subjectId) => ({ id: Number(subjectId) })) }
      },
      include: { classes: true, subjects: true },
    });


    return NextResponse.json(newTeacher, { status: 201, message: "Teacher created successfully" });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json({ message: "Failed to create teacher" }, { status: 500 });
  }
}

