export default function sitemap() {
  const baseUrl = "https://toolscloud.pankri.com";

  const pages = [
    "/word-character-counter/tool",
    "/find-and-replace/tool",
    "/text-case-converter/tool",
    "/text-to-speech/tool",
    "/text-editor/tool",
    "/text-beautifier/tool",
    "/spell-checker/tool",
    "/grammar-checker/tool",
    "/quote-validator/tool",
    "/text-duplicator-checker/tool",

    "/hash-generator/tool",
    "/uuid-generator/tool",
    "/barcode-generator/tool",
    "/qr-code-generator/tool",
    "/lorem-ipsum-generator/tool",
    "/random-number-generator/tool",
    "/random-password-generator/tool",

    "/json-formatter/tool",
    "/regex-tester/tool",
    "/code-minifier/tool",
    "/markdown-previewer/tool",

    "/image-resizer/tool",
    "/image-converter/tool",
    "/image-compressor/tool",
    "/image-cropper/tool",
    "/image-enhancer/tool",
    "/image-watermarker/tool",
    "/image-collage-maker/tool",
    "/image-color-adjuster/tool",
    "/image-background-remover/tool",

    '/pdf-to-word/tool',
    '/pdf-to-image/tool',
    '/merge-pdfs/tool',
    '/split-pdf/tool',
    '/compress-pdf/tool',
    '/pdf-editor/tool',
    '/pdf-watermark/tool',
    '/pdf-converter/tool'
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
