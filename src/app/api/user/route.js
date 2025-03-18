import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET() {
  const res = await prisma.user.findMany();
  return NextResponse.json(res, { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { name, value } = body;
  if (!name || !value) return NextResponse.json({ error: "Name and value are required" }, { status: 400 });
  try {
    const validate = await prisma.user.findUnique({
      where: {
        name
      }
    });

    if (validate) return NextResponse.json({ error: "User already exists" }, { status: 400 });

    const user = await prisma.user.create({
      data: {
        name,
        value: Number(value),
      },
    });
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}