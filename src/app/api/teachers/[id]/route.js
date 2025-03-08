import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }

    const { fullname, email, classId } = await req.json();
    if (!fullname || !email || !classId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        fullname,
        email,
        classId: Number(classId),
      },
      include: { class: true, subjects: true },
    });

    if (!updatedTeacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Teacher updated successfully", data: updatedTeacher }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function DELETE(req, { params }) {
  try {
    const { id } = await params; // ✅ Tidak perlu await
    await prisma.teacher.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Teacher deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    return NextResponse.json({ error: "Failed to delete teacher" }, { status: 500 });
  }
}
