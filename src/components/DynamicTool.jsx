"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const DynamicTool = ({ code }) => {
  const DynamicComponent = dynamic(
    () => import(`@/components/tools/${code}`).catch(() => () => (
      <p className="text-red-600">Component not found</p>
    )),
    { ssr: false } // Client-side only
  );

  return (
    <Suspense fallback={<p>Loading tool...</p>}>
      <DynamicComponent />
    </Suspense>
  );
};

export default DynamicTool;