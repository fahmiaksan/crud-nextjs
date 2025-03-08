export const fetchClasses = async () => {
  const res = await fetch("/api/classes", { method: "GET", cache: "no-store" });

  if (!res.ok) {
    return { success: false, message: "Failed to fetch classes", data: [] };
  };

  const data = await res.json();
  return { success: true, message: "Classes fetched successfully", data };
}


export const saveClass = async (isEditMode, data) => {
  const method = isEditMode ? "PUT" : "POST";
  const url = isEditMode ? `/api/classes/${data.id}` : "/api/classes";
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
    });

    if (!res.ok) {
      return { success: false, message: "Failed to fetch classes", data: [] };
    };

    const datas = await res.json();

    return { success: true, message: "Classes fetched successfully", data: datas };

  } catch (error) {
    return { success: false, message: "Something went wrong", data: [] };
  }
};


export const deleteClass = async (id) => {
  try {
    const res = await fetch(`/api/classes/${id}`, { method: "DELETE", cache: "no-store" },);
    if (!res.ok) return { success: false, message: "Failed to delete class", data: [] };
    const data = await res.json();
    return { success: true, message: "Class deleted successfully", data };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to delete class", data: [] };
  }
}