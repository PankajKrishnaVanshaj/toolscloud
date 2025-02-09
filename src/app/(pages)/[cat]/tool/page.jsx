import dynamic from "next/dynamic";
import ToolList from "@/staticData/ToolList";
import ToolSuggestion from "@/components/ToolSuggestion";

// ✅ No need to `await` params
export async function generateMetadata({ params }) {
  const { cat } = await params;
  if (!cat) return {};

  const matchedTool = findMatchedTool(cat);
  return matchedTool?.seo || {};
}

// Function to find the tool
const findMatchedTool = (toolSlug) => {
  return ToolList.reduce((acc, category) => {
    if (acc) return acc;
    const foundTool = category.tools.find((tool) => tool.slug === toolSlug);
    return foundTool ? { ...foundTool, category: category.category } : null;
  }, null);
};

const Tool = async ({ params }) => {
  const { cat } = await params; // ✅ No need for await
  const matchedTool = findMatchedTool(cat);

  if (!matchedTool) {
    return (
      <div className="p-6 text-lg font-semibold text-red-600 bg-red-100 rounded-lg shadow-md">
        No match found
      </div>
    );
  }

  // ✅ Correct way to dynamically import the tool component
  const DynamicComponent = dynamic(() =>
    import(`@/components/tools/${matchedTool.code}`).catch(() => () => (
      <p className="text-red-600">Component not found</p>
    ))
  );

  return (
    <section>
      <div className="p-6 lg:p-8">
        {/* Tool Header */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-3xl text-primary">{matchedTool.icon}</span>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            {matchedTool.name}
          </h1>
        </div>

        {/* Tool Description */}
        <p className="text-gray-700 text-lg leading-relaxed">
          {matchedTool.desc}
        </p>

        {/* Category Info */}
        <div className="mt-2">
          <p className="text-sm bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text bg-gray-100 px-3 py-2 inline-block rounded-md">
            <strong className="text-primary">Category:</strong>{" "}
            {matchedTool.category}
          </p>
        </div>

        {/* ✅ Correct usage of DynamicComponent */}
        <div className="mt-6 p-4 lg:p-6 bg-gray-50 rounded-lg shadow-inner">
          <DynamicComponent />
        </div>

        {/* Tool Suggestions */}
        <div className="mt-8">
          <ToolSuggestion />
        </div>
      </div>
    </section>
  );
};

export default Tool;
