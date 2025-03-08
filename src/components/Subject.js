"use client";
import { useEffect, useState } from "react";
import { Card, Table, Button, Input, Modal, Spinner, TableColumn, TableRow, TableBody, TableHeader, TableCell, ModalContent, ModalBody, Select, SelectItem } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useSubjectStore from "@/store/useSubjectStore";
import useTeacherStore from "@/store/useTeacherStore";
import { deleteSubjectData, fetchSubjects, saveSubject } from "@/lib/fetch.subject";
import { fetchTeachersData } from "@/lib/fetch.teacher";

export default function SubjectComponents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subjects, setSubjects, addSubject, updateSubject, deleteSubject } = useSubjectStore();
  const { teachers, setTeachers } = useTeacherStore();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [formData, setFormData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" }); // ✅ Sorting State

  useEffect(() => {
    if (subjects.length > 0 && teachers.length > 0) {
      setLoading(false);
      return;
    }

    if (status === "loading") {
      setLoading(true);
      return;
    }

    if (!session || session.user.role !== "teacher") {
      router.push("/dashboard");
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const dataSubject = await fetchSubjects();
        const dataTeachers = await fetchTeachersData();
        setSubjects(dataSubject.data);
        setTeachers(dataTeachers.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEdit = (subject) => {
    setIsEditMode(true);
    setFormData({
      id: subject.id,
      name: subject.name,
      teacherId: subject.teacherId,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const res = await saveSubject(isEditMode, formData);
      if (res.error) {
        console.error("Failed to save subject:", res.error);
        return;
      }
      if (isEditMode) {
        updateSubject(res.data);
      } else {
        addSubject(res.data);
      }
    } catch (error) {
      console.error(error);
      const res = await fetchSubjects();
      setSubjects(res.data);
    } finally {
      setIsModalOpen(false);
      setFormData({ id: "", name: "", teacherId: "" });
      setLoadingSubmit(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;
    deleteSubject(id);
    try {
      await deleteSubjectData(id);
    } catch (error) {
      console.error(error);
    }
  };

  // ✅ Fungsi untuk Sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Mengurutkan data berdasarkan sortConfig
  const sortedSubjects = [...subjects].sort((a, b) => {
    const valueA = a[sortConfig.key]?.toString().toLowerCase() || "";
    const valueB = b[sortConfig.key]?.toString().toLowerCase() || "";

    if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Subject Management</h1>
      <Button onPress={() => { setIsEditMode(false); setIsModalOpen(true); }} className="mb-4" color="primary">+ Add Subject</Button>
      <Card>{loading ? <Spinner /> : (
        <Table aria-labelledby="table subjects">
          <TableHeader>
            <TableColumn onClick={() => handleSort("id")} className="cursor-pointer">
              ID {sortConfig.key === "id" ? (sortConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}
            </TableColumn>
            <TableColumn onClick={() => handleSort("name")} className="cursor-pointer">
              Subject {sortConfig.key === "name" ? (sortConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}
            </TableColumn>
            <TableColumn onClick={() => handleSort("teacherId")} className="cursor-pointer">
              Teacher {sortConfig.key === "teacherId" ? (sortConfig.direction === "asc" ? "⬆️" : "⬇️") : ""}
            </TableColumn>
            <TableColumn>Actions</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No subject found">
            {sortedSubjects.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>
                  {s.teacher ? (
                    <div className="relative group bg-blue-500 text-white text-xs px-2 py-1 rounded-md cursor-pointer w-max">
                      {s.teacher.fullname}
                      {s.teacher.email && (
                        <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {s.teacher.email}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">No teacher assigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button disabled={loadingSubmit} onPress={() => handleEdit(s)} color="warning" className="mr-2">
                    Edit
                  </Button>
                  <Button disabled={loadingSubmit} onPress={() => handleDelete(s.id)} color="danger">
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}</Card>

      <Modal backdrop="blur" isOpen={isModalOpen} onClose={() => { setFormData({ id: "", name: "", teacherId: "" }), setIsModalOpen(false) }} title={isEditMode ? "Edit Subject" : "Add Subject"}>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input label="Subject Name" type="text" name="name" isRequired value={formData.name} onChange={handleChange} required />
              <Select label="Teacher" defaultSelectedKeys={[String(formData.teacherId)]} isRequired name="teacherId" onChange={handleChange}>
                {teachers.map((t) => (
                  <SelectItem key={String(t.id)} value={String(t.id)}>{t.fullname}</SelectItem>
                ))}
              </Select>
              <Button type="submit" disabled={loadingSubmit} color="success" className="w-full">
                {loadingSubmit ? <Spinner /> : (isEditMode ? "Update Subject" : "Add Subject")}
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
