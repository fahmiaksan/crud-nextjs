import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const students = await prisma.student.findMany({
      include: { class: true },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { fullname, email, student_id_number, classId } = await req.json();

    // Validasi data
    if (!fullname || !email || !student_id_number || !classId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    // Cek apakah Student ID sudah digunakan
    const existingStudent = await prisma.student.findUnique({ where: { student_id_number } });
    if (existingStudent) {
      return NextResponse.json({ error: "Student ID already exists" }, { status: 400 });
    }

    const newStudent = await prisma.student.create({
      data: { fullname, email, student_id_number, classId: Number(classId) },
      include: { class: true }
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}