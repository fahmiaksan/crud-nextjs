import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UpdateSubjectSchema } from "@/lib/zod";
export async function PUT(req) {
  try {
    const body = await req.json();
    const validation = UpdateSubjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }

    const { id, name, teacherId } = validation.data

    const existingSubject = await prisma.subject.findUnique({ where: { id: Number(id) } });
    if (!existingSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }
    const updatedSubject = await prisma.subject.update({
      where: { id: Number(id) },
      data: {
        name,
        teachers: teacherId && teacherId.length > 0
          ? { set: teacherId.map((id) => ({ id: Number(id) })) }
          : { set: [] },
      },
      include: { teachers: true }
    });

    return NextResponse.json(updatedSubject, { status: 200, message: "Subject updated successfully" });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    await prisma.subject.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}
