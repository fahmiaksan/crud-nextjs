"use client";
import { useEffect, useState } from "react";
import { Card, Table, Button, Input, Modal, Spinner, Select, TableHeader, TableRow, TableColumn, TableBody, TableCell, ModalBody, ModalContent, SelectItem } from "@heroui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import useStudentStore from "@/store/useStudentStore";
import { deleteStudentById, fetchStudents, saveStudent } from "@/lib/fetch.student";
import useClassStore from "@/store/useClassStore";
import { fetchClasses } from "@/lib/fetch.class";

export default function StudentComponent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { students, addStudent, setStudents, updateStudent, deleteStudent } = useStudentStore();
  const [loading, setLoading] = useState(true);
  const { classes, updateClassWithStudent, setClasses } = useClassStore();
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalViewOpen, setIsModalViewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [formData, setFormData] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {

    if (status === "loading") {
      setLoading(true);
      return;
    }

    // Jika user tidak ada atau role bukan "teacher", redirect ke dashboard
    if (!session || session.user.role !== "teacher") {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true); // Set loading sebelum fetch data

        // Fetch data secara paralel
        const [resStudent, resClass] = await Promise.all([fetchStudents(), fetchClasses()]);

        // Validasi apakah hasilnya adalah array
        if (!Array.isArray(resStudent.data) || !Array.isArray(resClass.data)) {
          console.error("Data is not an array:", resStudent, resClass);
          setStudents([]);
          setClasses([]);
          return;
        }

        // Set state setelah data berhasil di-fetch
        setStudents(resStudent.data);
        setClasses(resClass.data);

      } catch (error) {
        console.error("Failed to fetch data:", error);
        setStudents([]);
        setClasses([]);

      } finally {
        setLoading(false); // Pastikan loading dihentikan setelah fetch selesai
      }
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Handle perubahan input form
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


  // Fungsi untuk submit form tambah student
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    try {
      const res = await saveStudent(isEditMode, formData); // Kirim ke server
      if (res.error) {
        console.error("Failed to save student:", res.error);
        return;
      }
      if (!isEditMode) {
        addStudent(res.data);
      } else {
        updateStudent(res.data);
      }
    } catch (error) {
      console.error("Failed to save student:", error);
      alert("Failed to save student, rolling back!");

      const updatedStudents = await fetchStudents();
      const updatedClasses = await fetchClasses();
      setStudents(updatedStudents.data);
      setClasses(updatedClasses.data);
    } finally {
      setLoadingSubmit(false);
      setIsModalOpen(false);
      setFormData({ fullname: "", email: "", student_id_number: "", classId: "" });
    }
  };


  const handleView = (student) => {
    setSelectedStudent(student);
    setIsModalViewOpen(true);
  }

  const handleEdit = (stdn) => {

    setFormData({
      id: stdn.id || "",
      fullname: stdn.fullname || "",
      email: stdn.email || "",
      student_id_number: stdn.student_id_number || "",
      classId: String(stdn.classId) || "",
    });

    setIsEditMode(true);
    setIsModalOpen(true);
  };



  const handleDelete = async (id, classId) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    deleteStudent(id, classId);

    try {
      await deleteStudentById(id);
    } catch (error) {
      console.error(error);
      alert("Failed to delete student, rolling back!");
      fetchStudents();
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let valueA = a[sortConfig.key]?.toString().toLowerCase() || "";
    let valueB = b[sortConfig.key]?.toString().toLowerCase() || "";
    return sortConfig.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
  });
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Student Management</h1>
      <Button onPress={() => { setIsEditMode(false), setIsModalOpen(true) }} color="primary" className="mb-4">+ Add Student</Button>
      <Card className="p-4">
        {
          loading ? (
            <div className="flex justify-center"><Spinner /></div>
          ) : (
            <Table aria-labelledby="table-data">
              <TableHeader>
                <TableColumn onClick={() => handleSort("id")} className="cursor-pointer">ID{sortConfig.key === "id" ? sortConfig.direction === "asc" ? "⬆️" : "⬇️" : ""}</TableColumn>
                <TableColumn onClick={() => handleSort("student_id_number")} className="cursor-pointer">Nomor Induk {sortConfig.key === "student_id_number" ? sortConfig.direction === "asc" ? "⬆️" : "⬇️" : ""}</TableColumn>
                <TableColumn onClick={() => handleSort("fullname")} className="cursor-pointer">Nama{sortConfig.key === "fullname" ? sortConfig.direction === "asc" ? "⬆️" : "⬇️" : ""}</TableColumn>
                <TableColumn onClick={() => handleSort("email")} className="cursor-pointer">Email{sortConfig.key === "email" ? sortConfig.direction === "asc" ? "⬆️" : "⬇️" : ""}</TableColumn>
                <TableColumn onClick={() => handleSort("classId")} className="cursor-pointer">Kelas{sortConfig.key === "classId" ? sortConfig.direction === "asc" ? "⬆️" : "⬇️" : ""}</TableColumn>
                <TableColumn>Actions</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No data found">
                {sortedStudents.map((student, i) => (
                  <TableRow key={student.id || i}>
                    {/* No */}
                    <TableCell>{i + 1}</TableCell>

                    {/* Student ID */}
                    <TableCell className="font-mono text-blue-400">{student.student_id_number}</TableCell>

                    {/* Full Name dengan Avatar Inisial */}
                    <TableCell className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full text-sm font-bold uppercase">
                        {student.fullname?.slice(0, 1)}
                      </div>
                      <span className="text-white">{student.fullname}</span>
                    </TableCell>

                    {/* Email dengan Tooltip */}
                    <TableCell className="relative group cursor-pointer text-blue-300">
                      📧
                      <span className="absolute left-0 bottom-full mb-1 w-max bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {student.email}
                      </span>
                    </TableCell>

                    {/* Class Name dengan Badge */}
                    <TableCell>
                      {student.class?.name ? (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-md">
                          {student.class.name}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">No class assigned</span>
                      )}
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="flex space-x-2">
                      <Button
                        disabled={loadingSubmit}
                        onPress={() => handleView(student)}
                        color="success"
                      >
                        View
                      </Button>
                      <Button
                        disabled={loadingSubmit}
                        onPress={() => handleEdit(student)}
                        color="warning"
                      >
                        Edit
                      </Button>
                      <Button
                        disabled={loadingSubmit}
                        onPress={() => handleDelete(student.id, student.classId)}
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

      {selectedStudent && (
        <Modal backdrop="blur" isOpen={isModalViewOpen} onClose={() => setIsModalViewOpen(false)} title="Student Details">
          <ModalContent>

            <ModalBody className="p-4">
              <p><strong>ID:</strong> {selectedStudent.id}</p>
              <p><strong>Nomor Induk:</strong> {selectedStudent.student_id_number}</p>
              <p><strong>Nama:</strong> {selectedStudent.fullname}</p>
              <p><strong>Email:</strong> {selectedStudent.email}</p>
              <p><strong>Kelas:</strong> {selectedStudent.class?.name || "N/A"}</p>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Modal untuk Tambah Student */}
      <Modal backdrop="blur" isOpen={isModalOpen} onClose={() => { setFormData({ id: "", fullname: "", email: "", student_id_number: "", classId: "" }), setIsEditMode(false), setIsModalOpen(false) }} title={isEditMode ? "Edit Student" : "Add Student"}>
        <ModalContent>
          <ModalBody>
            <h1 className="text-2xl font-bold mb-4">
              {isEditMode ? "Edit Student" : "Add Student"}
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
              <Input
                label="Student ID Number"
                type="text"
                name="student_id_number"
                value={formData.student_id_number}
                onChange={handleChange}
                isRequired
              />

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
