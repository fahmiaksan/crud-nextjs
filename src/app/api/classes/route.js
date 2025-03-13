import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { AddClassSchema } from "@/lib/zod";


export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      include: {
        _count: { select: { students: true } },
        teachers: true,
      },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error("Error fetching classes:", error);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
  }
}


// POST: Tambah kelas baru
export async function POST(req) {
  try {
    const body = await req.json();


    const validation = AddClassSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }
    const { name, teacherId } = validation.data
    const newClass = await prisma.class.create({
      data: {
        name,
        teachers: { connect: teacherId.map((teacherId) => ({ id: Number(teacherId) })) },
      },
      include: { teachers: true },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Error creating class:", error);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
