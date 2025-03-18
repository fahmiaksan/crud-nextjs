import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req, { params }) {
  const { id } = await params;
  try {
    const body = await req.json();
    const { name, value } = body;
    if (!name || !value) return NextResponse.json({ error: "Name and value are required" }, { status: 400 });
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        name,
        value: Number(value)
      }
    });
    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { id } = await params;
  try {
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: "User deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}