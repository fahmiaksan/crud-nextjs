export const fetchTeachersData = async () => {
  try {
    const res = await fetch("/api/teachers", { method: "GET", cache: "no-store" });
    if (!res.ok) return { success: false, message: "Failed to fetch teachers", data: [] };
    const data = await res.json();
    return { success: true, message: "Teachers fetched successfully", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to fetch teachers", data: [] };
  }
}

export const saveTeacherData = async (isEditMode, formData) => {
  const url = isEditMode ? `/api/teachers/${formData.id}` : "/api/teachers";
  const method = isEditMode ? "PUT" : "POST";
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      cache: "no-cache",
    });

    if (!res.ok) {
      return { success: false, message: `Failed to ${isEditMode ? "update" : "add"} teacher`, data: [] };
    }

    const data = await res.json();
    if (!data) {
      return { success: false, message: `Failed to ${isEditMode ? "update" : "add"} teacher`, data: [] };
    }

    return { success: true, message: `Teacher ${isEditMode ? "updated" : "added"} successfully`, data };
  } catch (error) {
    console.error(error);
    return { success: false, message: `Failed to ${isEditMode ? "update" : "add"} teacher`, data: [] };
  }
};


export const deleteTeacherData = async (id) => {
  const Id = Number(id);
  if (!id) return { success: false, message: "Teacher ID is required", data: [] };
  try {
    const res = await fetch(`/api/teachers/${Id}`, { method: "DELETE", cache: "no-store" });
    if (!res.ok) return { success: false, message: "Failed to delete teacher", data: [] };
    const data = await res.json();
    if (!data) return { success: false, message: "Failed to delete teacher", data: [] };
    return { success: true, message: "Teacher deleted successfully", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete teacher", data: [] };
  }
}