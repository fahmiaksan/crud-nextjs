import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";


export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const query = searchParams.get("query");
    if (!category || !query) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let results = [
    ];



    switch (category) {
      case "student":
        results = await prisma.student.findMany({
          where: {
            fullname: {
              contains: query
            }
          },
        });
        break;
      case "teacher":
        results = await prisma.teacher.findMany({
          where: { fullname: { contains: query, } },
        });
        break;
      case "subject":
        results = await prisma.subject.findMany({
          where: { name: { contains: query, } },
        });
        break;
      case "class":
        results = await prisma.class.findMany({
          where: { name: { contains: query, } },
        });
        break;
      default:
        return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    return NextResponse.json(results ?? []);
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
