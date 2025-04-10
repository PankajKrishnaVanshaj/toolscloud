import ToolList from "@/staticData/ToolList";
import ToolSuggestion from "@/components/ToolSuggestion";
import Link from "next/link";
import DynamicTool from "@/components/DynamicTool";
import DynamicBlogData from "@/components/DynamicBlogData";
import loadSeoData from "@/components/DynamicSeoData";
import { ShareButton } from "@/components/ShareButton";

export async function generateMetadata({ params }) {
  const { cat } = await params;
  if (!cat) return {};

  const matchedTool = await findMatchedTool(cat, false); 
  if (!matchedTool) return {};

  // Dynamically load SEO data based on tool code
  const seo = await loadSeoData(matchedTool.code);
  return seo;
}

const findMatchedTool = async (toolSlug) => {
  const matched = ToolList.reduce((acc, category) => {
    if (acc) return acc;
    const foundTool = category.tools.find((tool) => tool.slug === toolSlug);
    return foundTool ? { ...foundTool, category: category.category } : null;
  }, null);
  if (matched && matched.descLoader) {
    matched.desc = await matched.descLoader();
  }
  return matched;
};

const Tool = async ({ params }) => {
  const { cat } = await params;
  const matchedTool = await findMatchedTool(cat);

  if (!matchedTool) {
    return (
      <div className="p-6 text-lg font-semibold text-red-600 bg-red-100 rounded-lg shadow-md">
        No match found
      </div>
    );
  }

  return (
    <section>
      <div className="p-6 lg:p-8">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-3xl text-primary">{matchedTool.icon}</span>
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            {matchedTool.name}
          </h1>
          <span>
            <ShareButton
              url={matchedTool.slug}
              title={`${matchedTool.name} - PK ToolsCloud`}
              text={`Try ${matchedTool.name} for free at PK ToolsCloud!`}
            />
          </span>
        </div>

        <p className="text-gray-700 text-lg leading-relaxed">
          {matchedTool.desc}
        </p>

        <div className="mt-0.5">
          <p className="text-sm bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text bg-gray-100 px-3 py-2 inline-block rounded-md">
            <strong className="text-primary">Category:</strong>{" "}
            {matchedTool.category}
          </p>
          
        </div>

        <div className="mt-6 p-4 lg:p-6 bg-gray-50 rounded-lg shadow-inner">
          <DynamicTool code={matchedTool.code} />
        </div>
        <div className="mt-6 p-4 lg:p-6 bg-gray-50 rounded-lg shadow-inner">
          <DynamicBlogData code={matchedTool.code} />
        </div>

        <div className="my-8">
          <ToolSuggestion />
        </div>

        <div className="py-12 px-6 max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            Browse by Categories
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {ToolList.map((category) => (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className="flex items-center gap-2 px-4 py-1.5 bg-white text-secondary shadow-md border border-gray-300 rounded-xl hover:text-primary hover:border-primary hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
                  {category.category}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Tool;
