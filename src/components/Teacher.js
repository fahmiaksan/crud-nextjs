"use client";
import { useEffect, useState } from "react";
import { Card, Table, Button, Input, Modal, Spinner, Select, TableHeader, TableRow, TableColumn, TableBody, TableCell, ModalBody, ModalContent, SelectItem } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useStudentStore from "@/store/useStudentStore";
import { fetchStudents } from "@/lib/fetch.student";
import useClassStore from "@/store/useClassStore";
import { fetchClasses } from "@/lib/fetch.class";
import useTeacherStore from "@/store/useTeacherStore";
import { deleteTeacherData, fetchTeachersData, saveTeacherData } from "@/lib/fetch.teacher";

export default function StudentComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teachers, setTeachers, addTeacher, updatedTeacher, deleteTeacher } = useTeacherStore();
  const [loading, setLoading] = useState(true);
  const { classes, setClasses } = useClassStore();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const { students, setStudents } = useStudentStore();

  useEffect(() => {
    // Jika data sudah ada, hentikan loading dan return
    if (teachers.length > 0 && classes.length > 0 && students.length > 0) {
      setLoading(false);
      return;
    }

    // Jika masih loading session, biarkan tetap loading
    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Jika user tidak ada atau role bukan "teacher", redirect
    if (!session || session.user.role !== "teacher") {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true); // Set loading sebelum fetch data

        // Fetch data secara paralel
        const [resTeachers, resClasses, resStudents] = await Promise.all([
          fetchTeachersData(),
          fetchClasses(),
          fetchStudents()
        ]);

        // Validasi apakah hasilnya adalah array
        if (!Array.isArray(resTeachers.data) || !Array.isArray(resClasses.data) || !Array.isArray(resStudents.data)) {
          console.error("Data is not an array:", resTeachers, resClasses, resStudents);
          setTeachers([]);
          setClasses([]);
          setStudents([]);
          return;
        }

        // Set state setelah data berhasil di-fetch
        setTeachers(resTeachers.data);
        setClasses(resClasses.data);
        setStudents(resStudents.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setTeachers([]);
        setClasses([]);
        setStudents([]);

      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);


  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage("");
        setError("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, error]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setError("");
    setMessage("");

    try {
      const res = await saveTeacherData(isEditMode, formData);
      const data = await res.data;

      if (res.error) {
        setError(res.message);
        console.error("Failed to save teachers:", res.error);
        return;
      }

      if (!res.data) {
        setError("Failed to save teacher");
        return;
      }
      if (isEditMode) {
        updatedTeacher(data.data);
      } else {
        addTeacher(data);
      }

      setMessage(res.message);
    } catch (error) {
      console.error("Failed to save teacher:", error);
      setError("Failed to save teacher, rolling back!");
    } finally {
      setLoadingSubmit(false);
      setIsModalOpen(false);
      setFormData({ id: "", fullname: "", email: "", classId: "", password: '' });
    }
  };


  const handleEdit = (stdn) => {

    setFormData({
      id: stdn.id || "",
      fullname: stdn.fullname || "",
      email: stdn.email || "",
      classId: String(stdn.classId) || "",
      password: stdn.password || ''
    });

    setIsEditMode(true);
    setIsModalOpen(true);
  };



  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    setMessage('');
    setError('');
    deleteTeacher(id);
    setMessage('Deleted successfully');

    try {
      const deleteData = await deleteTeacherData(id);
      if (!deleteData.success) {
        alert("Failed to delete teacher");
        setError(deleteData.message);
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete student, rolling back!");
      const res = await fetchTeachersData();
      setTeachers(res.data);
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalViewOpen(true);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teachers Management</h1>
      {
        message && (
          <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800"
            role="alert">
            <span className="font-medium">{message}</span>
          </div>
        )
      }

      {
        error && (
          <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800"
            role="alert">
            <span className="font-medium">Error!</span> {error}
          </div>
        )
      }
      <Button onPress={() => { setIsEditMode(false), setIsModalOpen(true) }} color="primary" className="mb-4">+ Add Teachers</Button>
      <Card className="p-4">
        {
          loading ? (
            <div className="flex justify-center"><Spinner /></div>
          ) : (
            <Table aria-labelledby="table-data">
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>Nama</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Mengajar di Kelas</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No data found">
                {teachers.length > 0 &&
                  teachers.map((t, i) => (
                    <TableRow key={t.id || i}>
                      {/* No */}
                      <TableCell>{i + 1}</TableCell>

                      {/* Full Name dengan Avatar Inisial */}
                      <TableCell className="flex items-center space-x-3">
                        <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold uppercase">
                          {t.fullname?.slice(0, 1)}
                        </div>
                        <span className="text-white">{t.fullname}</span>
                      </TableCell>

                      {/* Email dengan Tooltip */}
                      <TableCell className="relative group cursor-pointer text-blue-300">
                        📧
                        <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {t.email}
                        </span>
                      </TableCell>

                      {/* Class Name dengan Badge */}
                      <TableCell>
                        {classes.find((c) => c.id === t.classId)?.name ? (
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                            {classes.find((c) => c.id === t.classId)?.name}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No class assigned</span>
                        )}
                      </TableCell>

                      {/* Action Buttons */}
                      <TableCell className="flex space-x-2">
                        <Button
                          disabled={loadingSubmit}
                          onPress={() => handleView(t)}
                          color="success"
                        >
                          View Detail
                        </Button>
                        <Button
                          disabled={loadingSubmit}
                          onPress={() => handleEdit(t)}
                          color="warning"
                        >
                          Edit
                        </Button>
                        <Button
                          disabled={loadingSubmit}
                          onPress={() => handleDelete(t.id, t.classId)}
                          color="danger"
                        >
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

      <Modal backdrop="blur" size="5xl" isOpen={isModalViewOpen} onClose={() => setIsModalViewOpen(false)} title="Teacher Detail">
        <ModalContent>
          <ModalBody>
            <Table className="px-4 py-6" aria-labelledby="table-data">
              <TableHeader>
                <TableColumn>Nama</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Mengajar di Kelas</TableColumn>
                <TableColumn>Total Siswa di Kelas</TableColumn>
                <TableColumn>Nama Siswa</TableColumn>
                <TableColumn>Daftar Mata Pelajaran</TableColumn>
              </TableHeader>

              <TableBody emptyContent="No data found">
                {selectedTeacher && (
                  <TableRow>
                    {/* Nama Guru dengan Avatar */}
                    <TableCell className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold uppercase">
                        {selectedTeacher.fullname?.slice(0, 1)}
                      </div>
                      <span className="text-white">{selectedTeacher.fullname}</span>
                    </TableCell>

                    {/* Email dengan Tooltip */}
                    <TableCell className="relative group cursor-pointer text-blue-300">
                      📧
                      <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedTeacher.email}
                      </span>
                    </TableCell>

                    {/* Nama Kelas dengan Badge */}
                    <TableCell>
                      {classes.find((c) => c.id === selectedTeacher.classId)?.name ? (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                          {classes.find((c) => c.id === selectedTeacher.classId)?.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No class assigned</span>
                      )}
                    </TableCell>

                    {/* Total Siswa di Kelas */}
                    <TableCell className="text-center">
                      {classes.find((c) => c.id === selectedTeacher.classId)?._count?.students ?? 0}
                    </TableCell>

                    {/* Daftar Nama Siswa */}
                    <TableCell>
                      {students.filter((s) => s.classId === selectedTeacher.classId).length > 0 ? (
                        <ul className="list-disc pl-4 text-sm text-gray-300">
                          {students
                            .filter((s) => s.classId === selectedTeacher.classId)
                            .map((s) => (
                              <li key={s.id}>{s.fullname}</li>
                            ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No students</span>
                      )}
                    </TableCell>

                    {/* Daftar Mata Pelajaran dengan Badge */}
                    <TableCell>
                      {selectedTeacher.subjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedTeacher.subjects.map((s) => (
                            <span key={s.id} className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
                              {s.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No subjects assigned</span>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </ModalBody>
        </ModalContent>
      </Modal>


      <Modal backdrop="blur" isOpen={isModalOpen} onClose={() => { setFormData({ id: "", fullname: "", email: "", classId: "" }), setIsEditMode(false), setIsModalOpen(false) }} title={isEditMode ? "Edit Student" : "Add Student"}>
        <ModalContent>
          <ModalBody>
            <h1 className="text-2xl font-bold mb-4">
              {isEditMode ? "Edit Teacher" : "Add Teacher"}
            </h1>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
                isRequired
              />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isRequired
              />
              {
                !isEditMode && (
                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    isRequired
                  />
                )
              }
              <Select
                label="Class"
                value={[formData.classId]}
                onChange={handleChange}
                name="classId"
                defaultSelectedKeys={[formData.classId]}
                isRequired
              >
                {classes.length > 0 &&
                  classes.map((c, i) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))
                }
              </Select>


              <Button disabled={loadingSubmit} type="submit" color="success" className="w-full">
                {
                  loadingSubmit ? (
                    <Spinner />
                  ) : (
                    isEditMode ? "Update Student" : "Add Student"
                  )
                }
              </Button>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
