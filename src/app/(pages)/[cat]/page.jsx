import ToolList from "@/staticData/ToolList";
import Link from "next/link";

const Category = async ({ params }) => {
  const { cat } = await params;

  const filteredCategories =
    cat && ToolList.some((category) => category.slug === cat)
      ? ToolList.filter((category) => category.slug === cat)
      : ToolList;

  return (
    <div className="w-full flex flex-col items-center gap-6 my-10 px-6">
      {filteredCategories.map((category) => (
        <div
          key={category.slug}
          className="w-full p-5 bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-100 rounded-2xl flex flex-col items-start transition-all duration-300 hover:shadow-2xl  hover:border-secondary transform hover:-translate-y-1"
        >
          {/* Category Header */}
          <div className="flex items-center gap-2 ">
            <span className="text-5xl text-primary">{category.icon}</span>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
              {category.category}
            </h2>
          </div>

          <p className="text-lg text-secondary leading-relaxed mb-6">
            {category.desc}
          </p>

          {/* Tools List - Flex Row */}
          <div className="w-full flex flex-row flex-wrap gap-3">
            {category.tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${tool.slug}/tool`}
                className="flex items-center gap-2 px-4 py-1.5 bg-white text-secondary shadow-md border border-gray-300 rounded-xl  hover:text-primary hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="text-xl">{tool.icon}</span>
                <span className="text-base font-semibold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                  {tool.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Category;