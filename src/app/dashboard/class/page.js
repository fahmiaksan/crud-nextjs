import ClassComponent from "@/components/Class";
import { Suspense } from "react";

export default function ClassPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClassComponent />
    </Suspense>
  )
}