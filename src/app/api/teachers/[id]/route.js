import prisma from "@/lib/prisma";
import { updatedTeacherSchema } from "@/lib/zod";
import { NextResponse } from "next/server";

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Teacher ID is required" }, { status: 400 });
    }
    const body = await req.json();
    const validation = updatedTeacherSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }

    const { fullname, email, classId, subjectId } = validation.data

    const updatedTeacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: {
        fullname,
        email,
        classes: {
          set: classId && classId.length > 0
            ? classId.map((id) => ({ id: Number(id) })) : []
        },
        subjects: {
          set: subjectId && classId.length > 0
            ? subjectId.map((id) => ({ id: Number(id) })) : []
        }
      },
      include: { classes: true, subjects: true },
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
