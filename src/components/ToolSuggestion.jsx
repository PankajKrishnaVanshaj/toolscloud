"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import ToolList from "@/staticData/ToolList";

const ToolSuggestion = () => {
  const params = useParams();
  const currentToolSlug = params?.cat;

  // Find current tool and category
  let currentCategory = null;
  let relatedTools = [];

  for (const category of ToolList) {
    const tool = category.tools.find((t) => t.slug === currentToolSlug);
    if (tool) {
      currentCategory = category;
      relatedTools = category.tools.filter((t) => t.slug !== currentToolSlug);
      break;
    }
  }

  if (!currentCategory || relatedTools.length === 0) return null;

  return (
    <div className="my-8 p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text mb-4">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relatedTools.map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}/tool`} className="group">
            <div className="p-4 bg-white shadow rounded-lg flex items-center space-x-3 cursor-pointer hover:bg-blue-50 transition-all duration-300 transform hover:-translate-y-1">
              <span className="text-primary text-2xl group-hover:scale-110 transition-transform">
                {tool.icon}
              </span>
              <span className="bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text font-semibold">{tool.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ToolSuggestion;
