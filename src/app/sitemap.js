export default function sitemap() {
    const baseUrl = 'https://toolscloud.pankri.com';
  
    const pages = [
      '/word-character-counter/tool',
      '/find-replace/tool',
      '/text-case-converter/tool',
      '/text-beautifier/tool',
      '/json-formatter/tool',
      '/url-encoder/tool',
      '/url-decoder/tool',
      '/html-formatter/tool',
      '/base64-encoder/tool',
      '/base64-decoder/tool',
    ];
  
    return pages.map((page) => ({
      url: `${baseUrl}${page}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  }
  