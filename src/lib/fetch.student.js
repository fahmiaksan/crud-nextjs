
export const fetchStudents = async () => {
  try {
    const resStudent = await fetch("/api/students", { method: "GET", cache: "no-store" });
    if (!resStudent.ok) return { success: false, message: "Failed to fetch students", data: [] };
    const data = await resStudent.json();
    return { success: true, message: "Students fetched successfully", data };
  } catch (error) {
    console.error("Failed to fetch students:", error);
  }
};


export const saveStudent = async (isEditMode, formData) => {
  const method = isEditMode ? "PUT" : "POST";
  const url = isEditMode ? `/api/students/${formData.id}` : "/api/students";


  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    return { success: true, message: "Student saved successfully", data: data };
  } catch (error) {
    console.error("Failed to save student:", error);
    return { success: false, message: "Failed to save student", data: [] };
  }
};



export const deleteStudentById = async (id) => {
  try {
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" });
    if (!res.ok) return { success: false, message: "Failed to delete student", data: [] };
    return { success: true, message: "Student deleted successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete student" };
  }
}