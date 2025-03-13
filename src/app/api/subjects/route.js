import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { AddSubjectSchema } from "@/lib/zod";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: { teachers: true }
    });
    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}
export async function POST(req) {
  try {
    const body = await req.json();

    const validation = AddSubjectSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors.map(err => err.message) },
        { status: 400 }
      );
    }

    const newSubject = await prisma.subject.create({
      data: {
        name: validation.data.name,
        teachers: {
          connect: validation.data.teacherId.map((teacherId) => ({ id: Number(teacherId) }))
        }
      },
      include: { teachers: true }
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}