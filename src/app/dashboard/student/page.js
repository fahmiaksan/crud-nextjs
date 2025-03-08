import StudentComponent from "@/components/Student";
import { Suspense } from "react";
import Loading from "./loading";

export default function StudentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <StudentComponent />
    </Suspense>
  )
}