export const fetchSubjects = async () => {
  try {
    const res = await fetch("/api/subjects", { method: "GET", cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch subjects");
    const subjects = await res.json();
    return { data: subjects, status: true };
  } catch (error) {
    console.error(error);
  }
};

export const saveSubject = async (isEditMode, formData) => {
  try {
    const method = isEditMode ? "PUT" : "POST";
    const url = isEditMode ? `/api/subjects/${formData.id}` : "/api/subjects";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      cache: "no-store"
    });
    if (!res.ok) throw new Error("Failed to save subject");
    const data = await res.json();
    return { success: true, message: "Subject saved successfully", data };
  } catch (error) {
    console.error(error);
    return { error, data: [] }
  }
}

export const deleteSubjectData = async (id) => {
  try {
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) throw new Error("Failed to delete subject");
    return { success: true, message: "Student deleted successfully" };

  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete subject" };

  }
}