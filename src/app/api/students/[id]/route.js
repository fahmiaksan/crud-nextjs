import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await prisma.student.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  const { id } = params;

  try {
    const student = await prisma.student.findUnique({ where: { id: Number(id) } });

    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

    const body = await req.json();

    if (!body.fullname || !body.email || !body.student_id_number || !body.classId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updatedStudent = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        fullname: body.fullname,
        email: body.email,
        student_id_number: body.student_id_number,
        classId: Number(body.classId),
      },
      include: { class: true },
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}
