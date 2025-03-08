"use client";
import { useEffect, useState } from "react";
import { Card, Table, Button, Input, Modal, Spinner, TableColumn, TableRow, TableBody, TableHeader, TableCell, ModalContent, ModalBody, form } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useClassStore from "@/store/useClassStore";
import { saveClass, fetchClasses } from "@/lib/fetch.class";

export default function ClassComponent() {
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { classes, setClasses, addClass, updateClass, deleteClass } = useClassStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    // Jika data sudah ada, hentikan loading
    if (classes.length > 0) {
      setLoading(false);
      return;
    }

    // Jika masih loading session, biarkan tetap loading
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
        setLoading(true); // Set loading sebelum fetch data

        const dataClass = await fetchClasses();

        // Pastikan data yang diterima adalah array
        if (!Array.isArray(dataClass.data)) {
          console.error("Data is not an array:", dataClass);
          setClasses([]);
        } else {
          setClasses(dataClass.data);
        }

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setClasses([]);
      } finally {
        setLoading(false); // Hentikan loading setelah selesai fetch
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setIsSubmitting(true);
    e.preventDefault();
    try {
      const res = await saveClass(isEditMode, formData);
      if (isEditMode) {
        updateClass(res.data);
      } else {
        addClass(res.data);
      }
    } catch (error) {
      alert("Failed to save class, rolling back!");
      const res = await fetchClasses();
      setClasses(res.data);
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    deleteClass(id);
    try {
      await deleteClass(id);

    } catch (error) {
      console.error(error);
      alert("Failed to save class, rolling back!");
      fetchClasses();
    }
  };

  const handleEdit = (cls) => {
    setIsEditMode(true);
    setFormData(cls);
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
      <Button onPress={() => { setIsEditMode(false); setIsModalOpen(true); }} color="primary" className="mb-4">+ Add Class</Button>
      <Card>
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

                    {/* Teacher Column with Improved UI */}
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


      {/* Modal untuk Tambah/Edit Class */}
      <Modal backdrop="blur" isOpen={isModalOpen} onClose={() => { setIsModalOpen(false), setFormData({ id: null, name: "" }) }} title={isEditMode ? "Edit Class" : "Add Class"}>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input label="Class Name" type="text" name="name" value={formData.name} onChange={handleChange} required />
              <Button type="submit" color="success" className="w-full">
                {isSubmitting ? <Spinner /> : isEditMode ? "Update class" : "Add class"}</Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
