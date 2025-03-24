import ToolList from "@/staticData/ToolList";

export default function sitemap() {
  const baseUrl = "https://toolscloud.pankri.com";

  return ToolList.flatMap(category => 
    category.tools.map(tool => ({
      url: `${baseUrl}/${tool.slug}/tool`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly",
      priority: 0.7,
    }))
  );
}