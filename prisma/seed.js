import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 🔹 1. Tambah Data Kelas
  const classA = await prisma.class.create({ data: { name: "Class A" } });
  const classB = await prisma.class.create({ data: { name: "Class B" } });
  const classC = await prisma.class.create({ data: { name: "Class C" } });

  // 🔹 2. Tambah Data Guru (Teacher)
  const teacher1 = await prisma.teacher.create({
    data: {
      fullname: "John Doe",
      email: "john@example.com",
      password: await bcrypt.hash("password123", 10),
    },
  });

  const teacher2 = await prisma.teacher.create({
    data: {
      fullname: "Jane Smith",
      email: "jane@example.com",
      password: await bcrypt.hash("password123", 10),
    },
  });

  const teacher3 = await prisma.teacher.create({
    data: {
      fullname: "Michael Johnson",
      email: "michael@example.com",
      password: await bcrypt.hash("password123", 10),
    },
  });

  // 🔹 3. Hubungkan Guru dengan Kelas (Many-to-Many)
  await prisma.class.update({
    where: { id: classA.id },
    data: {
      teachers: { connect: [{ id: teacher1.id }, { id: teacher2.id }] },
    },
  });

  await prisma.class.update({
    where: { id: classB.id },
    data: {
      teachers: { connect: [{ id: teacher2.id }, { id: teacher3.id }] },
    },
  });

  await prisma.class.update({
    where: { id: classC.id },
    data: {
      teachers: { connect: [{ id: teacher1.id }, { id: teacher3.id }] },
    },
  });

  // 🔹 4. Tambah Data Mata Pelajaran (Subjects)
  const math = await prisma.subject.create({ data: { name: "Mathematics" } });
  const science = await prisma.subject.create({ data: { name: "Science" } });
  const english = await prisma.subject.create({ data: { name: "English" } });
  const history = await prisma.subject.create({ data: { name: "History" } });
  const cs = await prisma.subject.create({ data: { name: "Computer Science" } });

  // 🔹 5. Hubungkan Guru dengan Mata Pelajaran (Many-to-Many)
  await prisma.teacher.update({
    where: { id: teacher1.id },
    data: {
      subjects: { connect: [{ id: math.id }, { id: english.id }] },
    },
  });

  await prisma.teacher.update({
    where: { id: teacher2.id },
    data: {
      subjects: { connect: [{ id: science.id }, { id: history.id }] },
    },
  });

  await prisma.teacher.update({
    where: { id: teacher3.id },
    data: {
      subjects: { connect: [{ id: cs.id }] },
    },
  });

  // 🔹 6. Tambah Data Siswa (Student)
  await prisma.student.createMany({
    data: [
      { fullname: "Alice Johnson", email: "alice@example.com", student_id_number: "S001", classId: classA.id },
      { fullname: "Bob Williams", email: "bob@example.com", student_id_number: "S002", classId: classB.id },
      { fullname: "Charlie Brown", email: "charlie@example.com", student_id_number: "S003", classId: classA.id },
      { fullname: "David Lee", email: "david@example.com", student_id_number: "S004", classId: classC.id },
      { fullname: "Emma Watson", email: "emma@example.com", student_id_number: "S005", classId: classC.id },
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
