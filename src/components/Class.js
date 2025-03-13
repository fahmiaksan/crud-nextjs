"use client";
import { useEffect, useState } from "react";
import { Card, Table, Button, Input, Modal, Spinner, TableColumn, TableRow, TableBody, TableHeader, TableCell, ModalContent, ModalBody, form, Select, SelectItem } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useClassStore from "@/store/useClassStore";
import { saveClass, deleteClassData, fetchClasses } from "@/lib/fetch.class";
import useTeacherStore from "@/store/useTeacherStore";
import { fetchTeachersData } from "@/lib/fetch.teacher";

export default function ClassComponent() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { classes, setClasses, addClass, updateClass, deleteClass } = useClassStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({ id: "", name: "", teacherId: "", teachers: [] });
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const { teachers, setTeachers } = useTeacherStore();

  useEffect(() => {
    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Jika tidak ada session atau role bukan teacher, redirect
    if (!session || session.user.role !== "teacher") {
      router.push("/dashboard");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);

        const dataClasses = await fetchClasses();
        const dataTeachers = await fetchTeachersData();
        if (!Array.isArray(dataClasses.data) && !Array.isArray(dataTeachers.data)) {
          console.error("Data is not an array:", dataClasses, dataTeachers);
          setClasses([]);
          setTeachers([]);
        } else {
          setClasses(dataClasses.data);
          setTeachers(dataTeachers.data);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setClasses([]);
        setTeachers([]);
      } finally {
        setLoading(false); // Hentikan loading setelah selesai fetch
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      teacherId: selectedValues.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let teacherId;
    if (formData.teacherId.includes(",")) {
      teacherId = formData.teacherId.split(",").map(id => Number(id.trim()));
    } else {
      teacherId = [Number(formData.teacherId)];
    }
    try {
      const res = await saveClass(isEditMode, {
        id: formData.id ? formData.id : null,
        name: formData.name,
        teacherId: teacherId ? teacherId : [],
      });

      if (isEditMode) {
        updateClass(res.data);
      } else {
        addClass(res.data);
      }
    } catch (error) {
      alert("Failed to save class, rolling back!");
      const refreshedClasses = await fetchClasses();
      setClasses(refreshedClasses.data);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    deleteClass(id);
    try {
      await deleteClassData(id);

    } catch (error) {
      console.error(error);
      alert("Failed to save class, rolling back!");
      fetchClasses();
    }
  };

  const handleEdit = (cls) => {
    setIsEditMode(true);
    setFormData({
      ...cls,
      teacherId: cls?.teachers?.map((teacher) => teacher.id).join(",")
    });
    setIsModalOpen(true);
  };

  const handleSort = (column) => {
    let order = "asc";
    if (sortColumn === column && sortOrder === "asc") {
      order = "desc";
    }
    setSortColumn(column);
    setSortOrder(order);

    const sortedData = [...classes].sort((a, b) => {
      let valueA = a[column];
      let valueB = b[column];

      if (column === "_count") {
        valueA = a._count?.students || 0;
        valueB = b._count?.students || 0;
      } else if (column === "teachers") {
        valueA = a.teachers?.[0]?.fullname || "";
        valueB = b.teachers?.[0]?.fullname || "";
      }

      if (order === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setClasses(sortedData);
  };

  const getSortIndicator = (column) => {
    return sortColumn === column ? (sortOrder === "asc" ? "⬆️" : "⬇️") : "";
  };


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Class Management</h1>
      <Button onPress={() => { setIsEditMode(false); setIsModalOpen(true); setFormData({ name: "", teacherId: "" }) }} color="primary" className="mb-4">+ Add Class</Button>
      <Card className="p-4">
        {
          loading ? (
            <Spinner />
          ) : (
            <Table aria-labelledby="table classes">
              <TableHeader>
                <TableColumn onClick={() => handleSort("id")} className="cursor-pointer">
                  ID {getSortIndicator("id")}
                </TableColumn>
                <TableColumn onClick={() => handleSort("name")} className="cursor-pointer">
                  Name {getSortIndicator("name")}
                </TableColumn>
                <TableColumn onClick={() => handleSort("_count")} className="cursor-pointer">
                  Total Student {getSortIndicator("_count")}
                </TableColumn>
                <TableColumn onClick={() => handleSort("teachers")} className="cursor-pointer">
                  Teacher {getSortIndicator("teachers")}
                </TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No classes found">
                {classes.length > 0 && classes.map((cls, i) => (
                  <TableRow key={cls.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{cls._count ? cls._count.students : 0} {cls.count > 1 ? "students" : "student"}</TableCell>

                    <TableCell>
                      {cls.teachers?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {cls.teachers.map((teacher) => (
                            <div
                              key={teacher.id}
                              className="relative group bg-blue-500 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                            >
                              {teacher.fullname}
                              {/* Tooltip untuk Email */}
                              <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {teacher.email}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No teachers assigned</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <Button disabled={isSubmitting} onPress={() => handleEdit(cls)} color="primary" className="mr-2">
                        Edit
                      </Button>
                      <Button disabled={isSubmitting} onPress={() => handleDelete(cls.id)} color="danger">
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>


            </Table>
          )
        }
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEditMode ? "Edit Class" : "Add Class"}>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input isRequired label="Class Name" type="text" name="name" value={formData.name} onChange={handleChange} required />
              <Select
                isRequired
                selectionMode="multiple"
                label="Teacher"
                value={isEditMode && [formData.teachers.map((teacher) => String(teacher.id))]}
                defaultSelectedKeys={isEditMode && formData.teachers.map((teacher) => String(teacher.id))}
                onChange={handleSelectChange}
                name="teacherId"
              >
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.fullname}
                  </SelectItem>
                ))}
              </Select>
              <Button type="submit" color="success" className="w-full">
                {isSubmitting ? <Spinner /> : isEditMode ? "Update Class" : "Add Class"}
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
