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
  const [formData, setFormData] = useState({ id: "", name: "", teacherId: "", teachers: [] });
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });

  useEffect(() => {

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
  }, [status]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      teacherId: selectedValues.target.value
    }));
  };

  const handleEdit = (subject) => {
    setIsEditMode(true);
    setFormData({
      ...subject,
      teacherId: subject?.teachers?.map((teacher) => teacher.id).join(",")
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    let teacherId;
    if (formData.teacherId.includes(",")) {
      teacherId = formData.teacherId.split(",").map(id => Number(id.trim()));
    } else {
      teacherId = [Number(formData.teacherId)];
    }
    try {
      const res = await saveSubject(isEditMode, {
        id: formData.id ? formData.id : null,
        name: formData.name,
        teacherId: teacherId ? teacherId : [],
      });
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

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

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
      <Card className="p-4">
        {loading ? <Spinner /> : (
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
                    {s.teachers?.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {s.teachers.map((teacher) => (
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
        )}
      </Card>

      <Modal backdrop="blur" isOpen={isModalOpen} onClose={() => { setFormData({ id: "", name: "", teacherId: "" }), setIsModalOpen(false) }} title={isEditMode ? "Edit Subject" : "Add Subject"}>
        <ModalContent>
          <ModalBody>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input label="Subject Name" type="text" name="name" isRequired value={formData.name} onChange={handleChange} required />
              <Select
                selectionMode="multiple"
                label="Teacher"
                isRequired={isEditMode}
                name="teacherId"
                value={isEditMode && [formData?.teachers?.map((teacher) => String(teacher.id))]}
                defaultSelectedKeys={isEditMode && formData?.teachers?.map((teacher) => String(teacher.id))}
                onChange={handleSelectChange}
              >
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>{t.fullname}</SelectItem>
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
