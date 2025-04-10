"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const DynamicBlogData = ({ code }) => {
  const DynamicBlog = dynamic(
    () => import(`@/staticData/blogData/${code}`).catch(() => () => (
      <p className="text-red-600">Blog not found</p>
    )),
    { ssr: false } // Client-side only
  );

  return (
    <Suspense fallback={<p>Loading blog...</p>}>
      <DynamicBlog />
    </Suspense>
  );
};

export default DynamicBlogData;