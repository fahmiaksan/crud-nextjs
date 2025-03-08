import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 🔹 1. Tambah Data Kelas
  const classA = await prisma.class.create({ data: { name: "Class A" } });
  const classB = await prisma.class.create({ data: { name: "Class B" } });

  // 🔹 2. Tambah Data Guru (Teacher)
  const teacher1 = await prisma.teacher.create({
    data: {
      fullname: "John Doe",
      email: "john@example.com",
      password: await bcrypt.hash("password123", 10),
      classId: classA.id,
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      fullname: "Jane Smith",
      email: "jane@example.com",
      password: await bcrypt.hash("password123", 10),
      classId: classB.id,
    },
  });

  // 🔹 3. Tambah Data Mata Pelajaran (Subject)
  await prisma.subject.createMany({
    data: [
      { name: "Mathematics", teacherId: teacher1.id },
      { name: "Science", teacherId: teacher2.id },
      { name: "English", teacherId: teacher1.id },
      { name: "History", teacherId: teacher2.id },
    ],
  });

  // 🔹 4. Tambah Data Siswa (Student)
  await prisma.student.createMany({
    data: [
      { fullname: "Alice Johnson", email: "alice@example.com", student_id_number: "S001", classId: classA.id },
      { fullname: "Bob Williams", email: "bob@example.com", student_id_number: "S002", classId: classB.id },
      { fullname: "Charlie Brown", email: "charlie@example.com", student_id_number: "S003", classId: classA.id },
    ],
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
