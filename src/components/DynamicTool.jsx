"use client"; // ✅ Mark as a Client Component

import dynamic from "next/dynamic";

const DynamicTool = ({ componentPath }) => {
  if (!componentPath) return null;

  const DynamicComponent = dynamic(() => import(`@/components/tools/${componentPath}`), {
    ssr: false,
  });

  return <DynamicComponent />;
};

export default DynamicTool;
