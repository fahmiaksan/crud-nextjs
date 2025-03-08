export const dashboardData = async () => {
  try {
    // Jalankan semua fetch secara paralel dengan Promise.all
    const [classesRes, subjectsRes, studentsRes, teachersRes] = await Promise.all([
      fetch("/api/classes", { method: "GET", cache: "no-store" }),
      fetch("/api/subjects", { method: "GET", cache: "no-store" }),
      fetch("/api/students", { method: "GET", cache: "no-store" }),
      fetch("/api/teachers", { method: "GET", cache: "no-store" }),
    ]);

    // Periksa apakah ada yang gagal
    if (!classesRes.ok || !subjectsRes.ok || !studentsRes.ok || !teachersRes.ok) {
      return { success: false, message: "Failed to fetch dashboard", data: [] };
    }

    // Parsing JSON secara paralel
    const [classes, subjects, students, teachers] = await Promise.all([
      classesRes.json(),
      subjectsRes.json(),
      studentsRes.json(),
      teachersRes.json(),
    ]);

    return {
      success: true,
      message: "Dashboard fetched successfully",
      data: { classes, subjects, students, teachers },
    };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to fetch dashboard", data: [] };
  }
};
