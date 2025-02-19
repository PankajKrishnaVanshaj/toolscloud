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
    "/text-to-image/tool",
    "/fake-data-generator/tool",

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

    "/pdf-to-word/tool",
    "/pdf-to-image/tool",
    "/merge-pdfs/tool",
    "/split-pdf/tool",
    "/compress-pdf/tool",
    "/pdf-editor/tool",
    "/pdf-watermark/tool",
    "/pdf-converter/tool",
    "/pdf-password-protector/tool",

    "/length-converter/tool",
    "/weight-converter/tool",
    "/temperature-converter/tool",
    "/volume-converter/tool",
    "/speed-converter/tool",

    "/time-zone-converter/tool",
    "/epoch-time-converter/tool",
    "/date-to-timestamp/tool",
    "/stopwatch/tool",
    "/countdown-timer/tool",

    "/csv-to-json/tool",
    "/json-to-xml/tool",
    "/yaml-to-json/tool",
    "/base64-encoder/tool",
    "/base64-decoder/tool",
    "/url-encoder/tool",
    "/url-decoder/tool",
    "/html-validator/tool",

    "/molecular-weight-calculator/tool",
    "/physics-unit-converter/tool",
    "/chemical-equation-balancer/tool",
    "/astronomical-unit-converter/tool",
    "/periodic-table-explorer/tool",

    "/password-strength-checker/tool",
    "/email-validator/tool",

    "/scientific-calculator/tool",
    "/equation-solver/tool",
    "/factorial-calculator/tool",
    "/matrix-calculator/tool",
    "/percentage-calculator/tool",

    "/color-picker/tool",
    "/hex-to-rgb/tool",
    "/color-gradient-generator/tool",
    "/contrast-checker/tool",
    "/palette-generator/tool",

    "/currency-converter/tool",
    "/loan-calculator/tool",
    "/tax-calculator/tool",
    "/investment-calculator/tool",
    "/retirement-savings-calculator/tool",

    "/barcode-scanner/tool",
    "/qr-code-scanner/tool",
    "/youtube-to-text/tool",
  ];

  return pages.map((page) => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
}
