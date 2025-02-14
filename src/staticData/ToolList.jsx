import React from "react";
import {
  MdCheckCircle,
  MdTextFields,
  MdSwapHoriz,
  MdAutorenew,
  MdCode,
  MdImage,
  MdPictureAsPdf,
  MdStraighten,
  MdAccessTime,
  MdTransform,
  MdBuild,
  MdTrendingUp,
  MdSecurity,
  MdSmartToy,
  MdCalculate,
  MdPalette,
  MdAttachMoney,
  MdShare,
  MdWbSunny,
  MdScience,
  MdOutlineSpellcheck,
  MdOutlinePlagiarism,
  MdFormatQuote,
  MdOutlineTextFormat,
  MdOutlineFindReplace,
  MdOutlineCreate,
  MdOutlineEdit,
  MdOutlineSubtitles,
  MdOutlineTitle,
  MdOutlineWrapText,
  MdOutlineAutorenew,
  MdDns,
  MdHttp,
  MdOutlineNumbers,
  MdQrCode2,
  MdEditDocument,
  MdWaterDrop,
} from "react-icons/md";
import { LuScanBarcode } from "react-icons/lu";
import SeoDataImport from "@/components/SeoDataImport";

const ToolList = [
  {
    category: "Text Tools",
    slug: "text-tools",
    desc: "Text formatting and conversion tools",
    icon: <MdTextFields />,
    tools: [
      {
        name: "Word and Character Counter",
        slug: "word-character-counter",
        icon: <MdOutlineNumbers />,
        desc: "Analyze your text effortlessly with real-time word, character, sentence, and readability statistics.",
        code: "WordCharacterCounter",
        seo: SeoDataImport.WordCharacterCounter,
      },
      {
        name: "Find and Replace",
        slug: "find-and-replace",
        icon: <MdOutlineFindReplace />,
        desc: "Easily find and replace text within your content.",
        code: "TextFindandReplace",
        seo: SeoDataImport.FindAndReplace,
      },
      {
        name: "Text Case Converter",
        slug: "text-case-converter",
        icon: <MdOutlineTextFormat />,
        desc: "Convert text to uppercase, lowercase, title case, and more.",
        code: "TextCaseConverter",
        seo: SeoDataImport.TextCaseConverter,
      },
      {
        name: "Text to Speech",
        slug: "text-to-speech",
        icon: <MdOutlineSubtitles />,
        desc: "Convert written text into natural-sounding speech.",
        code: "TextToSpeech",
        seo: SeoDataImport.TextToSpeech,
      },
      {
        name: "Text Editor",
        slug: "text-editor",
        icon: <MdOutlineEdit />,
        desc: "A simple and powerful text editor for writing and formatting.",
        code: "TextEditor",
        seo: SeoDataImport.TextEditor,
      },
      {
        name: "Text Beautifier",
        slug: "text-beautifier",
        icon: <MdOutlineWrapText />,
        desc: "Enhance and beautify text formatting instantly.",
        code: "TextBeautifier",
        seo: SeoDataImport.TextBeautifier,
      },
      {
        name: "Spell Checker",
        slug: "spell-checker",
        icon: <MdOutlineSpellcheck />,
        desc: "Check and correct spelling mistakes in your text.",
        code: "SpellChecker",
        seo: SeoDataImport.SpellChecker,
      },
      {
        name: "Grammar Checker",
        slug: "grammar-checker",
        icon: <MdOutlineSpellcheck />,
        desc: "Analyze and correct grammar errors in your writing.",
        code: "GrammarChecker",
        seo: SeoDataImport.GrammarChecker,
      },

      {
        name: "Quote Validator",
        slug: "quote-validator",
        icon: <MdFormatQuote />,
        desc: "Verify and validate quotes for authenticity.",
        code: "QuoteValidator",
        seo: SeoDataImport.QuoteValidator,
      },
      {
        name: "Text Duplicator Checker",
        slug: "text-duplicator-checker",
        icon: <MdOutlineTextFormat />,
        desc: "Identify duplicate text within your content.",
        code: "TextDuplicatorChecker",
        seo: SeoDataImport.TextDuplicatorChecker,
      },
    ],
  },
  {
    category: "Generator Tools",
    slug: "generator-tools",
    desc: "Tools for generating text, codes, and more",
    icon: <MdAutorenew />,
    tools: [
      {
        name: "UUID Generator",
        slug: "uuid-generator",
        icon: <MdAutorenew />,
        desc: "Generate unique UUIDs for identifiers and security purposes.",
        code: "UUIDGenerator",
        seo: SeoDataImport.UUIDGenerator,
      },
      {
        name: "Barcode Generator",
        slug: "barcode-generator",
        icon: <LuScanBarcode />,
        desc: "Create barcodes for products, tracking, and inventory management.",
        code: "BarcodeGenerator",
        seo: SeoDataImport.BarcodeGenerator,
      },
      {
        name: "QR Code Generator",
        slug: "qr-code-generator",
        icon: <MdQrCode2 />,
        desc: "Generate QR codes for links, contact details, and more.",
        code: "QRCodeGenerator",
        seo: SeoDataImport.QRCodeGenerator,
      },
      {
        name: "Lorem Ipsum Generator",
        slug: "lorem-ipsum-generator",
        icon: <MdAutorenew />,
        desc: "Generate placeholder text for designs and mockups.",
        code: "LoremIpsumGenerator",
        seo: SeoDataImport.LoremIpsumGenerator,
      },
      {
        name: "Random Number Generator",
        slug: "random-number-generator",
        icon: <MdBuild />,
        desc: "Generate random numbers within a given range.",
        code: "RandomNumberGenerator",
        seo: SeoDataImport.RandomNumberGenerator,
      },
      {
        name: "Hash Generator",
        slug: "hash-generator",
        icon: <MdSecurity />,
        desc: "Generate secure hash values using various algorithms.",
        code: "HashGenerator",
        seo: SeoDataImport.HashGenerator,
      },
      {
        name: "Random Password Generator",
        slug: "random-password-generator",
        icon: <MdSecurity />,
        desc: "Create strong and secure passwords instantly.",
        code: "RandomPasswordGenerator",
        seo: SeoDataImport.RandomPasswordGenerator,
      },
    ],
  },
  {
    category: "Developer Tools",
    slug: "developer-tools",
    desc: "Essential tools for developers",
    icon: <MdCode />,
    tools: [
      {
        name: "JSON Formatter",
        slug: "json-formatter",
        icon: <MdCode />,
        desc: "Format and beautify JSON data for better readability.",
        code: "JSONFormatter",
        seo: SeoDataImport.JSONFormatter,
      },
      {
        name: "Regex Tester",
        slug: "regex-tester",
        icon: <MdCode />,
        desc: "Test and debug regular expressions interactively.",
        code: "RegexTester",
        seo: SeoDataImport.RegexTester,
      },
      {
        name: "Code Minifier",
        slug: "code-minifier",
        icon: <MdBuild />,
        desc: "Minify JavaScript, CSS, and HTML code for better performance.",
        code: "CodeMinifier",
        seo: SeoDataImport.CodeMinifier,
      },
      {
        name: "Markdown Previewer",
        slug: "markdown-previewer",
        icon: <MdCode />,
        desc: "Preview and render Markdown files in real time.",
        code: "MarkdownPreviewer",
        seo: SeoDataImport.MarkdownPreviewer,
      },
    ],
  },
  {
    category: "Image Tools",
    slug: "image-tools",
    desc: "Image editing and conversion tools",
    icon: <MdImage />,
    tools: [
      {
        name: "Image Resizer",
        slug: "image-resizer",
        icon: <MdStraighten />,
        desc: "Resize images to custom dimensions while maintaining quality.",
        code: "ImageResizer",
        seo: SeoDataImport.ImageResizer
      },
      {
        name: "Image Converter",
        slug: "image-converter",
        icon: <MdTransform />,
        desc: "Convert images between different formats such as JPG, PNG, and WebP.",
        code: "ImageConverter",
        seo:SeoDataImport.ImageConverter
      },
      {
        name: "Image Compressor",
        slug: "image-compressor",
        icon: <MdImage />,
        desc: "Compress images to reduce file size without losing quality.",
        code: "ImageCompressor",
        seo:SeoDataImport.ImageCompressor
      },
      {
        name: "Image Cropper",
        slug: "image-cropper",
        icon: <MdImage />,
        desc: "Crop images to specific dimensions or aspect ratios.",
        code: "ImageCropper",
        seo:SeoDataImport.ImageCropper
      },
      {
        name: "Image Enhancer",
        slug: "image-enhancer",
        icon: <MdImage />,
        desc: "Enhance image quality with AI-powered adjustments.",
        code: "ImageEnhancer",
        seo:SeoDataImport.ImageEnhancer
      },
      {
        name: "Image Watermarker",
        slug: "image-watermarker",
        icon: <MdImage />,
        desc: "Add text or image watermarks to protect your images.",
        code: "ImageWatermarker",
        seo: SeoDataImport.ImageWatermarker
      },
      {
        name: "Image Background Remover",
        slug: "image-background-remover",
        icon: <MdImage />,
        desc: "Remove the background of images using AI for a transparent look.",
        code: "ImageBackgroundRemover",
        seo: SeoDataImport.ImageBackgroundRemover
      },
      {
        name: "Image Collage Maker",
        slug: "image-collage-maker",
        icon: <MdImage />,
        desc: "Combine multiple images into beautiful collages.",
        code: "ImageCollageMaker",
        seo:SeoDataImport.ImageCollageMaker
      },
      {
        name: "Image Color Adjuster",
        slug: "image-color-adjuster",
        icon: <MdImage />,
        desc: "Fine-tune colors, brightness, and contrast for perfect images.",
        code: "ImageColorAdjuster",
        seo: SeoDataImport.ImageColorAdjuster
      },
    ],
  },
  {
    category: "PDF Tools",
    slug: "pdf-tools",
    desc: "Tools for managing and converting PDFs",
    icon: <MdPictureAsPdf />,
    tools: [
      {
        name: "PDF to Word",
        slug: "pdf-to-word",
        icon: <MdOutlineCreate />,
        desc: "Convert PDF files into editable Word documents.",
        code: "PDFToWord",
        seo:SeoDataImport.PdfToWord
      },
      {
        name: "PDF to Image",
        slug: "pdf-to-image",
        icon: <MdPictureAsPdf />,
        desc: "Convert PDF pages into high-quality images.",
        code: "PDFToImage",
        seo:SeoDataImport.PDFToImage
      },
      {
        name: "Merge PDFs",
        slug: "merge-pdfs",
        icon: <MdPictureAsPdf />,
        desc: "Combine multiple PDF files into a single document.",
        code: "MergePDFs",
        seo:SeoDataImport.MergePDFs
      },
      {
        name: "Split PDF",
        slug: "split-pdf",
        icon: <MdPictureAsPdf />,
        desc: "Extract pages or split large PDFs into smaller files.",
        code: "SplitPDF",
        seo:SeoDataImport.SplitPDF
      },
      {
        name: "Compress PDF",
        slug: "compress-pdf",
        icon: <MdPictureAsPdf />,
        desc: "Reduce the file size of PDFs without losing quality.",
        code: "CompressPDF",
        seo:SeoDataImport.CompressPDF
      },
      {
        name: "PDF Editor",
        slug: "pdf-editor",
        icon: <MdEditDocument />,
        desc: "Edit text, images, and annotations within PDFs.",
        code: "PDFEditor",
        seo:SeoDataImport.PDFEditor
      },
      {
        name: "PDF Watermark",
        slug: "pdf-watermark",
        icon: <MdWaterDrop />,
        desc: "Add watermarks to PDFs for branding or copyright protection.",
        code: "PDFWatermark",
        seo:SeoDataImport.PDFWatermark
      },
      {
        name: "PDF Converter",
        slug: "pdf-converter",
        icon: <MdOutlineCreate />,
        desc: "Convert PDF files into various formats like Word, Excel, and images.",
        code: "PDFConverter",
        seo:SeoDataImport.PDFConverter
      }
      
    ],
  },
  {
    category: "Unit Converter",
    slug: "unit-converter-tools",
    desc: "Convert different measurement units",
    icon: <MdStraighten />,
    tools: [
      {
        name: "Length Converter",
        slug: "length-converter",
        icon: <MdStraighten />,
        desc: "Convert length measurements between different units such as meters, feet, and inches.",
        code: "LengthConverter",
        // seo:LengthConverter
      },
      {
        name: "Weight Converter",
        slug: "weight-converter",
        icon: <MdStraighten />,
        desc: "Easily convert weight units like kilograms, pounds, and grams.",
        code: "WeightConverter",
        // seo:WeightConverter
      },
      {
        name: "Temperature Converter",
        slug: "temperature-converter",
        icon: <MdStraighten />,
        desc: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.",
        code: "TemperatureConverter",
        // seo:TemperatureConverter
      },
      {
        name: "Volume Converter",
        slug: "volume-converter",
        icon: <MdStraighten />,
        desc: "Convert volume units such as liters, milliliters, and gallons.",
        code: "VolumeConverter",
        // seo:VolumeConverter
      },
      {
        name: "Speed Converter",
        slug: "speed-converter",
        icon: <MdStraighten />,
        desc: "Convert speed units like kilometers per hour, miles per hour, and meters per second.",
        code: "SpeedConverter",
        // seo:SpeedConverter
      },
    ],
  },
  {
    category: "Time Converter",
    slug: "time-converter-tools",
    desc: "Convert time formats and zones",
    icon: <MdAccessTime />,
    tools: [
      {
        name: "Time Zone Converter",
        slug: "time-zone-converter",
        icon: <MdAccessTime />,
        desc: "Convert time between different time zones worldwide.",
        code: "TimeZoneConverter",
        // seo:TimeZoneConverter
      },
      {
        name: "Epoch Time Converter",
        slug: "epoch-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert Unix epoch timestamps to human-readable dates and vice versa.",
        code: "EpochTimeConverter",
        // seo:EpochTimeConverter
      },
      {
        name: "Date to Timestamp",
        slug: "date-to-timestamp",
        icon: <MdAccessTime />,
        desc: "Generate a timestamp from a given date and time.",
        code: "DateToTimestamp",
        // seo:DateToTimestamp
      },
      {
        name: "Stopwatch",
        slug: "stopwatch",
        icon: <MdAccessTime />,
        desc: "A simple online stopwatch to track time accurately.",
        code: "Stopwatch",
        // seo:Stopwatch
      },
      {
        name: "Countdown Timer",
        slug: "countdown-timer",
        icon: <MdAccessTime />,
        desc: "Set a countdown timer for any duration with alerts.",
        code: "CountdownTimer",
        // seo:CountdownTimer
      },
    ],
  },
  {
    category: "Data Converter",
    slug: "data-converter-tools",
    desc: "Convert and manipulate data formats",
    icon: <MdTransform />,
    tools: [
      {
        name: "CSV to JSON",
        slug: "csv-to-json",
        icon: <MdTransform />,
        desc: "Convert CSV data to JSON format easily.",
        code: "CsvToJson",
        // seo: CsvToJson
      },
      {
        name: "JSON to XML",
        slug: "json-to-xml",
        icon: <MdTransform />,
        desc: "Convert JSON data to XML format for seamless integration.",
        code: "JsonToXml",
        // seo:JsonToXml
      },
      {
        name: "YAML to JSON",
        slug: "yaml-to-json",
        icon: <MdTransform />,
        desc: "Convert YAML data to JSON format effortlessly.",
        code: "YamlToJson",
        // seo:YamlToJson
      },
      {
        name: "Base64 Encoder",
        slug: "base64-encoder",
        icon: <MdSecurity />,
        desc: "Encode text or files to Base64 format.",
        code: "Base64Encoder",
        // seo:Base64Encoder
      },
      {
        name: "Base64 Decoder",
        slug: "base64-decoder",
        icon: <MdTransform />,
        desc: "Decode Base64-encoded text or files back to their original form.",
        code: "Base64Decoder",
        // seo:Base64Decoder
      },
      {
        name: "URL Encoder",
        slug: "url-encoder",
        icon: <MdTransform />,
        desc: "Encode special characters in URLs to make them safe for web use.",
        code: "URLEncoder",
        // seo:URLEncoder
      },
      {
        name: "URL Decoder",
        slug: "url-decoder",
        icon: <MdTransform />,
        desc: "Decode encoded URLs back to their original readable format.",
        code: "URLDecoder",
        // seo:URLDecoder
      },
    ],
  },
  {
    category: "Science Tools",
    slug: "science-tools",
    desc: "Tools for scientific calculations and simulations",
    icon: <MdScience />,
    tools: [
      {
        name: "Molecular Weight Calculator",
        slug: "molecular-weight-calculator",
        icon: <MdScience />,
        desc: "Calculate the molecular weight of chemical compounds based on their molecular formulas.",
        code: "MolecularWeightCalculator",
        // seo:MolecularWeightCalculator
      },
      {
        name: "Physics Unit Converter",
        slug: "physics-unit-converter",
        icon: <MdScience />,
        desc: "Convert between different physics units for length, mass, energy, and more.",
        code: "PhysicsUnitConverter",
        // seo:PhysicsUnitConverter
      },
      {
        name: "Chemical Equation Balancer",
        slug: "chemical-equation-balancer",
        icon: <MdScience />,
        desc: "Balance chemical equations automatically for accurate reactions.",
        code: "ChemicalEquationBalancer",
        // seo:ChemicalEquationBalancer
      },
      {
        name: "Astronomical Unit Converter",
        slug: "astronomical-unit-converter",
        icon: <MdScience />,
        desc: "Convert astronomical units such as light-years, parsecs, and AU.",
        code: "AstronomicalUnitConverter",
        // seo:AstronomicalUnitConverter
      },
      {
        name: "Periodic Table Explorer",
        slug: "periodic-table-explorer",
        icon: <MdScience />,
        desc: "Explore detailed information about elements in the periodic table.",
        code: "PeriodicTableExplorer",
        // seo:PeriodicTableExplorer
      },
    ],
  },

  {
    category: "Security Tools",
    slug: "security-tools",
    desc: "Tools for security and encryption",
    icon: <MdSecurity />,
    tools: [
      {
        name: "Password Strength Checker",
        slug: "password-strength-checker",
        icon: <MdSecurity />,
        desc: "Evaluate the strength of your password and get security recommendations.",
        code: "PasswordStrengthChecker",
        // seo: PasswordStrengthChecker
      },

      {
        name: "Email Validator",
        slug: "email-validator",
        icon: <MdSecurity />,
        desc: "Check if an email address is valid, properly formatted, and exists.",
        code: "EmailValidator",
        // seo:EmailValidator
      },
    ],
  },

  {
    category: "Math Tools",
    slug: "math-tools",
    desc: "Tools for calculations and equations",
    icon: <MdCalculate />,
    tools: [
      {
        name: "Scientific Calculator",
        slug: "scientific-calculator",
        icon: <MdCalculate />,
        desc: "Perform advanced mathematical calculations with a scientific calculator.",
        code: "ScientificCalculator",
        // seo:ScientificCalculator
      },
      {
        name: "Equation Solver",
        slug: "equation-solver",
        icon: <MdCalculate />,
        desc: "Solve linear and quadratic equations instantly.",
        code: "EquationSolver",
        // seo:EquationSolver
      },
      {
        name: "Factorial Calculator",
        slug: "factorial-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the factorial of any number easily.",
        code: "FactorialCalculator",
        // seo:FactorialCalculator
      },
      {
        name: "Matrix Calculator",
        slug: "matrix-calculator",
        icon: <MdCalculate />,
        desc: "Perform matrix operations like addition, multiplication, and inverses.",
        code: "MatrixCalculator",
        // seo:MatrixCalculator
      },
      {
        name: "Percentage Calculator",
        slug: "percentage-calculator",
        icon: <MdCalculate />,
        desc: "Easily compute percentages for discounts, taxes, and profit margins.",
        code: "PercentageCalculator",
        // seo:PercentageCalculator
      },
    ],
  },
  {
    category: "Color Tools",
    slug: "color-tools",
    desc: "Pick and convert colors",
    icon: <MdPalette />,
    tools: [
      {
        name: "Color Picker",
        slug: "color-picker",
        icon: <MdPalette />,
        desc: "Pick and preview colors with HEX, RGB, and HSL values.",
        code: "ColorPicker",
        // seo:ColorPicker
      },
      {
        name: "Hex to RGB",
        slug: "hex-to-rgb",
        icon: <MdPalette />,
        desc: "Convert HEX color codes to RGB and vice versa.",
        code: "HexToRGB",
        // seo:HexToRGB
      },
      {
        name: "Color Gradient Generator",
        slug: "color-gradient-generator",
        icon: <MdPalette />,
        desc: "Create beautiful color gradients with CSS code output.",
        code: "GradientGenerator",
        // seo:GradientGenerator
      },
      {
        name: "Contrast Checker",
        slug: "contrast-checker",
        icon: <MdPalette />,
        desc: "Check color contrast for accessibility and readability compliance.",
        code: "ContrastChecker",
        // seo:ContrastChecker
      },
      {
        name: "Palette Generator",
        slug: "palette-generator",
        icon: <MdPalette />,
        desc: "Generate harmonious color palettes for design projects.",
        code: "PaletteGenerator",
        // seo:PaletteGenerator
      },
    ],
  },
  {
    category: "Finance Tools",
    slug: "finance-tools",
    desc: "Financial calculators and converters",
    icon: <MdAttachMoney />,
    tools: [
      {
        name: "Currency Converter",
        slug: "currency-converter",
        icon: <MdAttachMoney />,
        desc: "Convert currencies with real-time exchange rates.",
        code: "CurrencyConverter",
        // seo:CurrencyConverter
      },
      {
        name: "Loan Calculator",
        slug: "loan-calculator",
        icon: <MdAttachMoney />,
        desc: "Calculate monthly payments and total interest for loans.",
        code: "LoanCalculator",
        // seo:LoanCalculator
      },
      {
        name: "Tax Calculator",
        slug: "tax-calculator",
        icon: <MdAttachMoney />,
        desc: "Compute taxes based on income and deductions.",
        code: "TaxCalculator",
        // seo:TaxCalculator
      },
      {
        name: "Investment Calculator",
        slug: "investment-calculator",
        icon: <MdAttachMoney />,
        desc: "Project potential investment growth over time.",
        code: "InvestmentCalculator",
        // seo:InvestmentCalculator
      },
      {
        name: "Retirement Savings Calculator",
        slug: "retirement-savings-calculator",
        icon: <MdAttachMoney />,
        desc: "Plan your retirement savings and estimate future value.",
        code: "RetirementCalculator",
        // seo:RetirementCalculator
      },
    ],
  },

  {
    category: "Misc Tools",
    slug: "misc-tools",
    desc: "Various utility tools",
    icon: <MdBuild />,
    tools: [
      {
        name: "Barcode Scanner",
        slug: "barcode-scanner",
        icon: <MdBuild />,
        desc: "Scan barcodes and retrieve product details instantly.",
        code: "BarcodeScanner",
        // seo:BarcodeScanner
      },
      {
        name: "Clipboard Manager",
        slug: "clipboard-manager",
        icon: <MdBuild />,
        desc: "Manage and organize your copied text efficiently.",
        code: "clipboardManager",
      },
    ],
  },
];

export default ToolList;
