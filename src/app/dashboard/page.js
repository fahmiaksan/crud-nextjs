"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardContent, Spinner } from "@heroui/react";
import { useSession } from "next-auth/react";
import useTeacherStore from "@/store/useTeacherStore";
import useClassStore from "@/store/useClassStore";
import useStudentStore from "@/store/useStudentStore";
import useSubjectStore from "@/store/useSubjectStore";
import { dashboardData } from "@/lib/fetch.dashboard";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { teachers, setTeachers } = useTeacherStore();
  const { classes, setClasses } = useClassStore();
  const { students, setStudents } = useStudentStore();
  const { subjects, setSubjects } = useSubjectStore();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardData();
        if (!response.success) throw new Error(response.message);
        setTeachers(response.data.teachers);
        setClasses(response.data.classes);
        setStudents(response.data.students);
        setSubjects(response.data.subjects);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const dataStats = [
    { title: "Subjects", count: subjects.length, color: "bg-blue-500" },
    { title: "Classes", count: classes.length, color: "bg-green-500" },
    { title: "Students", count: students.length, color: "bg-yellow-500" },
    { title: "Teachers", count: teachers.length, color: "bg-red-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <Spinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {dataStats.map((stat) => (
            <Card key={stat.title} className={`p-6 text-white ${stat.color} shadow-lg rounded-xl`}>
              <CardBody className="text-center">
                <h2 className="text-lg font-semibold">{stat.title}</h2>
                <p className="text-4xl font-bold">{stat.count}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
