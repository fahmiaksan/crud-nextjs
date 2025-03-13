import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { UpdateClassSchema } from '@/lib/zod';

// DELETE: Hapus kelas berdasarkan ID
export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await prisma.class.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "Class deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting class:", error);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}

// PUT: Update nama kelas
export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Class ID is required" }, { status: 400 });

    const body = await req.json();
    const validation = UpdateClassSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }

    const { name, teacherId } = validation.data;

    const updatedClass = await prisma.class.update({
      where: { id: Number(id) },
      data: {
        name,
        teachers: {
          set: teacherId && teacherId.length > 0
            ? teacherId.map((id) => ({ id: Number(id) }))
            : [],
        },
      },
      include: {
        teachers: true
      }
    });


    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    console.error("Error updating class:", error);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}