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
import useSubjectStore from "@/store/useSubjectStore";
import { fetchSubjects } from "@/lib/fetch.subject";

export default function StudentComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { teachers, setTeachers, addTeacher, updatedTeacher, deleteTeacher } = useTeacherStore();
  const [loading, setLoading] = useState(true);
  const { classes, setClasses } = useClassStore();
  const { subjects, setSubjects } = useSubjectStore();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: "", fullname: "", email: "", classId: "", password: "", classes: [], subjectId: "", subjects: [] });
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const { students, setStudents } = useStudentStore();

  useEffect(() => {
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
        const [resTeachers, resClasses, resStudents, resSubjects] = await Promise.all([
          fetchTeachersData(),
          fetchClasses(),
          fetchStudents(),
          fetchSubjects()
        ]);

        // Validasi apakah hasilnya adalah array
        if (!Array.isArray(resTeachers.data) || !Array.isArray(resClasses.data) || !Array.isArray(resSubjects.data) || !Array.isArray(resStudents.data)) {
          console.error("Data is not an array:", resTeachers, resClasses, resStudents, resSubjects);
          setTeachers([]);
          setClasses([]);
          setStudents([]);
          setSubjects([])
          return;
        }

        // Set state setelah data berhasil di-fetch
        setTeachers(resTeachers.data);
        setClasses(resClasses.data);
        setStudents(resStudents.data);
        setSubjects(resSubjects.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setTeachers([]);
        setClasses([]);
        setStudents([]);
        setSubjects([])

      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    let classId;
    let subjectId;
    if (formData.classId.includes(",")) {
      classId = formData.classId.split(",").map(id => Number(id.trim()));
    } else {
      classId = [Number(formData.classId)];
    }
    if (formData.subjectId.includes(",")) {
      subjectId = formData.subjectId.split(",").map(id => Number(id.trim()));
    } else {
      subjectId = [Number(formData.subjectId)];
    }
    try {
      const res = await saveTeacherData(isEditMode, {
        id: formData.id || null,
        fullname: formData.fullname,
        email: formData.email,
        classId,
        subjectId,
        password: formData.password
      });
      const data = await res.data;

      if (res.error) {
        console.error("Failed to save teachers:", res.error);
        return;
      }

      if (!res.data) {
        return;
      }
      if (isEditMode) {
        updatedTeacher(data.data);
      } else {
        addTeacher(data);
      }
    } catch (error) {
      console.error("Failed to save teacher:", error);
    } finally {
      setLoadingSubmit(false);
      setIsModalOpen(false);
      setFormData({ id: "", fullname: "", email: "", classId: "", password: '' });
    }
  };

  const handleEdit = (tch) => {
    setIsEditMode(true);
    setFormData({
      ...tch,
      classId: tch?.classes?.map((cls) => cls.id).join(","),
      subjectId: tch?.subjects?.map((sub) => sub.id).join(",")
    });
    setIsModalOpen(true);
  };

  const handleSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      classId: selectedValues.target.value
    }));
  };
  const handleSubjectSelectChange = (selectedValues) => {
    setFormData((prev) => ({
      ...prev,
      subjectId: selectedValues.target.value
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this teacher?")) return;
    deleteTeacher(id);

    try {
      const deleteData = await deleteTeacherData(id);
      if (!deleteData.success) {
        alert("Failed to delete teacher");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Failed to delete student");
    }
  };

  const handleView = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalViewOpen(true);
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Teachers Management</h1>
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
                        {t.classes?.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {t.classes.map((cls, i) => (
                              <div
                                key={i}
                                className="relative group bg-blue-500 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                              >
                                {cls.name}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No teachers assigned</span>
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

      <Modal backdrop="blur" size="full" isOpen={isModalViewOpen} onClose={() => setIsModalViewOpen(false)} title="Teacher Detail">
        <ModalContent>
          <ModalBody>
            <Table className="px-4 py-6" aria-labelledby="table-data">
              <TableHeader>
                <TableColumn>Nama</TableColumn>
                <TableColumn>Email</TableColumn>
                <TableColumn>Mengajar di Kelas & Total siswa di kelas</TableColumn>
                <TableColumn>Nama Seluruh Siswa Yang Ada Di Kelas</TableColumn>
                <TableColumn>Daftar Mata Pelajaran</TableColumn>
              </TableHeader>

              <TableBody emptyContent="No data found">
                {selectedTeacher && (
                  <TableRow>
                    {/* Nama Guru dengan Avatar */}
                    <TableCell>
                      <div className="flex w-full items-center justify-center space-x-3 text-center">
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold uppercase">
                          {selectedTeacher.fullname?.slice(0, 1)}
                        </div>
                        <span className="text-white whitespace-nowrap">{selectedTeacher.fullname}</span>
                      </div>
                    </TableCell>


                    {/* Email dengan Tooltip */}
                    <TableCell className="relative group cursor-pointer text-blue-300">
                      📧
                      <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {selectedTeacher.email}
                      </span>
                    </TableCell>

                    <TableCell className="text-center">
                      {selectedTeacher.classes?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {selectedTeacher.classes.map((cls, i) => {
                            const totalStudents = students.filter((s) => s.classId === cls.id).length;
                            return (
                              <div
                                key={i}
                                className="relative group bg-blue-500 text-white text-xs px-2 py-1 rounded-md cursor-pointer"
                              >
                                {cls.name} ({totalStudents})
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No student assigned</span>
                      )}
                    </TableCell>

                    {/* Daftar Nama Siswa */}
                    <TableCell>
                      <div className="grid grid-cols-2 gap-2">
                        {students
                          ?.filter((s) => selectedTeacher.classes.some((c) => c.id === s.classId))
                          ?.map((s, i, arr) => {
                            const isLastOdd = arr.length % 2 !== 0 && i === arr.length - 1;
                            return (
                              <div
                                key={i}
                                className={`flex items-center space-x-3 bg-gray-800 p-2 rounded-lg ${isLastOdd ? "col-span-2 justify-center" : ""
                                  }`}
                              >
                                {/* Avatar */}
                                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold uppercase">
                                  {s.fullname?.slice(0, 1)}
                                </div>
                                {/* Nama Siswa */}
                                <span className="text-white">{s.fullname}</span>
                              </div>
                            );
                          })}
                      </div>
                    </TableCell>




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
                value={isEditMode && [formData?.classes?.map((className) => String(className.id))]}
                defaultSelectedKeys={isEditMode && formData?.classes?.map((cls) => String(cls.id))}
                onChange={handleSelectChange}
                name="classId"
                isRequired
                selectionMode="multiple"
              >
                {classes.length > 0 &&
                  classes.map((c, i) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))
                }
              </Select>

              <Select
                label="Subject"
                value={isEditMode && [formData?.subjects?.map((sub) => String(sub.id))]}
                defaultSelectedKeys={isEditMode && formData?.subjects?.map((sub) => String(sub.id))}
                onChange={handleSubjectSelectChange}
                name="subjectId"
                isRequired
                selectionMode="multiple"
              >
                {subjects.length > 0 &&
                  subjects.map((c, i) => (
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
