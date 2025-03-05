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
  MdQrCodeScanner,
  MdVideoLibrary,
  MdLink,
  MdStorage,
  MdOutlineRepeat,
  MdOutlineAssessment,
  MdOutlineTextFields,
  MdOutlineLink,
  MdOutlineCode,
  MdOutlineDifference,
  MdOutlineContentCut,
  MdOutlineFormatClear,
  MdOutlineCloud,
  MdOutlineFormatListNumbered,
  MdOutlineLabel,
  MdOutlineFilterAlt,
  MdOutlineLockOpen,
  MdOutlineLock,
  MdOutlineFingerprint,
  MdOutlineStraighten,
  MdOutlineSegment,
  MdOutlineSpaceBar,
  MdOutlineRotateRight,
  MdOutlineBlurOn,
  MdOutlineAnalytics,
  MdOutlineMergeType,
  MdOutlineCallSplit,
  MdOutlineCleaningServices,
  MdOutlineFormatIndentIncrease,
  MdOutlineFormatAlignLeft,
  MdOutlineTranslate,
  MdOutlineVisibilityOff,
  MdOutlineExpand,
  MdOutlineShortText,
  MdOutlineHighlight,
  MdOutlineCasino,
  MdOutlineSort,
  MdOutlineCompare,
  MdOutlineShuffle,
  MdOutlineSwapHoriz,
  MdOutlineDraw,
  MdOutlineBook,
  MdOutlineDomain,
  MdOutlineInsertDriveFile,
  MdOutlineEmojiEmotions,
  MdOutlineFormatQuote,
  MdOutlineImage,
  MdOutlineList,
  MdOutlineVerified,
  MdOutlineAccessTime,
  MdOutlineLocationOn,
  MdOutlinePerson,
  MdOutlineTableChart,
  MdOutlineToggleOn,
  MdOutlineDesignServices,
  MdOutlineLocalOffer,
  MdOutlineNetworkWifi,
  MdOutlineNetworkCheck,
  MdOutlineCalendarToday,
  MdLockOutline,
  MdOutlinePhone,
  MdCreditCard,
  MdGradient,
  MdPersonOutline,
  MdOutlineEmail,
  MdVpnKey,
  MdNetworkCheck,
  MdDescription,
  MdAssessment,
  MdTableChart,
  MdTerminal,
  MdAccountTree,
  MdSpeed,
  MdBugReport,
  MdFingerprint,
  MdSettings,
  MdMap,
  MdInfoOutline,
  MdCompare,
  MdSchedule,
  MdLock,
  MdLockOpen,
  MdRotateRight,
  MdFlip,
  MdFilterBAndW,
  MdFilterVintage,
  MdBlurOn,
  MdFilter,
  MdBrightness5,
  MdContrast,
  MdBorderStyle,
  MdLayers,
  MdDelete,
  MdPrint,
  MdAccessibility,
  MdFontDownload,
  MdBook,
  MdSort,
  MdCrop,
  MdEdit,
  MdFormatListNumbered,
  MdBookmark,
  MdVisibilityOff,
  MdDraw,
  MdOutlineSlideshow,
  MdElectricBolt,
  MdKitchen,
  MdVolumeUp,
  MdLocalGasStation,
  MdPower,
  MdEnergySavingsLeaf,
  MdHistory,
  MdCalendarToday,
  MdSync,
  MdWork,
  MdEvent,
  MdNightlight,
  MdTimer,
  MdPublic,
  MdStar,
  MdBiotech,
  MdCloudUpload,
  MdEmail,
  MdDeleteForever,
  MdBrightness6,
  MdColorLens,
  MdHome,
  MdSavings,
  MdBusiness,
  MdSchool,
  MdAccountBalance,
  MdDirectionsCar,
  MdLocalOffer,
  MdZoomIn,
  MdContentPaste,
  MdLightbulbOutline,
  MdVolunteerActivism,
  MdCreate,
  MdWeb,
  MdCelebration,
  MdVideogameAsset,
  MdExplore,
  MdFlight,
  MdMusicNote,
  MdCasino,
  MdList,
  MdRestaurant,
  MdTranslate,
  MdMonitor,
  MdKeyboard,
  MdLocalFlorist,
  MdMouse,
  MdQuiz,
  MdMic,
  MdVideocam,
  MdBrush,
  MdInsertDriveFile,
  MdEmojiEmotions,
  MdFitnessCenter,
  MdSentimentSatisfied,
  MdBatteryChargingFull,
  MdMovie,
  MdPets,
  MdLocationCity,
  MdGroup,
  MdDomain,
  MdLocationOn,
  MdShoppingCart,
  MdDataObject,
  MdSchema,
} from "react-icons/md";
import { LuScanBarcode } from "react-icons/lu";
import SeoDataImport from "./SeoDataImport";

const ToolList = [
  {
    category: "Text Tools",
    slug: "text-tools",
    desc: "Text formatting and conversion tools",
    icon: <MdTextFields />,
    tools: [
      {
        name: "Text to Image",
        slug: "text-to-image",
        icon: <MdOutlineSubtitles />,
        desc: "Easily overlay custom text on your images with different fonts, colors, and styles.",
        code: "TextToImage",
        seo: SeoDataImport.TextToImageGenerator,
      },
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
      {
        name: "Text Reverser",
        slug: "text-reverser",
        icon: <MdOutlineSwapHoriz />,
        desc: "Reverse the order of characters or words in your text.",
        code: "TextReverser",
        seo: SeoDataImport.TextReverser,
      },
      {
        name: "Text Shuffler",
        slug: "text-shuffler",
        icon: <MdOutlineShuffle />,
        desc: "Randomly shuffle words or lines in your text.",
        code: "TextShuffler",
        seo: SeoDataImport.TextShuffler,
      },
      {
        name: "Text Encoder",
        slug: "text-encoder",
        icon: <MdOutlineLock />,
        desc: "Encode text into formats like Base64 or URL encoding.",
        code: "TextEncoder",
        seo: SeoDataImport.TextEncoder,
      },
      {
        name: "Text Decoder",
        slug: "text-decoder",
        icon: <MdOutlineLockOpen />,
        desc: "Decode text from Base64, URL encoding, or other formats.",
        code: "TextDecoder",
        seo: SeoDataImport.TextDecoder,
      },
      {
        name: "Text Trimmer",
        slug: "text-trimmer",
        icon: <MdOutlineContentCut />,
        desc: "Remove extra spaces, tabs, or line breaks from text.",
        code: "TextTrimmer",
        seo: SeoDataImport.TextTrimmer,
      },
      {
        name: "Text Comparator",
        slug: "text-comparator",
        icon: <MdOutlineCompare />,
        desc: "Compare two texts and highlight differences.",
        code: "TextComparator",
        seo: SeoDataImport.TextComparator,
      },
      {
        name: "Text Sorter",
        slug: "text-sorter",
        icon: <MdOutlineSort />,
        desc: "Sort lines or words alphabetically or numerically.",
        code: "TextSorter",
        seo: SeoDataImport.TextSorter,
      },
      {
        name: "Text Extractor",
        slug: "text-extractor",
        icon: <MdOutlineFilterAlt />,
        desc: "Extract specific patterns like emails or URLs from text.",
        code: "TextExtractor",
        seo: SeoDataImport.TextExtractor,
      },
      {
        name: "Text Randomizer",
        slug: "text-randomizer",
        icon: <MdOutlineCasino />,
        desc: "Generate random text or scramble existing text.",
        code: "TextRandomizer",
        seo: SeoDataImport.TextRandomizer,
      },
      {
        name: "Text Highlighter",
        slug: "text-highlighter",
        icon: <MdOutlineHighlight />,
        desc: "Highlight specific words or phrases in your text.",
        code: "TextHighlighter",
        seo: SeoDataImport.TextHighlighter,
      },
      {
        name: "Text Summarizer",
        slug: "text-summarizer",
        icon: <MdOutlineShortText />,
        desc: "Create concise summaries of long text.",
        code: "TextSummarizer",
        seo: SeoDataImport.TextSummarizer,
      },
      {
        name: "Text Expander",
        slug: "text-expander",
        icon: <MdOutlineExpand />,
        desc: "Expand abbreviations or shorthand into full text.",
        code: "TextExpander",
        seo: SeoDataImport.TextExpander,
      },
      {
        name: "Text Redactor",
        slug: "text-redactor",
        icon: <MdOutlineVisibilityOff />,
        desc: "Redact sensitive information from your text.",
        code: "TextRedactor",
        seo: SeoDataImport.TextRedactor,
      },
      {
        name: "Text Translator",
        slug: "text-translator",
        icon: <MdOutlineTranslate />,
        desc: "Translate text into multiple languages.",
        code: "TextTranslator",
        seo: SeoDataImport.TextTranslator,
      },
      {
        name: "Text Aligner",
        slug: "text-aligner",
        icon: <MdOutlineFormatAlignLeft />,
        desc: "Align text to left, right, center, or justify.",
        code: "TextAligner",
        seo: SeoDataImport.TextAligner,
      },
      {
        name: "Text Formatter",
        slug: "text-formatter",
        icon: <MdOutlineFormatIndentIncrease />,
        desc: "Apply custom formatting like bold, italic, or indentation.",
        code: "TextFormatter",
        seo: SeoDataImport.TextFormatter,
      },
      {
        name: "Text Cleaner",
        slug: "text-cleaner",
        icon: <MdOutlineCleaningServices />,
        desc: "Remove unwanted characters or formatting from text.",
        code: "TextCleaner",
        seo: SeoDataImport.TextCleaner,
      },
      {
        name: "Text Generator",
        slug: "text-generator",
        icon: <MdOutlineCreate />,
        desc: "Generate placeholder text like Lorem Ipsum.",
        code: "TextGenerator",
        seo: SeoDataImport.TextGenerator,
      },
      {
        name: "Text Splitter",
        slug: "text-splitter",
        icon: <MdOutlineCallSplit />,
        desc: "Split text into chunks by words, lines, or characters.",
        code: "TextSplitter",
        seo: SeoDataImport.TextSplitter,
      },
      {
        name: "Text Joiner",
        slug: "text-joiner",
        icon: <MdOutlineMergeType />,
        desc: "Combine multiple text segments with custom separators.",
        code: "TextJoiner",
        seo: SeoDataImport.TextJoiner,
      },
      {
        name: "Text Analyzer",
        slug: "text-analyzer",
        icon: <MdOutlineAnalytics />,
        desc: "Analyze text for sentiment, keywords, or readability.",
        code: "TextAnalyzer",
        seo: SeoDataImport.TextAnalyzer,
      },
      {
        name: "Text Obfuscator",
        slug: "text-obfuscator",
        icon: <MdOutlineBlurOn />,
        desc: "Obfuscate text to make it harder to read.",
        code: "TextObfuscator",
        seo: SeoDataImport.TextObfuscator,
      },
      {
        name: "Text Rotator",
        slug: "text-rotator",
        icon: <MdOutlineRotateRight />,
        desc: "Rotate text using ROT13 or custom ciphers.",
        code: "TextRotator",
        seo: SeoDataImport.TextRotator,
      },
      {
        name: "Text Padder",
        slug: "text-padder",
        icon: <MdOutlineSpaceBar />,
        desc: "Add padding characters to align or format text.",
        code: "TextPadder",
        seo: SeoDataImport.TextPadder,
      },
      {
        name: "Text Tokenizer",
        slug: "text-tokenizer",
        icon: <MdOutlineSegment />,
        desc: "Break text into tokens for processing.",
        code: "TextTokenizer",
        seo: SeoDataImport.TextTokenizer,
      },
      {
        name: "Text Normalizer",
        slug: "text-normalizer",
        icon: <MdOutlineStraighten />,
        desc: "Normalize text by removing accents or special characters.",
        code: "TextNormalizer",
        seo: SeoDataImport.TextNormalizer,
      },
      {
        name: "Text Hasher",
        slug: "text-hasher",
        icon: <MdOutlineFingerprint />,
        desc: "Generate hash values (e.g., MD5, SHA) from text.",
        code: "TextHasher",
        seo: SeoDataImport.TextHasher,
      },
      {
        name: "Text Encryptor",
        slug: "text-encryptor",
        icon: <MdOutlineLock />,
        desc: "Encrypt text using simple ciphers or algorithms.",
        code: "TextEncryptor",
        seo: SeoDataImport.TextEncryptor,
      },
      {
        name: "Text Decryptor",
        slug: "text-decryptor",
        icon: <MdOutlineLockOpen />,
        desc: "Decrypt text encrypted with known ciphers.",
        code: "TextDecryptor",
        seo: SeoDataImport.TextDecryptor,
      },
      {
        name: "Text Profanity Filter",
        slug: "text-profanity-filter",
        icon: <MdOutlineFilterAlt />,
        desc: "Remove or censor profane words from text.",
        code: "TextProfanityFilter",
        seo: SeoDataImport.TextProfanityFilter,
      },
      {
        name: "Text Keyword Extractor",
        slug: "text-keyword-extractor",
        icon: <MdOutlineLabel />,
        desc: "Extract key words or phrases from text.",
        code: "TextKeywordExtractor",
        seo: SeoDataImport.TextKeywordExtractor,
      },
      {
        name: "Text Line Numberer",
        slug: "text-line-numberer",
        icon: <MdOutlineFormatListNumbered />,
        desc: "Add line numbers to your text.",
        code: "TextLineNumberer",
        seo: SeoDataImport.TextLineNumberer,
      },
      {
        name: "Text Word Cloud Generator",
        slug: "text-word-cloud-generator",
        icon: <MdOutlineCloud />,
        desc: "Create a word cloud from your text.",
        code: "TextWordCloudGenerator",
        seo: SeoDataImport.TextWordCloudGenerator,
      },
      {
        name: "Text Unformatter",
        slug: "text-unformatter",
        icon: <MdOutlineFormatClear />,
        desc: "Strip all formatting from text.",
        code: "TextUnformatter",
        seo: SeoDataImport.TextUnformatter,
      },
      {
        name: "Text Length Truncator",
        slug: "text-length-truncator",
        icon: <MdOutlineContentCut />,
        desc: "Truncate text to a specified length.",
        code: "TextLengthTruncator",
        seo: SeoDataImport.TextLengthTruncator,
      },
      {
        name: "Text Diff Viewer",
        slug: "text-diff-viewer",
        icon: <MdOutlineDifference />,
        desc: "View differences between two text versions side-by-side.",
        code: "TextDiffViewer",
        seo: SeoDataImport.TextDiffViewer,
      },
      {
        name: "Text Morse Converter",
        slug: "text-morse-converter",
        icon: <MdOutlineCode />,
        desc: "Convert text to Morse code and vice versa.",
        code: "TextMorseConverter",
        seo: SeoDataImport.TextMorseConverter,
      },
      {
        name: "Text Binary Converter",
        slug: "text-binary-converter",
        icon: <MdOutlineCode />,
        desc: "Convert text to binary and back.",
        code: "TextBinaryConverter",
        seo: SeoDataImport.TextBinaryConverter,
      },
      {
        name: "Text Hex Converter",
        slug: "text-hex-converter",
        icon: <MdOutlineCode />,
        desc: "Convert text to hexadecimal and back.",
        code: "TextHexConverter",
        seo: SeoDataImport.TextHexConverter,
      },
      {
        name: "Text Markdown Editor",
        slug: "text-markdown-editor",
        icon: <MdOutlineEdit />,
        desc: "Edit and preview text in Markdown format.",
        code: "TextMarkdownEditor",
        seo: SeoDataImport.TextMarkdownEditor,
      },
      {
        name: "Text HTML Converter",
        slug: "text-html-converter",
        icon: <MdOutlineCode />,
        desc: "Convert plain text to HTML tags.",
        code: "TextHTMLConverter",
        seo: SeoDataImport.TextToHtmlConverter,
      },
      {
        name: "Text Lorem Ipsum Generator",
        slug: "text-lorem-ipsum-generator",
        icon: <MdOutlineCreate />,
        desc: "Generate custom-length Lorem Ipsum text.",
        code: "TextLoremIpsumGenerator",
        seo: SeoDataImport.TextLoremIpsumGenerator,
      },
      {
        name: "Text Camel Case Converter",
        slug: "text-camel-case-converter",
        icon: <MdOutlineTextFormat />,
        desc: "Convert text to camelCase or PascalCase.",
        code: "TextCamelCaseConverter",
        seo: SeoDataImport.TextCamelCaseConverter,
      },
      {
        name: "Text Snake Case Converter",
        slug: "text-snake-case-converter",
        icon: <MdOutlineTextFormat />,
        desc: "Convert text to snake_case format.",
        code: "TextSnakeCaseConverter",
        seo: SeoDataImport.TextSnakeCaseConverter,
      },
      {
        name: "Text Kebab Case Converter",
        slug: "text-kebab-case-converter",
        icon: <MdOutlineTextFormat />,
        desc: "Convert text to kebab-case format.",
        code: "TextKebabCaseConverter",
        seo: SeoDataImport.TextKebabCaseConverter,
      },
      {
        name: "Text Title Generator",
        slug: "text-title-generator",
        icon: <MdOutlineTitle />,
        desc: "Generate catchy titles from keywords.",
        code: "TextTitleGenerator",
        seo: SeoDataImport.TextTitleGenerator,
      },
      {
        name: "Text Slugifier",
        slug: "text-slugifier",
        icon: <MdOutlineLink />,
        desc: "Create URL-friendly slugs from text.",
        code: "TextSlugifier",
        seo: SeoDataImport.TextSlugifier,
      },
      {
        name: "Text Typographer",
        slug: "text-typographer",
        icon: <MdOutlineTextFields />,
        desc: "Enhance text with typographic symbols like smart quotes.",
        code: "TextTypographer",
        seo: SeoDataImport.TextTypographer,
      },
      {
        name: "Text Readability Scorer",
        slug: "text-readability-scorer",
        icon: <MdOutlineAssessment />,
        desc: "Score text readability using Flesch-Kincaid or similar metrics.",
        code: "TextReadabilityScorer",
        seo: SeoDataImport.TextReadabilityScorer,
      },
      {
        name: "Text Paraphraser",
        slug: "text-paraphraser",
        icon: <MdOutlineRepeat />,
        desc: "Rephrase text to avoid plagiarism or improve clarity.",
        code: "TextParaphraser",
        seo: SeoDataImport.TextParaphrase,
      },
    ],
  },
  {
    category: "Mix Generator Tools",
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
      {
        name: "Fake Data Generator",
        slug: "fake-data-generator",
        icon: <MdAutorenew />,
        desc: "Generate fake data for testing applications.",
        code: "FakeDataGenerator",
        seo: SeoDataImport.FakeDataGenerator,
      },
      {
        name: "Slug Generator",
        slug: "slug-generator",
        icon: <MdLink />,
        desc: "Generate URL-friendly slugs from text inputs.",
        code: "SlugGenerator",
        seo: SeoDataImport.SlugGenerator,
      },
      {
        name: "API Key Generator",
        slug: "api-key-generator",
        icon: <MdVpnKey />,
        desc: "Create secure API keys for development and authentication.",
        code: "APIKeyGenerator",
        seo: SeoDataImport.APIKeyGenerator,
      },
      {
        name: "Random Word Generator",
        slug: "random-word-generator",
        icon: <MdOutlineTextFields />,
        desc: "Produce random words for brainstorming or testing.",
        code: "RandomWordGenerator",
        seo: SeoDataImport.RandomWordGenerator,
      },
      {
        name: "Sentence Generator",
        slug: "sentence-generator",
        icon: <MdOutlineShortText />,
        desc: "Generate random sentences for content creation.",
        code: "SentenceGenerator",
        seo: SeoDataImport.SentenceGenerator,
      },
      {
        name: "Email Address Generator",
        slug: "email-address-generator",
        icon: <MdOutlineEmail />,
        desc: "Create fake email addresses for testing purposes.",
        code: "EmailAddressGenerator",
        seo: SeoDataImport.EmailAddressGenerator,
      },
      {
        name: "Username Generator",
        slug: "username-generator",
        icon: <MdPersonOutline />,
        desc: "Generate unique usernames for accounts or profiles.",
        code: "UsernameGenerator",
        seo: SeoDataImport.UsernameGenerator,
      },
      {
        name: "Token Generator",
        slug: "token-generator",
        icon: <MdSecurity />,
        desc: "Generate random tokens for authentication or sessions.",
        code: "TokenGenerator",
        seo: SeoDataImport.TokenGenerator,
      },
      {
        name: "CSS Gradient Generator",
        slug: "css-gradient-generator",
        icon: <MdGradient />,
        desc: "Create custom CSS gradient codes for web design.",
        code: "CSSGradientGenerator",
        seo: SeoDataImport.CSSGradientGenerator,
      },
      {
        name: "JSON Data Generator",
        slug: "json-data-generator",
        icon: <MdCode />,
        desc: "Generate random JSON data structures for testing.",
        code: "JSONDataGenerator",
        seo: SeoDataImport.JSONDataGenerator,
      },
      {
        name: "XML Data Generator",
        slug: "xml-data-generator",
        icon: <MdCode />,
        desc: "Produce random XML data for development purposes.",
        code: "XMLDataGenerator",
        seo: SeoDataImport.XMLDataGenerator,
      },
      {
        name: "Credit Card Number Generator",
        slug: "credit-card-number-generator",
        icon: <MdCreditCard />,
        desc: "Generate fake credit card numbers for testing.",
        code: "CreditCardNumberGenerator",
        seo: SeoDataImport.CreditCardNumberGenerator,
      },
      {
        name: "Phone Number Generator",
        slug: "phone-number-generator",
        icon: <MdOutlinePhone />,
        desc: "Create random phone numbers in various formats.",
        code: "PhoneNumberGenerator",
        seo: SeoDataImport.PhoneNumberGenerator,
      },
      {
        name: "OTP Generator",
        slug: "otp-generator",
        icon: <MdLockOutline />,
        desc: "Generate one-time passwords for security verification.",
        code: "OTPGenerator",
        seo: SeoDataImport.OTPGenerator,
      },
      {
        name: "GUID Generator",
        slug: "guid-generator",
        icon: <MdAutorenew />,
        desc: "Generate Globally Unique Identifiers for unique IDs.",
        code: "GUIDGenerator",
        seo: SeoDataImport.GUIDGenerator,
      },
      {
        name: "Random Date Generator",
        slug: "random-date-generator",
        icon: <MdOutlineCalendarToday />,
        desc: "Generate random dates within a specified range.",
        code: "RandomDateGenerator",
        seo: SeoDataImport.RandomDateGenerator,
      },
      {
        name: "MAC Address Generator",
        slug: "mac-address-generator",
        icon: <MdOutlineNetworkCheck />,
        desc: "Create random MAC addresses for networking tests.",
        code: "MACAddressGenerator",
        seo: SeoDataImport.MACAddressGenerator,
      },
      {
        name: "IP Address Generator",
        slug: "ip-address-generator",
        icon: <MdOutlineNetworkWifi />,
        desc: "Generate random IP addresses (IPv4 or IPv6).",
        code: "IPAddressGenerator",
        seo: SeoDataImport.IPAddressGenerator,
      },
      {
        name: "Random String Generator",
        slug: "random-string-generator",
        icon: <MdOutlineTextFields />,
        desc: "Produce random strings of specified length and charset.",
        code: "RandomStringGenerator",
        seo: SeoDataImport.RandomStringGenerator,
      },
      {
        name: "Coupon Code Generator",
        slug: "coupon-code-generator",
        icon: <MdOutlineLocalOffer />,
        desc: "Create unique coupon codes for promotions.",
        code: "CouponCodeGenerator",
        seo: SeoDataImport.CouponCodeGenerator,
      },
      {
        name: "File Name Generator",
        slug: "file-name-generator",
        icon: <MdOutlineInsertDriveFile />,
        desc: "Generate unique file names with custom extensions.",
        code: "FileNameGenerator",
        seo: SeoDataImport.FileNameGenerator,
      },
      {
        name: "Pattern Generator",
        slug: "pattern-generator",
        icon: <MdOutlineDesignServices />,
        desc: "Create repeating patterns for design or testing.",
        code: "PatternGenerator",
        seo: SeoDataImport.PatternGenerator,
      },
      {
        name: "Random Boolean Generator",
        slug: "random-boolean-generator",
        icon: <MdOutlineToggleOn />,
        desc: "Generate random true/false values.",
        code: "RandomBooleanGenerator",
        seo: SeoDataImport.RandomBooleanGenerator,
      },
      {
        name: "Meme Text Generator",
        slug: "meme-text-generator",
        icon: <MdOutlineImage />,
        desc: "Generate text for meme images with custom styles.",
        code: "MemeTextGenerator",
        seo: SeoDataImport.MemeTextGenerator,
      },
      {
        name: "Random Color Palette Generator",
        slug: "random-color-palette-generator",
        icon: <MdPalette />,
        desc: "Create random color palettes for design inspiration.",
        code: "RandomColorPaletteGenerator",
        seo: SeoDataImport.RandomColorPaletteGenerator,
      },
      {
        name: "SQL Query Generator",
        slug: "sql-query-generator",
        icon: <MdCode />,
        desc: "Generate basic SQL queries for database testing.",
        code: "SQLQueryGenerator",
        seo: SeoDataImport.SQLQueryGenerator,
      },
      {
        name: "Regex Generator",
        slug: "regex-generator",
        icon: <MdOutlineCode />,
        desc: "Create regular expressions based on input patterns.",
        code: "RegexGenerator",
        seo: SeoDataImport.RegexGenerator,
      },
      {
        name: "CSV Data Generator",
        slug: "csv-data-generator",
        icon: <MdOutlineTableChart />,
        desc: "Generate random CSV data for spreadsheets.",
        code: "CSVDataGenerator",
        seo: SeoDataImport.CSVDataGenerator,
      },
      {
        name: "Random Name Generator",
        slug: "random-name-generator",
        icon: <MdOutlinePerson />,
        desc: "Generate random names for characters or users.",
        code: "RandomNameGenerator",
        seo: SeoDataImport.RandomNameGenerator,
      },
      {
        name: "Title Generator",
        slug: "title-generator",
        icon: <MdOutlineTitle />,
        desc: "Create catchy titles for articles or projects.",
        code: "TitleGenerator",
        seo: SeoDataImport.TitleGenerator,
      },
      {
        name: "Random Address Generator",
        slug: "random-address-generator",
        icon: <MdOutlineLocationOn />,
        desc: "Generate fake addresses for testing forms.",
        code: "RandomAddressGenerator",
        seo: SeoDataImport.RandomAddressGenerator,
      },
      {
        name: "Random Time Generator",
        slug: "random-time-generator",
        icon: <MdOutlineAccessTime />,
        desc: "Generate random times in various formats.",
        code: "RandomTimeGenerator",
        seo: SeoDataImport.RandomTimeGenerator,
      },
      {
        name: "Captcha Generator",
        slug: "captcha-generator",
        icon: <MdOutlineVerified />,
        desc: "Create simple image or text captchas.",
        code: "CaptchaGenerator",
        seo: SeoDataImport.CaptchaGenerator,
      },
      {
        name: "Random List Generator",
        slug: "random-list-generator",
        icon: <MdOutlineList />,
        desc: "Generate random ordered or unordered lists.",
        code: "RandomListGenerator",
        seo: SeoDataImport.RandomListGenerator,
      },
      {
        name: "Hex Code Generator",
        slug: "hex-code-generator",
        icon: <MdOutlineCode />,
        desc: "Generate random hexadecimal values.",
        code: "HexCodeGenerator",
        seo: SeoDataImport.HexCodeGenerator,
      },
      {
        name: "Binary Code Generator",
        slug: "binary-code-generator",
        icon: <MdOutlineCode />,
        desc: "Generate binary code from text or numbers.",
        code: "BinaryCodeGenerator",
        seo: SeoDataImport.BinaryCodeGenerator,
      },
      {
        name: "ASCII Art Generator",
        slug: "ascii-art-generator",
        icon: <MdOutlineImage />,
        desc: "Create ASCII art from text or images.",
        code: "ASCIIArtGenerator",
        seo: SeoDataImport.ASCIIArtGenerator,
      },
      {
        name: "Random Quote Generator",
        slug: "random-quote-generator",
        icon: <MdOutlineFormatQuote />,
        desc: "Generate random quotes for inspiration.",
        code: "RandomQuoteGenerator",
        seo: SeoDataImport.RandomQuoteGenerator,
      },
      {
        name: "UUID v4 Generator",
        slug: "uuid-v4-generator",
        icon: <MdAutorenew />,
        desc: "Generate version 4 UUIDs with random components.",
        code: "UUIDv4Generator",
        seo: SeoDataImport.UUIDv4Generator,
      },
      {
        name: "Random PIN Generator",
        slug: "random-pin-generator",
        icon: <MdOutlineLock />,
        desc: "Generate random PIN codes of specified length.",
        code: "RandomPINGenerator",
        seo: SeoDataImport.RandomPINGenerator,
      },
      {
        name: "HTML Tag Generator",
        slug: "html-tag-generator",
        icon: <MdOutlineCode />,
        desc: "Generate HTML tags with custom attributes.",
        code: "HTMLTagGenerator",
        seo: SeoDataImport.HTMLTagGenerator,
      },
      {
        name: "Random Emoji Generator",
        slug: "random-emoji-generator",
        icon: <MdOutlineEmojiEmotions />,
        desc: "Generate random sets of emojis.",
        code: "RandomEmojiGenerator",
        seo: SeoDataImport.RandomEmojiGenerator,
      },
      {
        name: "JWT Generator",
        slug: "jwt-generator",
        icon: <MdSecurity />,
        desc: "Generate JSON Web Tokens for authentication.",
        code: "JWTGenerator",
        seo: SeoDataImport.JWTGenerator,
      },
      {
        name: "Random UUID Batch Generator",
        slug: "random-uuid-batch-generator",
        icon: <MdAutorenew />,
        desc: "Generate multiple UUIDs in a single batch.",
        code: "RandomUUIDBatchGenerator",
        seo: SeoDataImport.RandomUUIDBatchGenerator,
      },
      {
        name: "Random File Content Generator",
        slug: "random-file-content-generator",
        icon: <MdOutlineInsertDriveFile />,
        desc: "Generate random content for dummy files.",
        code: "RandomFileContentGenerator",
        seo: SeoDataImport.RandomFileContentGenerator,
      },
      {
        name: "Random Domain Generator",
        slug: "random-domain-generator",
        icon: <MdOutlineDomain />,
        desc: "Create random domain names with TLDs.",
        code: "RandomDomainGenerator",
        seo: SeoDataImport.RandomDomainGenerator,
      },
      {
        name: "Random ISBN Generator",
        slug: "random-isbn-generator",
        icon: <MdOutlineBook />,
        desc: "Generate random ISBN numbers for books.",
        code: "RandomISBNGenerator",
        seo: SeoDataImport.RandomISBNGenerator,
      },
      {
        name: "Random Sequence Generator",
        slug: "random-sequence-generator",
        icon: <MdOutlineRepeat />,
        desc: "Generate random sequences of numbers or letters.",
        code: "RandomSequenceGenerator",
        seo: SeoDataImport.RandomSequenceGenerator,
      },
      {
        name: "Random Barcode Batch Generator",
        slug: "random-barcode-batch-generator",
        icon: <LuScanBarcode />,
        desc: "Generate multiple barcodes in one go.",
        code: "RandomBarcodeBatchGenerator",
        seo: SeoDataImport.RandomBarcodeBatchGenerator,
      },
      {
        name: "Random Signature Generator",
        slug: "random-signature-generator",
        icon: <MdOutlineDraw />,
        desc: "Create random stylized signatures.",
        code: "RandomSignatureGenerator",
        seo: SeoDataImport.RandomSignatureGenerator,
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
      {
        name: "HTML Validator",
        slug: "html-validator",
        icon: <MdCode />,
        desc: "Validate HTML code for syntax and semantic errors.",
        code: "HTMLValidator",
        seo: SeoDataImport.HTMLValidator,
      },
      {
        name: "SQL Query Builder",
        slug: "sql-query-builder",
        icon: <MdStorage />,
        desc: "Generate and test SQL queries visually.",
        code: "SQLQueryBuilder",
        seo: SeoDataImport.SQLQueryBuilder,
      },
      // New 100 Developer Tools
      {
        name: "XML Formatter",
        slug: "xml-formatter",
        icon: <MdCode />,
        desc: "Beautify and structure XML data for readability.",
        code: "XMLFormatter",
        // seo: SeoDataImport.XMLFormatter
      },
      {
        name: "CSS Beautifier",
        slug: "css-beautifier",
        icon: <MdCode />,
        desc: "Format CSS code with proper indentation and spacing.",
        code: "CSSBeautifier",
        // seo: SeoDataImport.CSSBeautifier
      },
      {
        name: "JavaScript Obfuscator",
        slug: "javascript-obfuscator",
        icon: <MdSecurity />,
        desc: "Obfuscate JavaScript code to protect it from reverse engineering.",
        code: "JavaScriptObfuscator",
        // seo: SeoDataImport.JavaScriptObfuscator
      },
      {
        name: "Base64 Encoder",
        slug: "base64-encoder",
        icon: <MdLock />,
        desc: "Encode text or files into Base64 format.",
        code: "Base64Encoder",
        // seo: SeoDataImport.Base64Encoder
      },
      {
        name: "Base64 Decoder",
        slug: "base64-decoder",
        icon: <MdLockOpen />,
        desc: "Decode Base64 strings back to their original format.",
        code: "Base64Decoder",
        // seo: SeoDataImport.Base64Decoder
      },
      {
        name: "URL Encoder",
        slug: "url-encoder",
        icon: <MdLink />,
        desc: "Encode URLs for safe transmission over the web.",
        code: "URLEncoder",
        // seo: SeoDataImport.URLEncoder
      },
      {
        name: "URL Decoder",
        slug: "url-decoder",
        icon: <MdLink />,
        desc: "Decode URL-encoded strings to their original form.",
        code: "URLDecoder",
        // seo: SeoDataImport.URLDecoder
      },
      {
        name: "API Tester",
        slug: "api-tester",
        icon: <MdHttp />,
        desc: "Test API endpoints with custom requests and parameters.",
        code: "APITester",
        // seo: SeoDataImport.APITester
      },
      {
        name: "JWT Decoder",
        slug: "jwt-decoder",
        icon: <MdSecurity />,
        desc: "Decode JSON Web Tokens to view their payload.",
        code: "JWTDecoder",
        // seo: SeoDataImport.JWTDecoder
      },
      {
        name: "Hash Generator",
        slug: "hash-generator",
        icon: <MdFingerprint />,
        desc: "Generate hashes (MD5, SHA) from text or files.",
        code: "HashGenerator",
        // seo: SeoDataImport.HashGenerator
      },
      {
        name: "UUID Generator",
        slug: "uuid-generator",
        icon: <MdAutorenew />,
        desc: "Generate unique UUIDs for identifiers.",
        code: "UUIDGenerator",
        // seo: SeoDataImport.UUIDGenerator
      },
      {
        name: "Color Picker",
        slug: "color-picker",
        icon: <MdPalette />,
        desc: "Pick and convert colors between HEX, RGB, and HSL.",
        code: "ColorPicker",
        // seo: SeoDataImport.ColorPicker
      },
      {
        name: "Lorem Ipsum Generator",
        slug: "lorem-ipsum-generator",
        icon: <MdTextFields />,
        desc: "Generate placeholder text for mockups and testing.",
        code: "LoremIpsumGenerator",
        // seo: SeoDataImport.LoremIpsumGenerator
      },
      {
        name: "Code Snippet Generator",
        slug: "code-snippet-generator",
        icon: <MdCode />,
        desc: "Create reusable code snippets in multiple languages.",
        code: "CodeSnippetGenerator",
        // seo: SeoDataImport.CodeSnippetGenerator
      },
      {
        name: "Git Command Helper",
        slug: "git-command-helper",
        icon: <MdTerminal />,
        desc: "Generate common Git commands with explanations.",
        code: "GitCommandHelper",
        // seo: SeoDataImport.GitCommandHelper
      },
      {
        name: "CRON Expression Builder",
        slug: "cron-expression-builder",
        icon: <MdSchedule />,
        desc: "Build and test CRON expressions for scheduling tasks.",
        code: "CRONExpressionBuilder",
        // seo: SeoDataImport.CRONExpressionBuilder
      },
      {
        name: "HTTP Status Code Checker",
        slug: "http-status-code-checker",
        icon: <MdHttp />,
        desc: "Look up and explain HTTP status codes.",
        code: "HTTPStatusCodeChecker",
        // seo: SeoDataImport.HTTPStatusCodeChecker
      },
      {
        name: "CSS Gradient Generator",
        slug: "css-gradient-generator",
        icon: <MdGradient />,
        desc: "Create custom CSS gradients with previews.",
        code: "CSSGradientGenerator",
        // seo: SeoDataImport.CSSGradientGenerator
      },
      {
        name: "GraphQL Schema Generator",
        slug: "graphql-schema-generator",
        icon: <MdDataObject />,
        desc: "Generate sample GraphQL schemas and mock data.",
        code: "GraphQLSchemaGenerator",
        seo: SeoDataImport.GraphQLSchemaGenerator,
      },
      {

        name: "JSON Validator",
        slug: "json-validator",
        icon: <MdCode />,
        desc: "Validate JSON syntax and structure.",
        code: "JSONValidator",
        // seo: SeoDataImport.JSONValidator
      },
      {
        name: "XML Validator",
        slug: "xml-validator",
        icon: <MdCode />,
        desc: "Check XML documents for syntax errors.",
        code: "XMLValidator",
        // seo: SeoDataImport.XMLValidator
      },
      {
        name: "Password Generator",
        slug: "password-generator",
        icon: <MdSecurity />,
        desc: "Generate strong, random passwords with custom rules.",
        code: "PasswordGenerator",
        // seo: SeoDataImport.PasswordGenerator
      },
      {
        name: "Timestamp Converter",
        slug: "timestamp-converter",
        icon: <MdAccessTime />,
        desc: "Convert timestamps to human-readable dates and vice versa.",
        code: "TimestampConverter",
        // seo: SeoDataImport.TimestampConverter
      },
      {
        name: "Environment Variable Editor",
        slug: "environment-variable-editor",
        icon: <MdSettings />,
        desc: "Create and manage environment variable files.",
        code: "EnvironmentVariableEditor",
        // seo: SeoDataImport.EnvironmentVariableEditor
      },
      {
        name: "Unit Test Generator",
        slug: "unit-test-generator",
        icon: <MdBugReport />,
        desc: "Generate unit test templates for various languages.",
        code: "UnitTestGenerator",
        // seo: SeoDataImport.UnitTestGenerator
      },
      {
        name: "Dockerfile Generator",
        slug: "dockerfile-generator",
        icon: <MdBuild />,
        desc: "Create Dockerfiles with customizable options.",
        code: "DockerfileGenerator",
        // seo: SeoDataImport.DockerfileGenerator
      },
      {
        name: "IP Address Validator",
        slug: "ip-address-validator",
        icon: <MdNetworkCheck />,
        desc: "Validate IPv4 and IPv6 addresses.",
        code: "IPAddressValidator",
        // seo: SeoDataImport.IPAddressValidator
      },
      {
        name: "Random Data Generator",
        slug: "random-data-generator",
        icon: <MdAutorenew />,
        desc: "Generate fake data for testing APIs or databases.",
        code: "RandomDataGenerator",
        // seo: SeoDataImport.RandomDataGenerator
      },
      {
        name: "Binary Converter",
        slug: "binary-converter",
        icon: <MdCode />,
        desc: "Convert text or numbers to binary and back.",
        code: "BinaryConverter",
        // seo: SeoDataImport.BinaryConverter
      },
      {
        name: "Hex Converter",
        slug: "hex-converter",
        icon: <MdCode />,
        desc: "Convert data to hexadecimal format and vice versa.",
        code: "HexConverter",
        // seo: SeoDataImport.HexConverter
      },
      {
        name: "ASCII Converter",
        slug: "ascii-converter",
        icon: <MdCode />,
        desc: "Convert text to ASCII codes and back.",
        code: "ASCIIConverter",
        // seo: SeoDataImport.ASCIIConverter
      },
      {
        name: "Morse Code Translator",
        slug: "morse-code-translator",
        icon: <MdCode />,
        desc: "Translate text to Morse code and vice versa.",
        code: "MorseCodeTranslator",
        // seo: SeoDataImport.MorseCodeTranslator
      },
      {
        name: "CSS Selector Tester",
        slug: "css-selector-tester",
        icon: <MdCode />,
        desc: "Test CSS selectors against sample HTML.",
        code: "CSSSelectorTester",
        // seo: SeoDataImport.CSSSelectorTester
      },
      {
        name: "JSON to CSV Converter",
        slug: "json-to-csv-converter",
        icon: <MdTableChart />,
        desc: "Convert JSON data to CSV format.",
        code: "JsonToCsv",
        // seo: SeoDataImport.JSONToCSVConverter
      },
      {
        name: "CSV to JSON Converter",
        slug: "csv-to-json-converter",
        icon: <MdTableChart />,
        desc: "Transform CSV data into JSON format.",
        code: "CsvToJson",
        // seo: SeoDataImport.CSVToJSONConverter
      },
      {
        name: "QR Code Generator",
        slug: "qr-code-generator",
        icon: <MdQrCode2 />,
        desc: "Generate QR codes for URLs, text, or data.",
        code: "QRCodeGenerator",
        // seo: SeoDataImport.QRCodeGenerator
      },
      {
        name: "Barcode Generator",
        slug: "barcode-generator",
        icon: <MdCode />,
        desc: "Create barcodes for various formats.",
        code: "BarcodeGenerator",
        // seo: SeoDataImport.BarcodeGenerator
      },
      {
        name: "Slug Generator",
        slug: "slug-generator",
        icon: <MdLink />,
        desc: "Generate URL-friendly slugs from text.",
        code: "SlugGenerator",
        // seo: SeoDataImport.SlugGenerator
      },
      {
        name: "Diff Viewer",
        slug: "diff-viewer",
        icon: <MdCompare />,
        desc: "Compare two code snippets and highlight differences.",
        code: "DiffViewer",
        // seo: SeoDataImport.DiffViewer
      },
      {
        name: "Code Linter",
        slug: "code-linter",
        icon: <MdBugReport />,
        desc: "Check code for syntax and style issues.",
        code: "CodeLinter",
        // seo: SeoDataImport.CodeLinter
      },
      {
        name: "YAML Formatter",
        slug: "yaml-formatter",
        icon: <MdCode />,
        desc: "Format and validate YAML configuration files.",
        code: "YAMLFormatter",
        // seo: SeoDataImport.YAMLFormatter
      },
      {
        name: "JSON to YAML Converter",
        slug: "json-to-yaml-converter",
        icon: <MdCode />,
        desc: "Convert JSON data to YAML format.",
        code: "JSONToYAMLConverter",
        // seo: SeoDataImport.JSONToYAMLConverter
      },
      {
        name: "YAML to JSON Converter",
        slug: "yaml-to-json-converter",
        icon: <MdCode />,
        desc: "Transform YAML data into JSON format.",
        code: "YAMLToJSONConverter",
        // seo: SeoDataImport.YAMLToJSONConverter
      },
      {
        name: "HTTP Request Generator",
        slug: "http-request-generator",
        icon: <MdHttp />,
        desc: "Generate HTTP requests for testing APIs.",
        code: "HTTPRequestGenerator",
        // seo: SeoDataImport.HTTPRequestGenerator
      },
      {
        name: "SSL Certificate Checker",
        slug: "ssl-certificate-checker",
        icon: <MdSecurity />,
        desc: "Verify SSL certificates for domains.",
        code: "SSLCertificateChecker",
        // seo: SeoDataImport.SSLCertificateChecker
      },
      {
        name: "Port Scanner",
        slug: "port-scanner",
        icon: <MdNetworkCheck />,
        desc: "Scan open ports on a given host.",
        code: "PortScanner",
        // seo: SeoDataImport.PortScanner
      },
      {
        name: "DNS Lookup Tool",
        slug: "dns-lookup-tool",
        icon: <MdDns />,
        desc: "Perform DNS lookups for domain details.",
        code: "DNSLookupTool",
        // seo: SeoDataImport.DNSLookupTool
      },
      {
        name: "Whois Lookup",
        slug: "whois-lookup",
        icon: <MdInfoOutline />,
        desc: "Retrieve WHOIS information for domains.",
        code: "WhoisLookup",
        // seo: SeoDataImport.WhoisLookup
      },
      {
        name: "robots.txt Generator",
        slug: "robots-txt-generator",
        icon: <MdCode />,
        desc: "Create robots.txt files for websites.",
        code: "RobotsTxtGenerator",
        // seo: SeoDataImport.RobotsTxtGenerator
      },
      {
        name: "Sitemap Generator",
        slug: "sitemap-generator",
        icon: <MdMap />,
        desc: "Generate XML sitemaps for SEO purposes.",
        code: "SitemapGenerator",
        // seo: SeoDataImport.SitemapGenerator
      },
      {
        name: "RSS Feed Generator",
        slug: "rss-feed-generator",
        icon: <MdDataObject />,
        desc: "Generate RSS feed XML data for content syndication.",
        code: "RSSFeedGenerator",
        seo: SeoDataImport.RSSFeedGenerator,
      },
      {
        name: "REST Client",
        slug: "rest-client",
        icon: <MdHttp />,
        desc: "Test RESTful APIs with a simple interface.",
        code: "RESTClient",
        // seo: SeoDataImport.RESTClient
      },
      {
        name: "GraphQL Query Tester",
        slug: "graphql-query-tester",
        icon: <MdCode />,
        desc: "Test GraphQL queries and mutations.",
        code: "GraphQLQueryTester",
        // seo: SeoDataImport.GraphQLQueryTester
      },
      {
        name: "JSON Schema Generator",
        slug: "json-schema-generator",
        icon: <MdCode />,
        desc: "Generate JSON schemas from sample data.",
        code: "JSONSchemaGenerator",
        // seo: SeoDataImport.JSONSchemaGenerator
      },
      {
        name: "Fake Data Generator",
        slug: "fake-data-generator",
        icon: <MdAutorenew />,
        desc: "Generate mock data for testing applications.",
        code: "FakeDataGenerator",
        // seo: SeoDataImport.FakeDataGenerator
      },
      {
        name: "Code Profiler",
        slug: "code-profiler",
        icon: <MdSpeed />,
        desc: "Analyze code performance and bottlenecks.",
        code: "CodeProfiler",
        // seo: SeoDataImport.CodeProfiler
      },
      {
        name: "Environment Config Generator",
        slug: "environment-config-generator",
        icon: <MdSettings />,
        desc: "Generate config files for different environments.",
        code: "EnvironmentConfigGenerator",
        // seo: SeoDataImport.EnvironmentConfigGenerator
      },
      {
        name: "API Mock Server",
        slug: "api-mock-server",
        icon: <MdHttp />,
        desc: "Create mock API responses for testing.",
        code: "APIMockServer",
        // seo: SeoDataImport.APIMockServer
      },
      {
        name: "Unicode Converter",
        slug: "unicode-converter",
        icon: <MdCode />,
        desc: "Convert text to Unicode and back.",
        code: "UnicodeConverter",
        // seo: SeoDataImport.UnicodeConverter
      },
      {
        name: "Byte Size Converter",
        slug: "byte-size-converter",
        icon: <MdStorage />,
        desc: "Convert between bytes, KB, MB, GB, and more.",
        code: "ByteSizeConverter",
        // seo: SeoDataImport.ByteSizeConverter
      },
      {
        name: "Regex Generator",
        slug: "regex-generator",
        icon: <MdCode />,
        desc: "Generate regular expressions from patterns.",
        code: "RegexGenerator",
        // seo: SeoDataImport.RegexGenerator
      },
      {
        name: "HTML Entity Encoder",
        slug: "html-entity-encoder",
        icon: <MdCode />,
        desc: "Encode special characters into HTML entities.",
        code: "HTMLEntityEncoder",
        // seo: SeoDataImport.HTMLEntityEncoder
      },
      {
        name: "HTML Entity Decoder",
        slug: "html-entity-decoder",
        icon: <MdCode />,
        desc: "Decode HTML entities back to characters.",
        code: "HTMLEntityDecoder",
        // seo: SeoDataImport.HTMLEntityDecoder
      },
      {
        name: "CURL Command Generator",
        slug: "curl-command-generator",
        icon: <MdTerminal />,
        desc: "Generate CURL commands for API requests.",
        code: "CURLCommandGenerator",
        // seo: SeoDataImport.CURLCommandGenerator
      },
      {
        name: "ASCII Art Generator",
        slug: "ascii-art-generator",
        icon: <MdImage />,
        desc: "Generate ASCII art from text or images.",
        code: "ASCIIArtGenerator",
        // seo: SeoDataImport.ASCIIArtGenerator
      },
      {
        name: "Code Comment Generator",
        slug: "code-comment-generator",
        icon: <MdCode />,
        desc: "Generate documentation comments for code.",
        code: "CodeCommentGenerator",
        // seo: SeoDataImport.CodeCommentGenerator
      },
      {
        name: "File Hash Checker",
        slug: "file-hash-checker",
        icon: <MdFingerprint />,
        desc: "Compute and verify file hashes (MD5, SHA).",
        code: "FileHashChecker",
        // seo: SeoDataImport.FileHashChecker
      },
      {
        name: "GUID Generator",
        slug: "guid-generator",
        icon: <MdAutorenew />,
        desc: "Generate Globally Unique Identifiers.",
        code: "GUIDGenerator",
        // seo: SeoDataImport.GUIDGenerator
      },
      {
        name: "Random String Generator",
        slug: "random-string-generator",
        icon: <MdTextFields />,
        desc: "Generate random strings with custom parameters.",
        code: "RandomStringGenerator",
        // seo: SeoDataImport.RandomStringGenerator
      },
      {
        name: "Token Generator",
        slug: "token-generator",
        icon: <MdSecurity />,
        desc: "Create random tokens for authentication.",
        code: "TokenGenerator",
        // seo: SeoDataImport.TokenGenerator
      },
      {
        name: "SQL Injection Tester",
        slug: "sql-injection-tester",
        icon: <MdBugReport />,
        desc: "Test SQL queries for injection vulnerabilities.",
        code: "SQLInjectionTester",
        // seo: SeoDataImport.SQLInjectionTester
      },
      {
        name: "XSS Tester",
        slug: "xss-tester",
        icon: <MdBugReport />,
        desc: "Check code for cross-site scripting vulnerabilities.",
        code: "XSSTester",
        // seo: SeoDataImport.XSSTester
      },
      {
        name: "Code Complexity Analyzer",
        slug: "code-complexity-analyzer",
        icon: <MdSpeed />,
        desc: "Measure cyclomatic complexity of code.",
        code: "CodeComplexityAnalyzer",
        // seo: SeoDataImport.CodeComplexityAnalyzer
      },
      {
        name: "Dependency Graph Visualizer",
        slug: "dependency-graph-visualizer",
        icon: <MdAccountTree />,
        desc: "Visualize project dependency graphs.",
        code: "DependencyGraphVisualizer",
        // seo: SeoDataImport.DependencyGraphVisualizer
      },
      {
        name: "CLI Command Builder",
        slug: "cli-command-builder",
        icon: <MdTerminal />,
        desc: "Build command-line interface commands visually.",
        code: "CLICommandBuilder",
        // seo: SeoDataImport.CLICommandBuilder
      },
      {
        name: "JSON Path Tester",
        slug: "json-path-tester",
        icon: <MdCode />,
        desc: "Test JSON Path expressions against JSON data.",
        code: "JSONPathTester",
        // seo: SeoDataImport.JSONPathTester
      },
      {
        name: "CSV Validator",
        slug: "csv-validator",
        icon: <MdTableChart />,
        desc: "Validate CSV files for structure and data integrity.",
        code: "CSVValidator",
        // seo: SeoDataImport.CSVValidator
      },
      {
        name: "Code Coverage Analyzer",
        slug: "code-coverage-analyzer",
        icon: <MdAssessment />,
        desc: "Analyze code coverage for unit tests.",
        code: "CodeCoverageAnalyzer",
        // seo: SeoDataImport.CodeCoverageAnalyzer
      },
      {
        name: "API Documentation Generator",
        slug: "api-documentation-generator",
        icon: <MdDescription />,
        desc: "Generate API docs from code or specs.",
        code: "APIDocumentationGenerator",
        // seo: SeoDataImport.APIDocumentationGenerator
      },
      {
        name: "Regex Visualizer",
        slug: "regex-visualizer",
        icon: <MdCode />,
        desc: "Visualize regular expressions as diagrams.",
        code: "RegexVisualizer",
        // seo: SeoDataImport.RegexVisualizer
      },
      {
        name: "HTTP Header Analyzer",
        slug: "http-header-analyzer",
        icon: <MdHttp />,
        desc: "Analyze HTTP headers from responses.",
        code: "HTTPHeaderAnalyzer",
        // seo: SeoDataImport.HTTPHeaderAnalyzer
      },
      {
        name: "CSS Specificity Checker",
        slug: "css-specificity-checker",
        icon: <MdCode />,
        desc: "Calculate CSS selector specificity.",
        code: "CSSSpecificityChecker",
        // seo: SeoDataImport.CSSSpecificityChecker
      },
      {
        name: "JSON Minifier",
        slug: "json-minifier",
        icon: <MdCode />,
        desc: "Minify JSON data to reduce size.",
        code: "JSONMinifier",
        // seo: SeoDataImport.JSONMinifier
      },
      {
        name: "SSL/TLS Config Generator",
        slug: "ssl-tls-config-generator",
        icon: <MdSecurity />,
        desc: "Generate secure SSL/TLS configurations.",
        code: "SSLTLSConfigGenerator",
        // seo: SeoDataImport.SSLTLSConfigGenerator
      },
      {
        name: "Random IP Generator",
        slug: "random-ip-generator",
        icon: <MdNetworkCheck />,
        desc: "Generate random IP addresses for testing.",
        code: "RandomIPGenerator",
        // seo: SeoDataImport.RandomIPGenerator
      },
      {
        name: "Code Refactor Suggestor",
        slug: "code-refactor-suggestor",
        icon: <MdBuild />,
        desc: "Suggest improvements for refactoring code.",
        code: "CodeRefactorSuggestor",
        // seo: SeoDataImport.CodeRefactorSuggestor
      },
      {
        name: "HTTP Method Tester",
        slug: "http-method-tester",
        icon: <MdHttp />,
        desc: "Test different HTTP methods on endpoints.",
        code: "HTTPMethodTester",
        // seo: SeoDataImport.HTTPMethodTester
      },
      {
        name: "Database Schema Visualizer",
        slug: "database-schema-visualizer",
        icon: <MdStorage />,
        desc: "Visualize database schemas as diagrams.",
        code: "DatabaseSchemaVisualizer",
        // seo: SeoDataImport.DatabaseSchemaVisualizer
      },
      {
        name: "Package Lock Analyzer",
        slug: "package-lock-analyzer",
        icon: <MdBuild />,
        desc: "Analyze package-lock.json for dependencies.",
        code: "PackageLockAnalyzer",
        // seo: SeoDataImport.PackageLockAnalyzer
      },
      {
        name: "Code Syntax Highlighter",
        slug: "code-syntax-highlighter",
        icon: <MdCode />,
        desc: "Highlight syntax for multiple programming languages.",
        code: "CodeSyntaxHighlighter",
        // seo: SeoDataImport.CodeSyntaxHighlighter
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
        seo: SeoDataImport.ImageResizer,
      },
      {
        name: "Image Converter",
        slug: "image-converter",
        icon: <MdTransform />,
        desc: "Convert images between different formats such as JPG, PNG, and WebP.",
        code: "ImageConverter",
        seo: SeoDataImport.ImageConverter,
      },
      {
        name: "Image Compressor",
        slug: "image-compressor",
        icon: <MdImage />,
        desc: "Compress images to reduce file size without losing quality.",
        code: "ImageCompressor",
        seo: SeoDataImport.ImageCompressor,
      },
      {
        name: "Image Cropper",
        slug: "image-cropper",
        icon: <MdImage />,
        desc: "Crop images to specific dimensions or aspect ratios.",
        code: "ImageCropper",
        seo: SeoDataImport.ImageCropper,
      },
      {
        name: "Image Enhancer",
        slug: "image-enhancer",
        icon: <MdImage />,
        desc: "Enhance image quality with AI-powered adjustments.",
        code: "ImageEnhancer",
        seo: SeoDataImport.ImageEnhancer,
      },
      {
        name: "Image Watermarker",
        slug: "image-watermarker",
        icon: <MdImage />,
        desc: "Add text or image watermarks to protect your images.",
        code: "ImageWatermarker",
        seo: SeoDataImport.ImageWatermarker,
      },
      {
        name: "Image Background Remover",
        slug: "image-background-remover",
        icon: <MdImage />,
        desc: "Remove the background of images using AI for a transparent look.",
        code: "ImageBackgroundRemover",
        seo: SeoDataImport.ImageBackgroundRemover,
      },
      {
        name: "Image Collage Maker",
        slug: "image-collage-maker",
        icon: <MdImage />,
        desc: "Combine multiple images into beautiful collages.",
        code: "ImageCollageMaker",
        seo: SeoDataImport.ImageCollageMaker,
      },
      {
        name: "Image Color Adjuster",
        slug: "image-color-adjuster",
        icon: <MdImage />,
        desc: "Fine-tune colors, brightness, and contrast for perfect images.",
        code: "ImageColorAdjuster",
        seo: SeoDataImport.ImageColorAdjuster,
      },
      // New 50 Image Tools
      {
        name: "Image Rotator",
        slug: "image-rotator",
        icon: <MdRotateRight />,
        desc: "Rotate images by any angle with precision.",
        code: "ImageRotator",
        // seo: SeoDataImport.ImageRotator
      },
      {
        name: "Image Flipper",
        slug: "image-flipper",
        icon: <MdFlip />,
        desc: "Flip images horizontally or vertically.",
        code: "ImageFlipper",
        // seo: SeoDataImport.ImageFlipper
      },
      {
        name: "Image Grayscale Converter",
        slug: "image-grayscale-converter",
        icon: <MdFilterBAndW />,
        desc: "Convert images to grayscale for a classic look.",
        code: "ImageGrayscaleConverter",
        // seo: SeoDataImport.ImageGrayscaleConverter
      },
      {
        name: "Image Sepia Converter",
        slug: "image-sepia-converter",
        icon: <MdFilterVintage />,
        desc: "Apply a sepia tone to images for a vintage effect.",
        code: "ImageSepiaConverter",
        // seo: SeoDataImport.ImageSepiaConverter
      },
      {
        name: "Image Blur Tool",
        slug: "image-blur-tool",
        icon: <MdBlurOn />,
        desc: "Apply blur effects to specific areas or entire images.",
        code: "ImageBlurTool",
        // seo: SeoDataImport.ImageBlurTool
      },
      {
        name: "Image Sharpener",
        slug: "image-sharpener",
        icon: <MdImage />,
        desc: "Sharpen images to enhance details and clarity.",
        code: "ImageSharpener",
        // seo: SeoDataImport.ImageSharpener
      },
      {
        name: "Image Noise Reducer",
        slug: "image-noise-reducer",
        icon: <MdImage />,
        desc: "Reduce noise in images for cleaner visuals.",
        code: "ImageNoiseReducer",
        // seo: SeoDataImport.ImageNoiseReducer
      },
      {
        name: "Image Filter Applicator",
        slug: "image-filter-applicator",
        icon: <MdFilter />,
        desc: "Apply Instagram-like filters to your images.",
        code: "ImageFilterApplicator",
        // seo: SeoDataImport.ImageFilterApplicator
      },
      {
        name: "Image Brightness Adjuster",
        slug: "image-brightness-adjuster",
        icon: <MdBrightness5 />,
        desc: "Adjust the brightness level of your images.",
        code: "ImageBrightnessAdjuster",
        // seo: SeoDataImport.ImageBrightnessAdjuster
      },
      {
        name: "Image Contrast Adjuster",
        slug: "image-contrast-adjuster",
        icon: <MdContrast />,
        desc: "Modify the contrast of images for better visuals.",
        code: "ImageContrastAdjuster",
        // seo: SeoDataImport.ImageContrastAdjuster
      },
      {
        name: "Image Saturation Adjuster",
        slug: "image-saturation-adjuster",
        icon: <MdImage />,
        desc: "Tune the saturation of colors in your images.",
        code: "ImageSaturationAdjuster",
        // seo: SeoDataImport.ImageSaturationAdjuster
      },
      {
        name: "Image Hue Adjuster",
        slug: "image-hue-adjuster",
        icon: <MdImage />,
        desc: "Shift the hue of images for creative effects.",
        code: "ImageHueAdjuster",
        // seo: SeoDataImport.ImageHueAdjuster
      },
      {
        name: "Image Text Overlay",
        slug: "image-text-overlay",
        icon: <MdTextFields />,
        desc: "Add custom text overlays to your images.",
        code: "ImageTextOverlay",
        // seo: SeoDataImport.ImageTextOverlay
      },
      {
        name: "Image Meme Generator",
        slug: "image-meme-generator",
        icon: <MdImage />,
        desc: "Create memes by adding text to images.",
        code: "ImageMemeGenerator",
        // seo: SeoDataImport.ImageMemeGenerator
      },
      {
        name: "Image Border Adder",
        slug: "image-border-adder",
        icon: <MdBorderStyle />,
        desc: "Add customizable borders around your images.",
        code: "ImageBorderAdder",
        // seo: SeoDataImport.ImageBorderAdder
      },
      {
        name: "Image Shadow Creator",
        slug: "image-shadow-creator",
        icon: <MdImage />,
        desc: "Add drop shadows to images for a 3D effect.",
        code: "ImageShadowCreator",
        // seo: SeoDataImport.ImageShadowCreator
      },
      {
        name: "Image Transparency Adjuster",
        slug: "image-transparency-adjuster",
        icon: <MdImage />,
        desc: "Adjust the transparency level of your images.",
        code: "ImageTransparencyAdjuster",
        // seo: SeoDataImport.ImageTransparencyAdjuster
      },
      {
        name: "Image Pixelator",
        slug: "image-pixelator",
        icon: <MdImage />,
        desc: "Pixelate images for a retro or artistic look.",
        code: "ImagePixelator",
        // seo: SeoDataImport.ImagePixelator
      },
      {
        name: "Image Mosaic Maker",
        slug: "image-mosaic-maker",
        icon: <MdImage />,
        desc: "Create mosaics from multiple smaller images.",
        code: "ImageMosaicMaker",
        // seo: SeoDataImport.ImageMosaicMaker
      },
      {
        name: "Image Flipbook Creator",
        slug: "image-flipbook-creator",
        icon: <MdImage />,
        desc: "Turn a series of images into a flipbook animation.",
        code: "ImageFlipbookCreator",
        // seo: SeoDataImport.ImageFlipbookCreator
      },
      {
        name: "Image Metadata Editor",
        slug: "image-metadata-editor",
        icon: <MdInfoOutline />,
        desc: "Edit or remove metadata (EXIF) from images.",
        code: "ImageMetadataEditor",
        // seo: SeoDataImport.ImageMetadataEditor
      },
      {
        name: "Image EXIF Viewer",
        slug: "image-exif-viewer",
        icon: <MdInfoOutline />,
        desc: "View EXIF metadata embedded in images.",
        code: "ImageEXIFViewer",
        // seo: SeoDataImport.ImageEXIFViewer
      },
      {
        name: "Image Histogram Viewer",
        slug: "image-histogram-viewer",
        icon: <MdAssessment />,
        desc: "Display color histograms for image analysis.",
        code: "ImageHistogramViewer",
        // seo: SeoDataImport.ImageHistogramViewer
      },
      {
        name: "Image Palette Extractor",
        slug: "image-palette-extractor",
        icon: <MdPalette />,
        desc: "Extract dominant colors from an image as a palette.",
        code: "ImagePaletteExtractor",
        // seo: SeoDataImport.ImagePaletteExtractor
      },
      {
        name: "Image Thumbnail Generator",
        slug: "image-thumbnail-generator",
        icon: <MdImage />,
        desc: "Generate thumbnails from larger images.",
        code: "ImageThumbnailGenerator",
        // seo: SeoDataImport.ImageThumbnailGenerator
      },
      {
        name: "Image Batch Processor",
        slug: "image-batch-processor",
        icon: <MdImage />,
        desc: "Process multiple images at once (resize, convert, etc.).",
        code: "ImageBatchProcessor",
        // seo: SeoDataImport.ImageBatchProcessor
      },
      {
        name: "Image Noise Generator",
        slug: "image-noise-generator",
        icon: <MdImage />,
        desc: "Add noise effects to images for artistic purposes.",
        code: "ImageNoiseGenerator",
        // seo: SeoDataImport.ImageNoiseGenerator
      },
      {
        name: "Image Vignette Tool",
        slug: "image-vignette-tool",
        icon: <MdImage />,
        desc: "Apply vignette effects to darken image edges.",
        code: "ImageVignetteTool",
        // seo: SeoDataImport.ImageVignetteTool
      },
      {
        name: "Image Tilt-Shift Tool",
        slug: "image-tilt-shift-tool",
        icon: <MdImage />,
        desc: "Create a tilt-shift effect for a miniature look.",
        code: "ImageTiltShiftTool",
        // seo: SeoDataImport.ImageTiltShiftTool
      },
      {
        name: "Image Perspective Adjuster",
        slug: "image-perspective-adjuster",
        icon: <MdImage />,
        desc: "Adjust the perspective of images for correction or effect.",
        code: "ImagePerspectiveAdjuster",
        // seo: SeoDataImport.ImagePerspectiveAdjuster
      },
      {
        name: "Image Distortion Tool",
        slug: "image-distortion-tool",
        icon: <MdImage />,
        desc: "Distort images with warp or twist effects.",
        code: "ImageDistortionTool",
        // seo: SeoDataImport.ImageDistortionTool
      },
      {
        name: "Image Overlay Tool",
        slug: "image-overlay-tool",
        icon: <MdLayers />,
        desc: "Overlay one image onto another with blending options.",
        code: "ImageOverlayTool",
        // seo: SeoDataImport.ImageOverlayTool
      },
      {
        name: "Image Frame Adder",
        slug: "image-frame-adder",
        icon: <MdImage />,
        desc: "Add decorative frames to your images.",
        code: "ImageFrameAdder",
        // seo: SeoDataImport.ImageFrameAdder
      },
      {
        name: "Image ASCII Converter",
        slug: "image-ascii-converter",
        icon: <MdImage />,
        desc: "Convert images into ASCII art.",
        code: "ImageASCIIConverter",
        // seo: SeoDataImport.ImageASCIIConverter
      },
      {
        name: "Image QR Code Generator",
        slug: "image-qr-code-generator",
        icon: <MdQrCode2 />,
        desc: "Generate QR codes embedded within images.",
        code: "ImageQRCodeGenerator",
        // seo: SeoDataImport.ImageQRCodeGenerator
      },
      {
        name: "Image Barcode Generator",
        slug: "image-barcode-generator",
        icon: <MdImage />,
        desc: "Create barcodes as image outputs.",
        code: "ImageBarcodeGenerator",
        // seo: SeoDataImport.ImageBarcodeGenerator
      },
      {
        name: "Image Sketch Converter",
        slug: "image-sketch-converter",
        icon: <MdImage />,
        desc: "Turn images into pencil sketch-style drawings.",
        code: "ImageSketchConverter",
        // seo: SeoDataImport.ImageSketchConverter
      },
      {
        name: "Image Cartoonizer",
        slug: "image-cartoonizer",
        icon: <MdImage />,
        desc: "Convert images into cartoon-style artwork.",
        code: "ImageCartoonizer",
        // seo: SeoDataImport.ImageCartoonizer
      },
      {
        name: "Image Oil Painting Converter",
        slug: "image-oil-painting-converter",
        icon: <MdImage />,
        desc: "Transform images into oil painting-style visuals.",
        code: "ImageOilPaintingConverter",
        // seo: SeoDataImport.ImageOilPaintingConverter
      },
      {
        name: "Image Watercolor Converter",
        slug: "image-watercolor-converter",
        icon: <MdImage />,
        desc: "Apply a watercolor effect to your images.",
        code: "ImageWatercolorConverter",
        // seo: SeoDataImport.ImageWatercolorConverter
      },
      {
        name: "Image Negative Converter",
        slug: "image-negative-converter",
        icon: <MdImage />,
        desc: "Invert colors to create a negative image effect.",
        code: "ImageNegativeConverter",
        // seo: SeoDataImport.ImageNegativeConverter
      },
      {
        name: "Image Edge Detector",
        slug: "image-edge-detector",
        icon: <MdImage />,
        desc: "Highlight edges in images for analysis or effect.",
        code: "ImageEdgeDetector",
        // seo: SeoDataImport.ImageEdgeDetector
      },
      {
        name: "Image Color Picker",
        slug: "image-color-picker",
        icon: <MdPalette />,
        desc: "Pick colors from any part of an image.",
        code: "ImageColorPicker",
        // seo: SeoDataImport.ImageColorPicker
      },
      {
        name: "Image Resolution Enhancer",
        slug: "image-resolution-enhancer",
        icon: <MdImage />,
        desc: "Increase image resolution using AI upscaling.",
        code: "ImageResolutionEnhancer",
        // seo: SeoDataImport.ImageResolutionEnhancer
      },
      {
        name: "Image Orientation Fixer",
        slug: "image-orientation-fixer",
        icon: <MdImage />,
        desc: "Correct image orientation based on metadata.",
        code: "ImageOrientationFixer",
        // seo: SeoDataImport.ImageOrientationFixer
      },
      {
        name: "Image Comparison Tool",
        slug: "image-comparison-tool",
        icon: <MdCompare />,
        desc: "Compare two images side-by-side or with a slider.",
        code: "ImageComparisonTool",
        // seo: SeoDataImport.ImageComparisonTool
      },
      {
        name: "Image File Size Estimator",
        slug: "image-file-size-estimator",
        icon: <MdStorage />,
        desc: "Estimate file size after resizing or compressing.",
        code: "ImageFileSizeEstimator",
        // seo: SeoDataImport.ImageFileSizeEstimator
      },
      {
        name: "Image Red Eye Remover",
        slug: "image-red-eye-remover",
        icon: <MdImage />,
        desc: "Remove red-eye effects from photos effortlessly.",
        code: "ImageRedEyeRemover",
        // seo: SeoDataImport.ImageRedEyeRemover
      },
      {
        name: "Image Collage Grid Maker",
        slug: "image-collage-grid-maker",
        icon: <MdImage />,
        desc: "Create grid-based collages with custom layouts.",
        code: "ImageCollageGridMaker",
        seo: SeoDataImport.ImageCollageGridMaker
      },
      {
        name: "Image Pattern Generator",
        slug: "image-pattern-generator",
        icon: <MdImage />,
        desc: "Generate repeating patterns from images.",
        code: "ImagePatternGenerator",
        // seo: SeoDataImport.ImagePatternGenerator
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
        seo: SeoDataImport.PdfToWord,
      },
      {
        name: "PDF to Image",
        slug: "pdf-to-image",
        icon: <MdPictureAsPdf />,
        desc: "Convert PDF pages into high-quality images.",
        code: "PDFToImage",
        seo: SeoDataImport.PDFToImage,
      },
      {
        name: "Merge PDFs",
        slug: "merge-pdfs",
        icon: <MdPictureAsPdf />,
        desc: "Combine multiple PDF files into a single document.",
        code: "MergePDFs",
        seo: SeoDataImport.MergePDFs,
      },
      {
        name: "Split PDF",
        slug: "split-pdf",
        icon: <MdPictureAsPdf />,
        desc: "Extract pages or split large PDFs into smaller files.",
        code: "SplitPDF",
        seo: SeoDataImport.SplitPDF,
      },
      {
        name: "Compress PDF",
        slug: "compress-pdf",
        icon: <MdPictureAsPdf />,
        desc: "Reduce the file size of PDFs without losing quality.",
        code: "CompressPDF",
        seo: SeoDataImport.CompressPDF,
      },
      {
        name: "PDF Editor",
        slug: "pdf-editor",
        icon: <MdEditDocument />,
        desc: "Edit text, images, and annotations within PDFs.",
        code: "PDFEditor",
        seo: SeoDataImport.PDFEditor,
      },
      {
        name: "PDF Watermark",
        slug: "pdf-watermark",
        icon: <MdWaterDrop />,
        desc: "Add watermarks to PDFs for branding or copyright protection.",
        code: "PDFWatermark",
        seo: SeoDataImport.PDFWatermark,
      },
      {
        name: "PDF Converter",
        slug: "pdf-converter",
        icon: <MdOutlineCreate />,
        desc: "Convert PDF files into various formats like Word, Excel, and images.",
        code: "PDFConverter",
        seo: SeoDataImport.PDFConverter,
      },
      {
        name: "PDF Password Protector",
        slug: "pdf-password-protector",
        icon: <MdSecurity />,
        desc: "Secure your PDF documents with passwords.",
        code: "PDFPasswordProtector",
        seo: SeoDataImport.PDFPasswordProtector,
      },
      // New 50 PDF Tools
      {
        name: "PDF to Excel",
        slug: "pdf-to-excel",
        icon: <MdTableChart />,
        desc: "Convert PDF tables into editable Excel spreadsheets.",
        code: "PDFToExcel",
        // seo: SeoDataImport.PDFToExcel
      },
      {
        name: "PDF to PowerPoint",
        slug: "pdf-to-powerpoint",
        icon: <MdOutlineSlideshow />,
        desc: "Transform PDFs into PowerPoint slides.",
        code: "PDFToPowerPoint",
        // seo: SeoDataImport.PDFToPowerPoint
      },
      {
        name: "PDF to Text",
        slug: "pdf-to-text",
        icon: <MdTextFields />,
        desc: "Extract plain text from PDF documents.",
        code: "PDFToText",
        // seo: SeoDataImport.PDFToText
      },
      {
        name: "Image to PDF",
        slug: "image-to-pdf",
        icon: <MdImage />,
        desc: "Convert images into PDF documents.",
        code: "ImageToPDF",
        // seo: SeoDataImport.ImageToPDF
      },
      {
        name: "Word to PDF",
        slug: "word-to-pdf",
        icon: <MdOutlineCreate />,
        desc: "Convert Word documents into PDF format.",
        code: "WordToPDF",
        // seo: SeoDataImport.WordToPDF
      },
      {
        name: "Excel to PDF",
        slug: "excel-to-pdf",
        icon: <MdTableChart />,
        desc: "Convert Excel spreadsheets into PDF files.",
        code: "ExcelToPDF",
        // seo: SeoDataImport.ExcelToPDF
      },
      {
        name: "PDF Rotator",
        slug: "pdf-rotator",
        icon: <MdRotateRight />,
        desc: "Rotate PDF pages to the desired orientation.",
        code: "PDFRotator",
        // seo: SeoDataImport.PDFRotator
      },
      {
        name: "PDF Page Extractor",
        slug: "pdf-page-extractor",
        icon: <MdPictureAsPdf />,
        desc: "Extract specific pages from a PDF file.",
        code: "PDFPageExtractor",
        // seo: SeoDataImport.PDFPageExtractor
      },
      {
        name: "PDF Annotator",
        slug: "pdf-annotator",
        icon: <MdEdit />,
        desc: "Add notes, highlights, and comments to PDFs.",
        code: "PDFAnnotator",
        // seo: SeoDataImport.PDFAnnotator
      },
      {
        name: "PDF Form Filler",
        slug: "pdf-form-filler",
        icon: <MdEditDocument />,
        desc: "Fill out interactive PDF forms easily.",
        code: "PDFFormFiller",
        // seo: SeoDataImport.PDFFormFiller
      },
      {
        name: "PDF Form Creator",
        slug: "pdf-form-creator",
        icon: <MdEditDocument />,
        desc: "Create fillable forms within PDF documents.",
        code: "PDFFormCreator",
        // seo: SeoDataImport.PDFFormCreator
      },
      {
        name: "PDF Signature Adder",
        slug: "pdf-signature-adder",
        icon: <MdDraw />,
        desc: "Add digital signatures to PDF files.",
        code: "PDFSignatureAdder",
        // seo: SeoDataImport.PDFSignatureAdder
      },
      {
        name: "PDF Password Remover",
        slug: "pdf-password-remover",
        icon: <MdLockOpen />,
        desc: "Remove password protection from PDFs.",
        code: "PDFPasswordRemover",
        // seo: SeoDataImport.PDFPasswordRemover
      },
      {
        name: "PDF Encryption Tool",
        slug: "pdf-encryption-tool",
        icon: <MdLock />,
        desc: "Encrypt PDFs with advanced security options.",
        code: "PDFEncryptionTool",
        // seo: SeoDataImport.PDFEncryptionTool
      },
      {
        name: "PDF Decryption Tool",
        slug: "pdf-decryption-tool",
        icon: <MdLockOpen />,
        desc: "Decrypt encrypted PDF files with the correct key.",
        code: "PDFDecryptionTool",
        // seo: SeoDataImport.PDFDecryptionTool
      },
      {
        name: "PDF Redaction Tool",
        slug: "pdf-redaction-tool",
        icon: <MdVisibilityOff />,
        desc: "Redact sensitive information from PDFs permanently.",
        code: "PDFRedactionTool",
        // seo: SeoDataImport.PDFRedactionTool
      },
      {
        name: "PDF Metadata Editor",
        slug: "pdf-metadata-editor",
        icon: <MdInfoOutline />,
        desc: "Edit or remove metadata from PDF files.",
        code: "PDFMetadataEditor",
        // seo: SeoDataImport.PDFMetadataEditor
      },
      {
        name: "PDF Metadata Viewer",
        slug: "pdf-metadata-viewer",
        icon: <MdInfoOutline />,
        desc: "View metadata details embedded in PDFs.",
        code: "PDFMetadataViewer",
        // seo: SeoDataImport.PDFMetadataViewer
      },
      {
        name: "PDF OCR Tool",
        slug: "pdf-ocr-tool",
        icon: <MdTextFields />,
        desc: "Convert scanned PDFs into searchable text using OCR.",
        code: "PDFOCRTool",
        // seo: SeoDataImport.PDFOCRTool
      },
      {
        name: "PDF to HTML",
        slug: "pdf-to-html",
        icon: <MdCode />,
        desc: "Convert PDFs into HTML markup for web use.",
        code: "PDFToHTML",
        // seo: SeoDataImport.PDFToHTML
      },
      {
        name: "HTML to PDF",
        slug: "html-to-pdf",
        icon: <MdCode />,
        desc: "Convert HTML content into PDF documents.",
        code: "HTMLToPDF",
        // seo: SeoDataImport.HTMLToPDF
      },
      {
        name: "PDF Bookmark Manager",
        slug: "pdf-bookmark-manager",
        icon: <MdBookmark />,
        desc: "Add, edit, or remove bookmarks in PDFs.",
        code: "PDFBookmarkManager",
        // seo: SeoDataImport.PDFBookmarkManager
      },
      {
        name: "PDF Page Numberer",
        slug: "pdf-page-numberer",
        icon: <MdFormatListNumbered />,
        desc: "Add page numbers to PDF documents.",
        code: "PDFPageNumberer",
        // seo: SeoDataImport.PDFPageNumberer
      },
      {
        name: "PDF Header Footer Editor",
        slug: "pdf-header-footer-editor",
        icon: <MdEdit />,
        desc: "Customize headers and footers in PDFs.",
        code: "PDFHeaderFooterEditor",
        // seo: SeoDataImport.PDFHeaderFooterEditor
      },
      {
        name: "PDF Table Extractor",
        slug: "pdf-table-extractor",
        icon: <MdTableChart />,
        desc: "Extract tables from PDFs into spreadsheets.",
        code: "PDFTableExtractor",
        // seo: SeoDataImport.PDFTableExtractor
      },
      {
        name: "PDF Image Extractor",
        slug: "pdf-image-extractor",
        icon: <MdImage />,
        desc: "Extract all images embedded in a PDF.",
        code: "PDFImageExtractor",
        // seo: SeoDataImport.PDFImageExtractor
      },
      {
        name: "PDF Text Extractor",
        slug: "pdf-text-extractor",
        icon: <MdTextFields />,
        desc: "Extract all text content from PDFs.",
        code: "PDFTextExtractor",
        // seo: SeoDataImport.PDFTextExtractor
      },
      {
        name: "PDF Cropper",
        slug: "pdf-cropper",
        icon: <MdCrop />,
        desc: "Crop PDF pages to remove unwanted areas.",
        code: "PDFCropper",
        // seo: SeoDataImport.PDFCropper
      },
      {
        name: "PDF Page Reorder",
        slug: "pdf-page-reorder",
        icon: <MdSort />,
        desc: "Rearrange the order of pages in a PDF.",
        code: "PDFPageReorder",
        // seo: SeoDataImport.PDFPageReorder
      },
      {
        name: "PDF Page Deleter",
        slug: "pdf-page-deleter",
        icon: <MdDelete />,
        desc: "Remove specific pages from a PDF file.",
        code: "PDFPageDeleter",
        // seo: SeoDataImport.PDFPageDeleter
      },
      {
        name: "PDF Comparison Tool",
        slug: "pdf-comparison-tool",
        icon: <MdCompare />,
        desc: "Compare two PDFs and highlight differences.",
        code: "PDFComparisonTool",
        // seo: SeoDataImport.PDFComparisonTool
      },
      {
        name: "PDF File Size Estimator",
        slug: "pdf-file-size-estimator",
        icon: <MdStorage />,
        desc: "Estimate PDF file size after compression or editing.",
        code: "PDFFileSizeEstimator",
        // seo: SeoDataImport.PDFFileSizeEstimator
      },
      {
        name: "PDF to EPUB",
        slug: "pdf-to-epub",
        icon: <MdBook />,
        desc: "Convert PDFs into EPUB format for e-readers.",
        code: "PDFToEPUB",
        // seo: SeoDataImport.PDFToEPUB
      },
      {
        name: "EPUB to PDF",
        slug: "epub-to-pdf",
        icon: <MdBook />,
        desc: "Convert EPUB files into PDF format.",
        code: "EPUBToPDF",
        // seo: SeoDataImport.EPUBToPDF
      },
      {
        name: "PDF Barcode Generator",
        slug: "pdf-barcode-generator",
        icon: <MdPictureAsPdf />,
        desc: "Add barcodes to PDF documents.",
        code: "PDFBarcodeGenerator",
        // seo: SeoDataImport.PDFBarcodeGenerator
      },
      {
        name: "PDF QR Code Generator",
        slug: "pdf-qr-code-generator",
        icon: <MdQrCode2 />,
        desc: "Embed QR codes into PDF files.",
        code: "PDFQRCodeGenerator",
        // seo: SeoDataImport.PDFQRCodeGenerator
      },
      {
        name: "PDF Font Embedder",
        slug: "pdf-font-embedder",
        icon: <MdFontDownload />,
        desc: "Embed custom fonts into PDF documents.",
        code: "PDFFontEmbedder",
        // seo: SeoDataImport.PDFFontEmbedder
      },
      {
        name: "PDF Accessibility Checker",
        slug: "pdf-accessibility-checker",
        icon: <MdAccessibility />,
        desc: "Check PDFs for accessibility compliance.",
        code: "PDFAccessibilityChecker",
        // seo: SeoDataImport.PDFAccessibilityChecker
      },
      {
        name: "PDF Batch Converter",
        slug: "pdf-batch-converter",
        icon: <MdPictureAsPdf />,
        desc: "Convert multiple PDFs to other formats at once.",
        code: "PDFBatchConverter",
        // seo: SeoDataImport.PDFBatchConverter
      },
      {
        name: "PDF Thumbnail Generator",
        slug: "pdf-thumbnail-generator",
        icon: <MdImage />,
        desc: "Generate thumbnail images from PDF pages.",
        code: "PDFThumbnailGenerator",
        // seo: SeoDataImport.PDFThumbnailGenerator
      },
      {
        name: "PDF Optimizer",
        slug: "pdf-optimizer",
        icon: <MdSpeed />,
        desc: "Optimize PDFs for faster loading and smaller size.",
        code: "PDFOptimizer",
        // seo: SeoDataImport.PDFOptimizer
      },
      {
        name: "PDF Version Converter",
        slug: "pdf-version-converter",
        icon: <MdPictureAsPdf />,
        desc: "Convert PDFs to different version standards.",
        code: "PDFVersionConverter",
        // seo: SeoDataImport.PDFVersionConverter
      },
      {
        name: "PDF Link Extractor",
        slug: "pdf-link-extractor",
        icon: <MdLink />,
        desc: "Extract all hyperlinks from a PDF.",
        code: "PDFLinkExtractor",
        // seo: SeoDataImport.PDFLinkExtractor
      },
      {
        name: "PDF Color Converter",
        slug: "pdf-color-converter",
        icon: <MdPalette />,
        desc: "Convert PDFs to grayscale or other color modes.",
        code: "PDFColorConverter",
        // seo: SeoDataImport.PDFColorConverter
      },
      {
        name: "PDF Page Size Adjuster",
        slug: "pdf-page-size-adjuster",
        icon: <MdStraighten />,
        desc: "Adjust the page size of PDFs (e.g., A4, Letter).",
        code: "PDFPageSizeAdjuster",
        // seo: SeoDataImport.PDFPageSizeAdjuster
      },
      {
        name: "PDF Security Analyzer",
        slug: "pdf-security-analyzer",
        icon: <MdSecurity />,
        desc: "Analyze security settings of a PDF file.",
        code: "PDFSecurityAnalyzer",
        // seo: SeoDataImport.PDFSecurityAnalyzer
      },
      {
        name: "PDF to JSON",
        slug: "pdf-to-json",
        icon: <MdCode />,
        desc: "Convert PDF content into structured JSON data.",
        code: "PDFToJSON",
        // seo: SeoDataImport.PDFToJSON
      },
      {
        name: "PDF Repair Tool",
        slug: "pdf-repair-tool",
        icon: <MdBuild />,
        desc: "Repair corrupted or damaged PDF files.",
        code: "PDFRepairTool",
        // seo: SeoDataImport.PDFRepairTool
      },
      {
        name: "PDF Annotation Remover",
        slug: "pdf-annotation-remover",
        icon: <MdDelete />,
        desc: "Remove all annotations from a PDF.",
        code: "PDFAnnotationRemover",
        // seo: SeoDataImport.PDFAnnotationRemover
      },
      {
        name: "PDF Print Optimizer",
        slug: "pdf-print-optimizer",
        icon: <MdPrint />,
        desc: "Optimize PDFs for high-quality printing.",
        code: "PDFPrintOptimizer",
        // seo: SeoDataImport.PDFPrintOptimizer
      },
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
        seo: SeoDataImport.LengthConverter,
      },
      {
        name: "Weight Converter",
        slug: "weight-converter",
        icon: <MdStraighten />,
        desc: "Easily convert weight units like kilograms, pounds, and grams.",
        code: "WeightConverter",
        seo: SeoDataImport.WeightConverter,
      },
      {
        name: "Temperature Converter",
        slug: "temperature-converter",
        icon: <MdStraighten />,
        desc: "Convert temperatures between Celsius, Fahrenheit, and Kelvin.",
        code: "TemperatureConverter",
        seo: SeoDataImport.TemperatureConverter,
      },
      {
        name: "Volume Converter",
        slug: "volume-converter",
        icon: <MdStraighten />,
        desc: "Convert volume units such as liters, milliliters, and gallons.",
        code: "VolumeConverter",
        seo: SeoDataImport.VolumeConverter,
      },
      {
        name: "Speed Converter",
        slug: "speed-converter",
        icon: <MdStraighten />,
        desc: "Convert speed units like kilometers per hour, miles per hour, and meters per second.",
        code: "SpeedConverter",
        seo: SeoDataImport.SpeedConverter,
      },
      // New 50 Unit Converter Tools
      {
        name: "Area Converter",
        slug: "area-converter",
        icon: <MdStraighten />,
        desc: "Convert area units like square meters, acres, and square feet.",
        code: "AreaConverter",
        // seo: SeoDataImport.AreaConverter
      },
      {
        name: "Time Converter",
        slug: "time-converter",
        icon: <MdAccessTime />,
        desc: "Convert time units such as seconds, minutes, hours, and days.",
        code: "TimeConverter",
        // seo: SeoDataImport.TimeConverter
      },
      {
        name: "Pressure Converter",
        slug: "pressure-converter",
        icon: <MdStraighten />,
        desc: "Convert pressure units like pascal, bar, and psi.",
        code: "PressureConverter",
        // seo: SeoDataImport.PressureConverter
      },
      {
        name: "Energy Converter",
        slug: "energy-converter",
        icon: <MdEnergySavingsLeaf />,
        desc: "Convert energy units such as joules, watt-hours, and calories.",
        code: "EnergyConverter",
        // seo: SeoDataImport.EnergyConverter
      },
      {
        name: "Power Converter",
        slug: "power-converter",
        icon: <MdPower />,
        desc: "Convert power units like watts, horsepower, and kilowatts.",
        code: "PowerConverter",
        // seo: SeoDataImport.PowerConverter
      },
      {
        name: "Force Converter",
        slug: "force-converter",
        icon: <MdStraighten />,
        desc: "Convert force units such as newtons, pounds-force, and dynes.",
        code: "ForceConverter",
        // seo: SeoDataImport.ForceConverter
      },
      {
        name: "Angle Converter",
        slug: "angle-converter",
        icon: <MdStraighten />,
        desc: "Convert angle units like degrees, radians, and gradians.",
        code: "AngleConverter",
        // seo: SeoDataImport.AngleConverter
      },
      {
        name: "Frequency Converter",
        slug: "frequency-converter",
        icon: <MdStraighten />,
        desc: "Convert frequency units such as hertz, kilohertz, and megahertz.",
        code: "FrequencyConverter",
        // seo: SeoDataImport.FrequencyConverter
      },
      {
        name: "Digital Storage Converter",
        slug: "digital-storage-converter",
        icon: <MdStorage />,
        desc: "Convert digital storage units like bytes, kilobytes, and gigabytes.",
        code: "DigitalStorageConverter",
        // seo: SeoDataImport.DigitalStorageConverter
      },
      {
        name: "Data Rate Converter",
        slug: "data-rate-converter",
        icon: <MdNetworkCheck />,
        desc: "Convert data rate units such as bits per second, Mbps, and Gbps.",
        code: "DataRateConverter",
        // seo: SeoDataImport.DataRateConverter
      },
      {
        name: "Density Converter",
        slug: "density-converter",
        icon: <MdStraighten />,
        desc: "Convert density units like kg/m³, g/cm³, and lb/ft³.",
        code: "DensityConverter",
        // seo: SeoDataImport.DensityConverter
      },
      {
        name: "Fuel Efficiency Converter",
        slug: "fuel-efficiency-converter",
        icon: <MdLocalGasStation />,
        desc: "Convert fuel efficiency units like km/L, MPG, and L/100km.",
        code: "FuelEfficiencyConverter",
        // seo: SeoDataImport.FuelEfficiencyConverter
      },
      {
        name: "Torque Converter",
        slug: "torque-converter",
        icon: <MdStraighten />,
        desc: "Convert torque units such as Nm, lb-ft, and kg-m.",
        code: "TorqueConverter",
        // seo: SeoDataImport.TorqueConverter
      },
      {
        name: "Acceleration Converter",
        slug: "acceleration-converter",
        icon: <MdStraighten />,
        desc: "Convert acceleration units like m/s², ft/s², and g.",
        code: "AccelerationConverter",
        // seo: SeoDataImport.AccelerationConverter
      },
      {
        name: "Electric Current Converter",
        slug: "electric-current-converter",
        icon: <MdElectricBolt />,
        desc: "Convert electric current units such as amperes, milliamperes, and microamperes.",
        code: "ElectricCurrentConverter",
        // seo: SeoDataImport.ElectricCurrentConverter
      },
      {
        name: "Voltage Converter",
        slug: "voltage-converter",
        icon: <MdElectricBolt />,
        desc: "Convert voltage units like volts, millivolts, and kilovolts.",
        code: "VoltageConverter",
        // seo: SeoDataImport.VoltageConverter
      },
      {
        name: "Resistance Converter",
        slug: "resistance-converter",
        icon: <MdStraighten />,
        desc: "Convert resistance units such as ohms, kilohms, and megohms.",
        code: "ResistanceConverter",
        // seo: SeoDataImport.ResistanceConverter
      },
      {
        name: "Capacitance Converter",
        slug: "capacitance-converter",
        icon: <MdStraighten />,
        desc: "Convert capacitance units like farads, microfarads, and nanofarads.",
        code: "CapacitanceConverter",
        // seo: SeoDataImport.CapacitanceConverter
      },
      {
        name: "Inductance Converter",
        slug: "inductance-converter",
        icon: <MdStraighten />,
        desc: "Convert inductance units such as henries, millihenries, and microhenries.",
        code: "InductanceConverter",
        // seo: SeoDataImport.InductanceConverter
      },
      {
        name: "Charge Converter",
        slug: "charge-converter",
        icon: <MdStraighten />,
        desc: "Convert electric charge units like coulombs, ampere-hours, and millicoulombs.",
        code: "ChargeConverter",
        // seo: SeoDataImport.ChargeConverter
      },
      {
        name: "Luminance Converter",
        slug: "luminance-converter",
        icon: <MdBrightness5 />,
        desc: "Convert luminance units such as candela/m², lux, and nits.",
        code: "LuminanceConverter",
        // seo: SeoDataImport.LuminanceConverter
      },
      {
        name: "Illuminance Converter",
        slug: "illuminance-converter",
        icon: <MdBrightness5 />,
        desc: "Convert illuminance units like lux, foot-candles, and lumens/m².",
        code: "IlluminanceConverter",
        // seo: SeoDataImport.IlluminanceConverter
      },
      {
        name: "Luminous Flux Converter",
        slug: "luminous-flux-converter",
        icon: <MdStraighten />,
        desc: "Convert luminous flux units such as lumens and candela-steradians.",
        code: "LuminousFluxConverter",
        // seo: SeoDataImport.LuminousFluxConverter
      },
      {
        name: "Radiation Dose Converter",
        slug: "radiation-dose-converter",
        icon: <MdStraighten />,
        desc: "Convert radiation dose units like grays, rads, and sieverts.",
        code: "RadiationDoseConverter",
        // seo: SeoDataImport.RadiationDoseConverter
      },
      {
        name: "Flow Rate Converter",
        slug: "flow-rate-converter",
        icon: <MdWaterDrop />,
        desc: "Convert flow rate units such as liters per second, gallons per minute.",
        code: "FlowRateConverter",
        // seo: SeoDataImport.FlowRateConverter
      },
      {
        name: "Viscosity Converter",
        slug: "viscosity-converter",
        icon: <MdStraighten />,
        desc: "Convert viscosity units like poise, centipoise, and pascal-seconds.",
        code: "ViscosityConverter",
        // seo: SeoDataImport.ViscosityConverter
      },
      {
        name: "Thermal Conductivity Converter",
        slug: "thermal-conductivity-converter",
        icon: <MdStraighten />,
        desc: "Convert thermal conductivity units like W/m·K and BTU/h·ft·°F.",
        code: "ThermalConductivityConverter",
        // seo: SeoDataImport.ThermalConductivityConverter
      },
      {
        name: "Heat Capacity Converter",
        slug: "heat-capacity-converter",
        icon: <MdStraighten />,
        desc: "Convert heat capacity units such as J/K, cal/°C, and BTU/°F.",
        code: "HeatCapacityConverter",
        // seo: SeoDataImport.HeatCapacityConverter
      },
      {
        name: "Sound Level Converter",
        slug: "sound-level-converter",
        icon: <MdVolumeUp />,
        desc: "Convert sound level units like decibels and nepers.",
        code: "SoundLevelConverter",
        // seo: SeoDataImport.SoundLevelConverter
      },
      {
        name: "Magnetic Flux Converter",
        slug: "magnetic-flux-converter",
        icon: <MdStraighten />,
        desc: "Convert magnetic flux units such as webers and maxwells.",
        code: "MagneticFluxConverter",
        // seo: SeoDataImport.MagneticFluxConverter
      },
      {
        name: "Magnetic Field Strength Converter",
        slug: "magnetic-field-strength-converter",
        icon: <MdStraighten />,
        desc: "Convert magnetic field strength units like amperes/meter and oersteds.",
        code: "MagneticFieldStrengthConverter",
        // seo: SeoDataImport.MagneticFieldStrengthConverter
      },
      {
        name: "Concentration Converter",
        slug: "concentration-converter",
        icon: <MdStraighten />,
        desc: "Convert concentration units like mol/L, g/L, and ppm.",
        code: "ConcentrationConverter",
        // seo: SeoDataImport.ConcentrationConverter
      },
      {
        name: "Currency Converter",
        slug: "currency-converter",
        icon: <MdAttachMoney />,
        desc: "Convert between different currencies with real-time rates.",
        code: "CurrencyConverter",
        // seo: SeoDataImport.CurrencyConverter
      },
      {
        name: "Cooking Measurement Converter",
        slug: "cooking-measurement-converter",
        icon: <MdKitchen />,
        desc: "Convert cooking units like teaspoons, cups, and ounces.",
        code: "CookingMeasurementConverter",
        // seo: SeoDataImport.CookingMeasurementConverter
      },
      {
        name: "Typography Converter",
        slug: "typography-converter",
        icon: <MdStraighten />,
        desc: "Convert typography units such as points, picas, and inches.",
        code: "TypographyConverter",
        // seo: SeoDataImport.TypographyConverter
      },
      {
        name: "Pixel Converter",
        slug: "pixel-converter",
        icon: <MdImage />,
        desc: "Convert pixel measurements to inches, cm, or other units.",
        code: "PixelConverter",
        // seo: SeoDataImport.PixelConverter
      },
      {
        name: "Resolution Converter",
        slug: "resolution-converter",
        icon: <MdImage />,
        desc: "Convert resolution units like DPI, PPI, and dots/cm.",
        code: "ResolutionConverter",
        // seo: SeoDataImport.ResolutionConverter
      },
      {
        name: "Mass Flow Rate Converter",
        slug: "mass-flow-rate-converter",
        icon: <MdStraighten />,
        desc: "Convert mass flow rate units like kg/s and lb/min.",
        code: "MassFlowRateConverter",
        // seo: SeoDataImport.MassFlowRateConverter
      },
      {
        name: "Specific Heat Converter",
        slug: "specific-heat-converter",
        icon: <MdStraighten />,
        desc: "Convert specific heat units like J/kg·K and BTU/lb·°F.",
        code: "SpecificHeatConverter",
        // seo: SeoDataImport.SpecificHeatConverter
      },
      {
        name: "Moment of Inertia Converter",
        slug: "moment-of-inertia-converter",
        icon: <MdStraighten />,
        desc: "Convert moment of inertia units like kg·m² and lb·ft².",
        code: "MomentOfInertiaConverter",
        // seo: SeoDataImport.MomentOfInertiaConverter
      },
      {
        name: "Surface Tension Converter",
        slug: "surface-tension-converter",
        icon: <MdStraighten />,
        desc: "Convert surface tension units like N/m and dyn/cm.",
        code: "SurfaceTensionConverter",
        // seo: SeoDataImport.SurfaceTensionConverter
      },
      {
        name: "Thermal Expansion Converter",
        slug: "thermal-expansion-converter",
        icon: <MdStraighten />,
        desc: "Convert thermal expansion units like m/m·K and in/in·°F.",
        code: "ThermalExpansionConverter",
        // seo: SeoDataImport.ThermalExpansionConverter
      },
      {
        name: "Angular Velocity Converter",
        slug: "angular-velocity-converter",
        icon: <MdStraighten />,
        desc: "Convert angular velocity units like rad/s and RPM.",
        code: "AngularVelocityConverter",
        // seo: SeoDataImport.AngularVelocityConverter
      },
      {
        name: "Photon Energy Converter",
        slug: "photon-energy-converter",
        icon: <MdStraighten />,
        desc: "Convert photon energy units like eV and joules.",
        code: "PhotonEnergyConverter",
        // seo: SeoDataImport.PhotonEnergyConverter
      },
      {
        name: "Wave Number Converter",
        slug: "wave-number-converter",
        icon: <MdStraighten />,
        desc: "Convert wave number units like cm⁻¹ and m⁻¹.",
        code: "WaveNumberConverter",
        // seo: SeoDataImport.WaveNumberConverter
      },
      {
        name: "Kinematic Viscosity Converter",
        slug: "kinematic-viscosity-converter",
        icon: <MdStraighten />,
        desc: "Convert kinematic viscosity units like m²/s and stokes.",
        code: "KinematicViscosityConverter",
        // seo: SeoDataImport.KinematicViscosityConverter
      },
      {
        name: "Electric Field Converter",
        slug: "electric-field-converter",
        icon: <MdElectricBolt />,
        desc: "Convert electric field units like V/m and N/C.",
        code: "ElectricFieldConverter",
        // seo: SeoDataImport.ElectricFieldConverter
      },
      {
        name: "Magnetic Flux Density Converter",
        slug: "magnetic-flux-density-converter",
        icon: <MdStraighten />,
        desc: "Convert magnetic flux density units like tesla and gauss.",
        code: "MagneticFluxDensityConverter",
        // seo: SeoDataImport.MagneticFluxDensityConverter
      },
      {
        name: "Radioactivity Converter",
        slug: "radioactivity-converter",
        icon: <MdStraighten />,
        desc: "Convert radioactivity units like becquerels and curies.",
        code: "RadioactivityConverter",
        // seo: SeoDataImport.RadioactivityConverter
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
        seo: SeoDataImport.TimeZoneConverter,
      },
      {
        name: "Epoch Time Converter",
        slug: "epoch-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert Unix epoch timestamps to human-readable dates and vice versa.",
        code: "EpochTimeConverter",
        seo: SeoDataImport.EpochTimeConverter,
      },
      {
        name: "Date to Timestamp",
        slug: "date-to-timestamp",
        icon: <MdAccessTime />,
        desc: "Generate a timestamp from a given date and time.",
        code: "DateToTimestamp",
        seo: SeoDataImport.DateToTimestamp,
      },
      {
        name: "Stopwatch",
        slug: "stopwatch",
        icon: <MdAccessTime />,
        desc: "A simple online stopwatch to track time accurately.",
        code: "Stopwatch",
        seo: SeoDataImport.Stopwatch,
      },
      {
        name: "Countdown Timer",
        slug: "countdown-timer",
        icon: <MdAccessTime />,
        desc: "Set a countdown timer for any duration with alerts.",
        code: "CountdownTimer",
        seo: SeoDataImport.CountdownTimer,
      },
      // New 50 Time Converter Tools
      {
        name: "Time Duration Calculator",
        slug: "time-duration-calculator",
        icon: <MdTimer />,
        desc: "Calculate the duration between two dates or times.",
        code: "TimeDurationCalculator",
        // seo: SeoDataImport.TimeDurationCalculator
      },
      {
        name: "Time Format Converter",
        slug: "time-format-converter",
        icon: <MdAccessTime />,
        desc: "Convert time between 12-hour and 24-hour formats.",
        code: "TimeFormatConverter",
        // seo: SeoDataImport.TimeFormatConverter
      },
      {
        name: "ISO 8601 Converter",
        slug: "iso-8601-converter",
        icon: <MdAccessTime />,
        desc: "Convert dates and times to and from ISO 8601 format.",
        code: "ISO8601Converter",
        // seo: SeoDataImport.ISO8601Converter
      },
      {
        name: "Julian Date Converter",
        slug: "julian-date-converter",
        icon: <MdCalendarToday />,
        desc: "Convert between Julian dates and standard calendar dates.",
        code: "JulianDateConverter",
        // seo: SeoDataImport.JulianDateConverter
      },
      {
        name: "Daylight Saving Time Checker",
        slug: "daylight-saving-time-checker",
        icon: <MdAccessTime />,
        desc: "Check if a date falls within Daylight Saving Time for a timezone.",
        code: "DaylightSavingTimeChecker",
        // seo: SeoDataImport.DaylightSavingTimeChecker
      },
      {
        name: "Time Adder",
        slug: "time-adder",
        icon: <MdAccessTime />,
        desc: "Add hours, minutes, or seconds to a given time.",
        code: "TimeAdder",
        // seo: SeoDataImport.TimeAdder
      },
      {
        name: "Time Subtractor",
        slug: "time-subtractor",
        icon: <MdAccessTime />,
        desc: "Subtract time intervals from a given time.",
        code: "TimeSubtractor",
        // seo: SeoDataImport.TimeSubtractor
      },
      {
        name: "World Clock",
        slug: "world-clock",
        icon: <MdPublic />,
        desc: "Display current time in multiple time zones simultaneously.",
        code: "WorldClock",
        // seo: SeoDataImport.WorldClock
      },
      {
        name: "Time Difference Calculator",
        slug: "time-difference-calculator",
        icon: <MdTimer />,
        desc: "Calculate time differences between two locations.",
        code: "TimeDifferenceCalculator",
        // seo: SeoDataImport.TimeDifferenceCalculator
      },
      {
        name: "Date Formatter",
        slug: "date-formatter",
        icon: <MdCalendarToday />,
        desc: "Format dates into custom strings (e.g., DD/MM/YYYY).",
        code: "DateFormatter",
        // seo: SeoDataImport.DateFormatter
      },
      {
        name: "Week Number Calculator",
        slug: "week-number-calculator",
        icon: <MdCalendarToday />,
        desc: "Determine the week number of a given date.",
        code: "WeekNumberCalculator",
        // seo: SeoDataImport.WeekNumberCalculator
      },
      {
        name: "Day of Year Calculator",
        slug: "day-of-year-calculator",
        icon: <MdCalendarToday />,
        desc: "Find the day number of the year for any date.",
        code: "DayOfYearCalculator",
        // seo: SeoDataImport.DayOfYearCalculator
      },
      {
        name: "Military Time Converter",
        slug: "military-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert between standard and military (24-hour) time formats.",
        code: "MilitaryTimeConverter",
        // seo: SeoDataImport.MilitaryTimeConverter
      },
      {
        name: "UTC Converter",
        slug: "utc-converter",
        icon: <MdAccessTime />,
        desc: "Convert local time to and from Coordinated Universal Time (UTC).",
        code: "UTCConverter",
        // seo: SeoDataImport.UTCConverter
      },
      {
        name: "Time to Seconds Converter",
        slug: "time-to-seconds-converter",
        icon: <MdAccessTime />,
        desc: "Convert hours, minutes, and seconds into total seconds.",
        code: "TimeToSecondsConverter",
        // seo: SeoDataImport.TimeToSecondsConverter
      },
      {
        name: "Seconds to Time Converter",
        slug: "seconds-to-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert total seconds into hours, minutes, and seconds.",
        code: "SecondsToTimeConverter",
        // seo: SeoDataImport.SecondsToTimeConverter
      },
      {
        name: "Time Zone Offset Calculator",
        slug: "time-zone-offset-calculator",
        icon: <MdAccessTime />,
        desc: "Calculate the offset between two time zones.",
        code: "TimeZoneOffsetCalculator",
        // seo: SeoDataImport.TimeZoneOffsetCalculator
      },
      {
        name: "Date Adder",
        slug: "date-adder",
        icon: <MdCalendarToday />,
        desc: "Add days, weeks, or months to a given date.",
        code: "DateAdder",
        // seo: SeoDataImport.DateAdder
      },
      {
        name: "Date Subtractor",
        slug: "date-subtractor",
        icon: <MdCalendarToday />,
        desc: "Subtract days, weeks, or months from a given date.",
        code: "DateSubtractor",
        // seo: SeoDataImport.DateSubtractor
      },
      {
        name: "Business Days Calculator",
        slug: "business-days-calculator",
        icon: <MdWork />,
        desc: "Calculate the number of business days between two dates.",
        code: "BusinessDaysCalculator",
        // seo: SeoDataImport.BusinessDaysCalculator
      },
      {
        name: "Age Calculator",
        slug: "age-calculator",
        icon: <MdPersonOutline />,
        desc: "Calculate age in years, months, and days from a birthdate.",
        code: "AgeCalculator",
        // seo: SeoDataImport.AgeCalculator
      },
      {
        name: "Time Since Calculator",
        slug: "time-since-calculator",
        icon: <MdTimer />,
        desc: "Calculate time elapsed since a specific date or event.",
        code: "TimeSinceCalculator",
        // seo: SeoDataImport.TimeSinceCalculator
      },
      {
        name: "Time Until Calculator",
        slug: "time-until-calculator",
        icon: <MdTimer />,
        desc: "Calculate time remaining until a future date or event.",
        code: "TimeUntilCalculator",
        // seo: SeoDataImport.TimeUntilCalculator
      },
      {
        name: "Leap Year Checker",
        slug: "leap-year-checker",
        icon: <MdCalendarToday />,
        desc: "Determine if a given year is a leap year.",
        code: "LeapYearChecker",
        // seo: SeoDataImport.LeapYearChecker
      },
      {
        name: "Sunrise Sunset Calculator",
        slug: "sunrise-sunset-calculator",
        icon: <MdWbSunny />,
        desc: "Calculate sunrise and sunset times for any location.",
        code: "SunriseSunsetCalculator",
        // seo: SeoDataImport.SunriseSunsetCalculator
      },
      {
        name: "Moon Phase Calculator",
        slug: "moon-phase-calculator",
        icon: <MdNightlight />,
        desc: "Determine the moon phase for a specific date.",
        code: "MoonPhaseCalculator",
        // seo: SeoDataImport.MoonPhaseCalculator
      },
      {
        name: "Time Card Calculator",
        slug: "time-card-calculator",
        icon: <MdWork />,
        desc: "Calculate total hours worked from clock-in and clock-out times.",
        code: "TimeCardCalculator",
        // seo: SeoDataImport.TimeCardCalculator
      },
      {
        name: "Time Rounding Tool",
        slug: "time-rounding-tool",
        icon: <MdAccessTime />,
        desc: "Round time to the nearest minute, quarter-hour, or hour.",
        code: "TimeRoundingTool",
        // seo: SeoDataImport.TimeRoundingTool
      },
      {
        name: "Time Zone List Generator",
        slug: "time-zone-list-generator",
        icon: <MdAccessTime />,
        desc: "Generate a list of all available time zones with offsets.",
        code: "TimeZoneListGenerator",
        // seo: SeoDataImport.TimeZoneListGenerator
      },
      {
        name: "Chronological Age Calculator",
        slug: "chronological-age-calculator",
        icon: <MdPersonOutline />,
        desc: "Calculate exact chronological age with precision.",
        code: "ChronologicalAgeCalculator",
        // seo: SeoDataImport.ChronologicalAgeCalculator
      },
      {
        name: "Time to Decimal Converter",
        slug: "time-to-decimal-converter",
        icon: <MdAccessTime />,
        desc: "Convert hours and minutes into decimal hours.",
        code: "TimeToDecimalConverter",
        // seo: SeoDataImport.TimeToDecimalConverter
      },
      {
        name: "Decimal to Time Converter",
        slug: "decimal-to-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert decimal hours into standard time format.",
        code: "DecimalToTimeConverter",
        // seo: SeoDataImport.DecimalToTimeConverter
      },
      {
        name: "Event Scheduler",
        slug: "event-scheduler",
        icon: <MdEvent />,
        desc: "Schedule events across multiple time zones.",
        code: "EventScheduler",
        // seo: SeoDataImport.EventScheduler
      },
      {
        name: "Time Zone Abbreviation Resolver",
        slug: "time-zone-abbreviation-resolver",
        icon: <MdAccessTime />,
        desc: "Resolve time zone abbreviations to full names and offsets.",
        code: "TimeZoneAbbreviationResolver",
        // seo: SeoDataImport.TimeZoneAbbreviationResolver
      },
      {
        name: "Historical Date Converter",
        slug: "historical-date-converter",
        icon: <MdCalendarToday />,
        desc: "Convert dates between Gregorian and historical calendars.",
        code: "HistoricalDateConverter",
        // seo: SeoDataImport.HistoricalDateConverter
      },
      {
        name: "Solar Time Calculator",
        slug: "solar-time-calculator",
        icon: <MdWbSunny />,
        desc: "Calculate solar time based on longitude and date.",
        code: "SolarTimeCalculator",
        // seo: SeoDataImport.SolarTimeCalculator
      },
      {
        name: "Sidereal Time Converter",
        slug: "sidereal-time-converter",
        icon: <MdAccessTime />,
        desc: "Convert between sidereal and standard time.",
        code: "SiderealTimeConverter",
        // seo: SeoDataImport.SiderealTimeConverter
      },
      {
        name: "Time Batch Converter",
        slug: "time-batch-converter",
        icon: <MdAccessTime />,
        desc: "Convert multiple times across different zones at once.",
        code: "TimeBatchConverter",
        // seo: SeoDataImport.TimeBatchConverter
      },
      {
        name: "Work Hours Calculator",
        slug: "work-hours-calculator",
        icon: <MdWork />,
        desc: "Calculate total work hours including breaks.",
        code: "WorkHoursCalculator",
        // seo: SeoDataImport.WorkHoursCalculator
      },
      {
        name: "Time Zone Sync Tool",
        slug: "time-zone-sync-tool",
        icon: <MdSync />,
        desc: "Synchronize times across multiple time zones.",
        code: "TimeZoneSyncTool",
        // seo: SeoDataImport.TimeZoneSyncTool
      },
      {
        name: "Date Range Generator",
        slug: "date-range-generator",
        icon: <MdCalendarToday />,
        desc: "Generate a list of dates within a specified range.",
        code: "DateRangeGenerator",
        // seo: SeoDataImport.DateRangeGenerator
      },
      {
        name: "Time Zone Map Viewer",
        slug: "time-zone-map-viewer",
        icon: <MdMap />,
        desc: "View time zones on an interactive world map.",
        code: "TimeZoneMapViewer",
        // seo: SeoDataImport.TimeZoneMapViewer
      },
      {
        name: "Prayer Time Calculator",
        slug: "prayer-time-calculator",
        icon: <MdAccessTime />,
        desc: "Calculate prayer times based on location and date.",
        code: "PrayerTimeCalculator",
        // seo: SeoDataImport.PrayerTimeCalculator
      },
      {
        name: "Time Zone DST Adjuster",
        slug: "time-zone-dst-adjuster",
        icon: <MdAccessTime />,
        desc: "Adjust times for Daylight Saving Time changes.",
        code: "TimeZoneDSTAdjuster",
        // seo: SeoDataImport.TimeZoneDSTAdjuster
      },
      {
        name: "Fiscal Year Calculator",
        slug: "fiscal-year-calculator",
        icon: <MdCalendarToday />,
        desc: "Determine fiscal year dates based on custom start dates.",
        code: "FiscalYearCalculator",
        // seo: SeoDataImport.FiscalYearCalculator
      },
      {
        name: "Time Zone Conflict Checker",
        slug: "time-zone-conflict-checker",
        icon: <MdAccessTime />,
        desc: "Identify scheduling conflicts across time zones.",
        code: "TimeZoneConflictChecker",
        // seo: SeoDataImport.TimeZoneConflictChecker
      },
      {
        name: "Unix Time Batch Converter",
        slug: "unix-time-batch-converter",
        icon: <MdAccessTime />,
        desc: "Convert multiple Unix timestamps in bulk.",
        code: "UnixTimeBatchConverter",
        // seo: SeoDataImport.UnixTimeBatchConverter
      },
      {
        name: "Time Zone History Viewer",
        slug: "time-zone-history-viewer",
        icon: <MdHistory />,
        desc: "View historical time zone changes for a location.",
        code: "TimeZoneHistoryViewer",
        // seo: SeoDataImport.TimeZoneHistoryViewer
      },
      {
        name: "Relative Time Formatter",
        slug: "relative-time-formatter",
        icon: <MdAccessTime />,
        desc: "Convert times to relative formats (e.g., '2 hours ago').",
        code: "RelativeTimeFormatter",
        // seo: SeoDataImport.RelativeTimeFormatter
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
        seo: SeoDataImport.CsvToJsonConverter,
      },
      {
        name: "JSON to XML",
        slug: "json-to-xml",
        icon: <MdTransform />,
        desc: "Convert JSON data to XML format for seamless integration.",
        code: "JsonToXml",
        seo: SeoDataImport.JsonToXmlConverter,
      },
      {
        name: "YAML to JSON",
        slug: "yaml-to-json",
        icon: <MdTransform />,
        desc: "Convert YAML data to JSON format effortlessly.",
        code: "YamlToJson",
        seo: SeoDataImport.YamlToJsonConverter,
      },
      {
        name: "Base64 Encoder",
        slug: "base64-encoder",
        icon: <MdSecurity />,
        desc: "Encode text or files to Base64 format.",
        code: "Base64Encoder",
        seo: SeoDataImport.Base64Encoder,
      },
      {
        name: "Base64 Decoder",
        slug: "base64-decoder",
        icon: <MdTransform />,
        desc: "Decode Base64-encoded text or files back to their original form.",
        code: "Base64Decoder",
        seo: SeoDataImport.Base64Decoder,
      },
      {
        name: "URL Encoder",
        slug: "url-encoder",
        icon: <MdTransform />,
        desc: "Encode special characters in URLs to make them safe for web use.",
        code: "URLEncoder",
        seo: SeoDataImport.URLEncoder,
      },
      {
        name: "URL Decoder",
        slug: "url-decoder",
        icon: <MdTransform />,
        desc: "Decode encoded URLs back to their original readable format.",
        code: "URLDecoder",
        seo: SeoDataImport.URLDecoder,
      },
      {
        name: "JSON to CSV",
        slug: "json-to-csv",
        icon: <MdTransform />,
        desc: "Convert JSON data to CSV format for spreadsheet use.",
        code: "JsonToCsv",
        seo: SeoDataImport.JsonToCsvConverter,
      },
      {
        name: "XML to JSON",
        slug: "xml-to-json",
        icon: <MdTransform />,
        desc: "Transform XML data into JSON format easily.",
        code: "XmlToJson",
        seo: SeoDataImport.XmlToJsonConverter,
      },
      {
        name: "Hex to Text",
        slug: "hex-to-text",
        icon: <MdTransform />,
        desc: "Convert hexadecimal values to readable text.",
        code: "HexToText",
        seo: SeoDataImport.HexToTextConverter,
      },
      {
        name: "Text to Hex",
        slug: "text-to-hex",
        icon: <MdTransform />,
        desc: "Encode text into hexadecimal format.",
        code: "TextToHex",
        seo: SeoDataImport.TextToHexConverter,
      },
      {
        name: "HTML to Markdown",
        slug: "html-to-markdown",
        icon: <MdTransform />,
        desc: "Convert HTML content to Markdown format.",
        code: "HtmlToMarkdown",
        seo: SeoDataImport.HtmlToMarkdownConverter,
      },
      // New 50 Data Converter Tools
      {
        name: "Markdown to HTML",
        slug: "markdown-to-html",
        icon: <MdTransform />,
        desc: "Convert Markdown text to HTML markup.",
        code: "MarkdownToHtml",
        // seo: SeoDataImport.MarkdownToHtmlConverter
      },
      {
        name: "JSON to YAML",
        slug: "json-to-yaml",
        icon: <MdTransform />,
        desc: "Transform JSON data into YAML format.",
        code: "JsonToYaml",
        // seo: SeoDataImport.JsonToYamlConverter
      },
      {
        name: "XML to YAML",
        slug: "xml-to-yaml",
        icon: <MdTransform />,
        desc: "Convert XML data to YAML format.",
        code: "XmlToYaml",
        // seo: SeoDataImport.XmlToYamlConverter
      },
      {
        name: "YAML to XML",
        slug: "yaml-to-xml",
        icon: <MdTransform />,
        desc: "Convert YAML data to XML format.",
        code: "YamlToXml",
        // seo: SeoDataImport.YamlToXmlConverter
      },
      {
        name: "CSV to XML",
        slug: "csv-to-xml",
        icon: <MdTransform />,
        desc: "Transform CSV data into XML structure.",
        code: "CsvToXml",
        // seo: SeoDataImport.CsvToXmlConverter
      },
      {
        name: "Text to Binary",
        slug: "text-to-binary",
        icon: <MdCode />,
        desc: "Convert text into binary code.",
        code: "TextToBinary",
        // seo: SeoDataImport.TextToBinaryConverter
      },
      {
        name: "Binary to Text",
        slug: "binary-to-text",
        icon: <MdCode />,
        desc: "Decode binary code back to readable text.",
        code: "BinaryToText",
        // seo: SeoDataImport.BinaryToTextConverter
      },
      {
        name: "Text to ASCII",
        slug: "text-to-ascii",
        icon: <MdTextFields />,
        desc: "Convert text to ASCII code values.",
        code: "TextToAscii",
        // seo: SeoDataImport.TextToAsciiConverter
      },
      {
        name: "ASCII to Text",
        slug: "ascii-to-text",
        icon: <MdTextFields />,
        desc: "Convert ASCII codes back to readable text.",
        code: "AsciiToText",
        // seo: SeoDataImport.AsciiToTextConverter
      },
      {
        name: "JSON to SQL",
        slug: "json-to-sql",
        icon: <MdTransform />,
        desc: "Generate SQL queries from JSON data.",
        code: "JsonToSql",
        // seo: SeoDataImport.JsonToSqlConverter
      },
      {
        name: "CSV to SQL",
        slug: "csv-to-sql",
        icon: <MdTransform />,
        desc: "Convert CSV data into SQL insert statements.",
        code: "CsvToSql",
        // seo: SeoDataImport.CsvToSqlConverter
      },
      {
        name: "HTML to Text",
        slug: "html-to-text",
        icon: <MdTextFields />,
        desc: "Strip HTML tags to extract plain text.",
        code: "HtmlToText",
        // seo: SeoDataImport.HtmlToTextConverter
      },
      {
        name: "Text to HTML",
        slug: "text-to-html",
        icon: <MdCode />,
        desc: "Convert plain text to HTML with basic formatting.",
        code: "TextToHtml",
        // seo: SeoDataImport.TextToHtmlConverter
      },
      {
        name: "JSON to TSV",
        slug: "json-to-tsv",
        icon: <MdTransform />,
        desc: "Convert JSON data to Tab-Separated Values format.",
        code: "JsonToTsv",
        // seo: SeoDataImport.JsonToTsvConverter
      },
      {
        name: "TSV to JSON",
        slug: "tsv-to-json",
        icon: <MdTransform />,
        desc: "Transform TSV data into JSON format.",
        code: "TsvToJson",
        // seo: SeoDataImport.TsvToJsonConverter
      },
      {
        name: "CSV to TSV",
        slug: "csv-to-tsv",
        icon: <MdTransform />,
        desc: "Convert CSV data to TSV format.",
        code: "CsvToTsv",
        // seo: SeoDataImport.CsvToTsvConverter
      },
      {
        name: "TSV to CSV",
        slug: "tsv-to-csv",
        icon: <MdTransform />,
        desc: "Convert TSV data to CSV format.",
        code: "TsvToCsv",
        // seo: SeoDataImport.TsvToCsvConverter
      },
      {
        name: "Hex to Binary",
        slug: "hex-to-binary",
        icon: <MdCode />,
        desc: "Convert hexadecimal values to binary format.",
        code: "HexToBinary",
        // seo: SeoDataImport.HexToBinaryConverter
      },
      {
        name: "Binary to Hex",
        slug: "binary-to-hex",
        icon: <MdCode />,
        desc: "Convert binary data to hexadecimal format.",
        code: "BinaryToHex",
        // seo: SeoDataImport.BinaryToHexConverter
      },
      {
        name: "Text to Morse Code",
        slug: "text-to-morse-code",
        icon: <MdCode />,
        desc: "Encode text into Morse code.",
        code: "TextToMorseCode",
        // seo: SeoDataImport.TextToMorseCodeConverter
      },
      {
        name: "Morse Code to Text",
        slug: "morse-code-to-text",
        icon: <MdCode />,
        desc: "Decode Morse code back to readable text.",
        code: "MorseCodeToText",
        // seo: SeoDataImport.MorseCodeToTextConverter
      },
      {
        name: "JSON to HTML Table",
        slug: "json-to-html-table",
        icon: <MdTableChart />,
        desc: "Convert JSON data into an HTML table.",
        code: "JsonToHtmlTable",
        // seo: SeoDataImport.JsonToHtmlTableConverter
      },
      {
        name: "CSV to HTML Table",
        slug: "csv-to-html-table",
        icon: <MdTableChart />,
        desc: "Transform CSV data into an HTML table.",
        code: "CsvToHtmlTable",
        // seo: SeoDataImport.CsvToHtmlTableConverter
      },
      {
        name: "Text to Unicode",
        slug: "text-to-unicode",
        icon: <MdTextFields />,
        desc: "Convert text to Unicode code points.",
        code: "TextToUnicode",
        // seo: SeoDataImport.TextToUnicodeConverter
      },
      {
        name: "Unicode to Text",
        slug: "unicode-to-text",
        icon: <MdTextFields />,
        desc: "Convert Unicode code points back to text.",
        code: "UnicodeToText",
        // seo: SeoDataImport.UnicodeToTextConverter
      },
      {
        name: "HTML Entity Encoder",
        slug: "html-entity-encoder",
        icon: <MdCode />,
        desc: "Encode text into HTML entities (e.g., &amp;).",
        code: "HtmlEntityEncoder",
        // seo: SeoDataImport.HtmlEntityEncoder
      },
      {
        name: "HTML Entity Decoder",
        slug: "html-entity-decoder",
        icon: <MdCode />,
        desc: "Decode HTML entities back to plain text.",
        code: "HtmlEntityDecoder",
        // seo: SeoDataImport.HtmlEntityDecoder
      },
      {
        name: "JSON to Markdown",
        slug: "json-to-markdown",
        icon: <MdTransform />,
        desc: "Convert JSON data into Markdown format.",
        code: "JsonToMarkdown",
        // seo: SeoDataImport.JsonToMarkdownConverter
      },
      {
        name: "XML to CSV",
        slug: "xml-to-csv",
        icon: <MdTransform />,
        desc: "Transform XML data into CSV format.",
        code: "XmlToCsv",
        // seo: SeoDataImport.XmlToCsvConverter
      },
      {
        name: "Text to JSON",
        slug: "text-to-json",
        icon: <MdTextFields />,
        desc: "Convert plain text into structured JSON data.",
        code: "TextToJson",
        // seo: SeoDataImport.TextToJsonConverter
      },
      {
        name: "JSON to Text",
        slug: "json-to-text",
        icon: <MdTextFields />,
        desc: "Extract plain text from JSON data.",
        code: "JsonToText",
        // seo: SeoDataImport.JsonToTextConverter
      },
      {
        name: "Hex to Decimal",
        slug: "hex-to-decimal",
        icon: <MdTransform />,
        desc: "Convert hexadecimal values to decimal numbers.",
        code: "HexToDecimal",
        // seo: SeoDataImport.HexToDecimalConverter
      },
      {
        name: "Decimal to Hex",
        slug: "decimal-to-hex",
        icon: <MdTransform />,
        desc: "Convert decimal numbers to hexadecimal format.",
        code: "DecimalToHex",
        // seo: SeoDataImport.DecimalToHexConverter
      },
      {
        name: "Binary to Decimal",
        slug: "binary-to-decimal",
        icon: <MdTransform />,
        desc: "Convert binary numbers to decimal format.",
        code: "BinaryToDecimal",
        // seo: SeoDataImport.BinaryToDecimalConverter
      },
      {
        name: "Decimal to Binary",
        slug: "decimal-to-binary",
        icon: <MdTransform />,
        desc: "Convert decimal numbers to binary format.",
        code: "DecimalToBinary",
        // seo: SeoDataImport.DecimalToBinaryConverter
      },
      {
        name: "Text to Base64 Image",
        slug: "text-to-base64-image",
        icon: <MdImage />,
        desc: "Convert text to a Base64-encoded image.",
        code: "TextToBase64Image",
        // seo: SeoDataImport.TextToBase64ImageConverter
      },
      {
        name: "Base64 Image to Text",
        slug: "base64-image-to-text",
        icon: <MdImage />,
        desc: "Extract text from Base64-encoded images using OCR.",
        code: "Base64ImageToText",
        // seo: SeoDataImport.Base64ImageToTextConverter
      },
      {
        name: "JSON to PHP Array",
        slug: "json-to-php-array",
        icon: <MdCode />,
        desc: "Convert JSON data to a PHP array syntax.",
        code: "JsonToPhpArray",
        // seo: SeoDataImport.JsonToPhpArrayConverter
      },
      {
        name: "CSV to YAML",
        slug: "csv-to-yaml",
        icon: <MdTransform />,
        desc: "Convert CSV data to YAML format.",
        code: "CsvToYaml",
        // seo: SeoDataImport.CsvToYamlConverter
      },
      {
        name: "Text to QR Code",
        slug: "text-to-qr-code",
        icon: <MdQrCode2 />,
        desc: "Generate a QR code from text input.",
        code: "TextToQRCode",
        // seo: SeoDataImport.TextToQRCodeConverter
      },
      {
        name: "QR Code to Text",
        slug: "qr-code-to-text",
        icon: <MdQrCode2 />,
        desc: "Decode text from a QR code image.",
        code: "QRCodeToText",
        // seo: SeoDataImport.QRCodeToTextConverter
      },
      {
        name: "Text to ROT13",
        slug: "text-to-rot13",
        icon: <MdSecurity />,
        desc: "Encode text using the ROT13 cipher.",
        code: "TextToROT13",
        // seo: SeoDataImport.TextToROT13Converter
      },
      {
        name: "ROT13 to Text",
        slug: "rot13-to-text",
        icon: <MdSecurity />,
        desc: "Decode ROT13-encoded text back to plain text.",
        code: "ROT13ToText",
        // seo: SeoDataImport.ROT13ToTextConverter
      },
      {
        name: "JSON to BSON",
        slug: "json-to-bson",
        icon: <MdTransform />,
        desc: "Convert JSON data to BSON binary format.",
        code: "JsonToBson",
        seo: SeoDataImport.JsonToBsonConverter,
      },
      {
        name: "BSON to JSON",
        slug: "bson-to-json",
        icon: <MdTransform />,
        desc: "Convert BSON binary data to JSON format.",
        code: "BsonToJson",
        seo: SeoDataImport.BsonToJsonConverter,
      },
      {
        name: "Text to CSV",
        slug: "text-to-csv",
        icon: <MdTextFields />,
        desc: "Convert plain text into CSV format with delimiters.",
        code: "TextToCsv",
        // seo: SeoDataImport.TextToCsvConverter
      },
      {
        name: "XML to HTML",
        slug: "xml-to-html",
        icon: <MdTransform />,
        desc: "Convert XML data into styled HTML content.",
        code: "XmlToHtml",
        // seo: SeoDataImport.XmlToHtmlConverter
      },
    ],
  },
  {
    category: "Binary Converter",
    slug: "binary-converter-tools",
    desc: "Convert and manipulate Binary formats",
    icon: <MdTransform />,
    tools: [
      {
        name: "Text To Binary",
        slug: "text-to-binary",
        icon: <MdTransform />,
        desc: "Convert Text to Binary easily.",
        code: "TextToBinary",
        seo: SeoDataImport.TextToBinaryConverter,
      },
      {
        name: "Binary To Text",
        slug: "binary-to-text",
        icon: <MdTransform />,
        desc: "Convert Binary code back to readable Text.",
        code: "BinaryToText",
        seo: SeoDataImport.BinaryToTextConverter,
      },
      {
        name: "Binary To Hex",
        slug: "binary-to-hex",
        icon: <MdTransform />,
        desc: "Transform Binary data into Hexadecimal format.",
        code: "BinaryToHex",
        seo: SeoDataImport.BinaryToHexConverter,
      },
      {
        name: "Hex To Binary",
        slug: "hex-to-binary",
        icon: <MdTransform />,
        desc: "Convert Hexadecimal values to Binary format.",
        code: "HexToBinary",
        seo: SeoDataImport.HexToBinaryConverter,
      },
      {
        name: "Binary To Decimal",
        slug: "binary-to-decimal",
        icon: <MdTransform />,
        desc: "Convert Binary numbers to Decimal values.",
        code: "BinaryToDecimal",
        seo: SeoDataImport.BinaryToDecimalConverter,
      },
      {
        name: "Decimal To Binary",
        slug: "decimal-to-binary",
        icon: <MdTransform />,
        desc: "Transform Decimal numbers into Binary format.",
        code: "DecimalToBinary",
        seo: SeoDataImport.DecimalToBinaryConverter,
      },
      {
        name: "Binary To Octal",
        slug: "binary-to-octal",
        icon: <MdTransform />,
        desc: "Convert Binary data to Octal representation.",
        code: "BinaryToOctal",
        seo: SeoDataImport.BinaryToOctalConverter,
      },
      {
        name: "Octal To Binary",
        slug: "octal-to-binary",
        icon: <MdTransform />,
        desc: "Convert Octal values to Binary format.",
        code: "OctalToBinary",
        seo: SeoDataImport.OctalToBinaryConverter,
      },
      {
        name: "Binary To ASCII",
        slug: "binary-to-ascii",
        icon: <MdTransform />,
        desc: "Decode Binary data into ASCII characters.",
        code: "BinaryToASCII",
        seo: SeoDataImport.BinaryToASCIIConverter,
      },
      {
        name: "ASCII To Binary",
        slug: "ascii-to-binary",
        icon: <MdTransform />,
        desc: "Encode ASCII text into Binary format.",
        code: "ASCIIToBinary",
        seo: SeoDataImport.ASCIIToBinaryConverter,
      },
      {
        name: "Binary To Base64",
        slug: "binary-to-base64",
        icon: <MdTransform />,
        desc: "Convert Binary data to Base64 encoding.",
        code: "BinaryToBase64",
        seo: SeoDataImport.BinaryToBase64Converter,
      },
      {
        name: "Base64 To Binary",
        slug: "base64-to-binary",
        icon: <MdTransform />,
        desc: "Decode Base64 data back to Binary format.",
        code: "Base64ToBinary",
        seo: SeoDataImport.Base64ToBinaryConverter,
      },
      {
        name: "Binary To Gray Code",
        slug: "binary-to-gray-code",
        icon: <MdTransform />,
        desc: "Convert Binary numbers to Gray Code.",
        code: "BinaryToGrayCode",
        seo: SeoDataImport.BinaryToGrayCodeConverter,
      },
      {
        name: "Gray Code To Binary",
        slug: "gray-code-to-binary",
        icon: <MdTransform />,
        desc: "Convert Gray Code back to Binary format.",
        code: "GrayCodeToBinary",
        seo: SeoDataImport.GrayCodeToBinaryConverter,
      },
      {
        name: "Binary To BCD",
        slug: "binary-to-bcd",
        icon: <MdTransform />,
        desc: "Convert Binary to Binary-Coded Decimal (BCD).",
        code: "BinaryToBCD",
        seo: SeoDataImport.BinaryToBCDConverter,
      },
      {
        name: "BCD To Binary",
        slug: "bcd-to-binary",
        icon: <MdTransform />,
        desc: "Convert Binary-Coded Decimal (BCD) to Binary.",
        code: "BCDToBinary",
        seo: SeoDataImport.BCDToBinaryConverter,
      },
      {
        name: "Binary To Integer",
        slug: "binary-to-integer",
        icon: <MdTransform />,
        desc: "Convert Binary data to Integer values.",
        code: "BinaryToInteger",
        seo: SeoDataImport.BinaryToIntegerConverter,
      },
      {
        name: "Integer To Binary",
        slug: "integer-to-binary",
        icon: <MdTransform />,
        desc: "Transform Integer values into Binary format.",
        code: "IntegerToBinary",
        seo: SeoDataImport.IntegerToBinaryConverter,
      },
      {
        name: "Binary To UTF-8",
        slug: "binary-to-utf8",
        icon: <MdTransform />,
        desc: "Decode Binary data into UTF-8 characters.",
        code: "BinaryToUTF8",
        seo: SeoDataImport.BinaryToUTF8Converter,
      },
      {
        name: "UTF-8 To Binary",
        slug: "utf8-to-binary",
        icon: <MdTransform />,
        desc: "Encode UTF-8 text into Binary format.",
        code: "UTF8ToBinary",
        seo: SeoDataImport.UTF8ToBinaryConverter,
      },
      {
        name: "Binary Encoder",
        slug: "binary-encoder",
        icon: <MdTransform />,
        desc: "Encode data into Binary format.",
        code: "BinaryEncoder",
        seo: SeoDataImport.BinaryEncoder,
      },
      {
        name: "Binary Decoder",
        slug: "binary-decoder",
        icon: <MdTransform />,
        desc: "Decode Binary data into readable format.",
        code: "BinaryDecoder",
        seo: SeoDataImport.BinaryDecoder,
      },
      {
        name: "Binary XOR Calculator",
        slug: "binary-xor-calculator",
        icon: <MdTransform />,
        desc: "Perform XOR operation on Binary values.",
        code: "BinaryXORCalculator",
        seo: SeoDataImport.BinaryXORCalculator,
      },
      {
        name: "Binary Complement",
        slug: "binary-complement",
        icon: <MdTransform />,
        desc: "Calculate the one's complement of a Binary number.",
        code: "BinaryComplement",
        seo: SeoDataImport.BinaryComplementConverter,
      },
      // New 50 Binary Converter Tools
      {
        name: "Binary to Float",
        slug: "binary-to-float",
        icon: <MdTransform />,
        desc: "Convert Binary data to floating-point numbers.",
        code: "BinaryToFloat",
        // seo: SeoDataImport.BinaryToFloatConverter
      },
      {
        name: "Float to Binary",
        slug: "float-to-binary",
        icon: <MdTransform />,
        desc: "Transform floating-point numbers into Binary format.",
        code: "FloatToBinary",
        // seo: SeoDataImport.FloatToBinaryConverter
      },
      {
        name: "Binary to Unicode",
        slug: "binary-to-unicode",
        icon: <MdTransform />,
        desc: "Decode Binary data into Unicode characters.",
        code: "BinaryToUnicode",
        // seo: SeoDataImport.BinaryToUnicodeConverter
      },
      {
        name: "Unicode to Binary",
        slug: "unicode-to-binary",
        icon: <MdTransform />,
        desc: "Encode Unicode text into Binary format.",
        code: "UnicodeToBinary",
        // seo: SeoDataImport.UnicodeToBinaryConverter
      },
      {
        name: "Binary to Morse Code",
        slug: "binary-to-morse-code",
        icon: <MdCode />,
        desc: "Convert Binary data to Morse code representation.",
        code: "BinaryToMorseCode",
        // seo: SeoDataImport.BinaryToMorseCodeConverter
      },
      {
        name: "Morse Code to Binary",
        slug: "morse-code-to-binary",
        icon: <MdCode />,
        desc: "Transform Morse code into Binary format.",
        code: "MorseCodeToBinary",
        // seo: SeoDataImport.MorseCodeToBinaryConverter
      },
      {
        name: "Binary AND Calculator",
        slug: "binary-and-calculator",
        icon: <MdCalculate />,
        desc: "Perform AND operation on Binary values.",
        code: "BinaryANDCalculator",
        // seo: SeoDataImport.BinaryANDCalculator
      },
      {
        name: "Binary OR Calculator",
        slug: "binary-or-calculator",
        icon: <MdCalculate />,
        desc: "Perform OR operation on Binary values.",
        code: "BinaryORCalculator",
        // seo: SeoDataImport.BinaryORCalculator
      },
      {
        name: "Binary NOT Calculator",
        slug: "binary-not-calculator",
        icon: <MdCalculate />,
        desc: "Perform NOT operation (inversion) on Binary values.",
        code: "BinaryNOTCalculator",
        // seo: SeoDataImport.BinaryNOTCalculator
      },
      {
        name: "Binary NAND Calculator",
        slug: "binary-nand-calculator",
        icon: <MdCalculate />,
        desc: "Perform NAND operation on Binary values.",
        code: "BinaryNANDCalculator",
        // seo: SeoDataImport.BinaryNANDCalculator
      },
      {
        name: "Binary NOR Calculator",
        slug: "binary-nor-calculator",
        icon: <MdCalculate />,
        desc: "Perform NOR operation on Binary values.",
        code: "BinaryNORCalculator",
        // seo: SeoDataImport.BinaryNORCalculator
      },
      {
        name: "Binary XNOR Calculator",
        slug: "binary-xnor-calculator",
        icon: <MdCalculate />,
        desc: "Perform XNOR operation on Binary values.",
        code: "BinaryXNORCalculator",
        // seo: SeoDataImport.BinaryXNORCalculator
      },
      {
        name: "Binary Shift Left",
        slug: "binary-shift-left",
        icon: <MdTransform />,
        desc: "Shift Binary bits to the left by a specified amount.",
        code: "BinaryShiftLeft",
        // seo: SeoDataImport.BinaryShiftLeftConverter
      },
      {
        name: "Binary Shift Right",
        slug: "binary-shift-right",
        icon: <MdTransform />,
        desc: "Shift Binary bits to the right by a specified amount.",
        code: "BinaryShiftRight",
        // seo: SeoDataImport.BinaryShiftRightConverter
      },
      {
        name: "Binary to Two's Complement",
        slug: "binary-to-twos-complement",
        icon: <MdTransform />,
        desc: "Convert Binary to Two's Complement notation.",
        code: "BinaryToTwosComplement",
        // seo: SeoDataImport.BinaryToTwosComplementConverter
      },
      {
        name: "Two's Complement to Binary",
        slug: "twos-complement-to-binary",
        icon: <MdTransform />,
        desc: "Convert Two's Complement notation back to Binary.",
        code: "TwosComplementToBinary",
        // seo: SeoDataImport.TwosComplementToBinaryConverter
      },
      {
        name: "Binary Addition Calculator",
        slug: "binary-addition-calculator",
        icon: <MdCalculate />,
        desc: "Add two Binary numbers together.",
        code: "BinaryAdditionCalculator",
        // seo: SeoDataImport.BinaryAdditionCalculator
      },
      {
        name: "Binary Subtraction Calculator",
        slug: "binary-subtraction-calculator",
        icon: <MdCalculate />,
        desc: "Subtract one Binary number from another.",
        code: "BinarySubtractionCalculator",
        // seo: SeoDataImport.BinarySubtractionCalculator
      },
      {
        name: "Binary Multiplication Calculator",
        slug: "binary-multiplication-calculator",
        icon: <MdCalculate />,
        desc: "Multiply two Binary numbers.",
        code: "BinaryMultiplicationCalculator",
        // seo: SeoDataImport.BinaryMultiplicationCalculator
      },
      {
        name: "Binary Division Calculator",
        slug: "binary-division-calculator",
        icon: <MdCalculate />,
        desc: "Divide one Binary number by another.",
        code: "BinaryDivisionCalculator",
        // seo: SeoDataImport.BinaryDivisionCalculator
      },
      {
        name: "Binary to Signed Integer",
        slug: "binary-to-signed-integer",
        icon: <MdTransform />,
        desc: "Convert Binary to a signed integer value.",
        code: "BinaryToSignedInteger",
        // seo: SeoDataImport.BinaryToSignedIntegerConverter
      },
      {
        name: "Signed Integer to Binary",
        slug: "signed-integer-to-binary",
        icon: <MdTransform />,
        desc: "Convert a signed integer to Binary format.",
        code: "SignedIntegerToBinary",
        // seo: SeoDataImport.SignedIntegerToBinaryConverter
      },
      {
        name: "Binary to IEEE 754",
        slug: "binary-to-ieee-754",
        icon: <MdTransform />,
        desc: "Convert Binary to IEEE 754 floating-point representation.",
        code: "BinaryToIEEE754",
        seo: SeoDataImport.BinaryToIEEE754Converter
      },
      {
        name: "IEEE 754 to Binary",
        slug: "ieee-754-to-binary",
        icon: <MdTransform />,
        desc: "Convert IEEE 754 floating-point to Binary format.",
        code: "IEEE754ToBinary",
        seo: SeoDataImport.IEEE754ToBinaryConverter
      },
      {
        name: "Binary to Hamming Code",
        slug: "binary-to-hamming-code",
        icon: <MdSecurity />,
        desc: "Convert Binary data to Hamming Code for error detection.",
        code: "BinaryToHammingCode",
        // seo: SeoDataImport.BinaryToHammingCodeConverter
      },
      {
        name: "Hamming Code to Binary",
        slug: "hamming-code-to-binary",
        icon: <MdSecurity />,
        desc: "Decode Hamming Code back to Binary format.",
        code: "HammingCodeToBinary",
        // seo: SeoDataImport.HammingCodeToBinaryConverter
      },
      {
        name: "Binary to Excess-3",
        slug: "binary-to-excess-3",
        icon: <MdTransform />,
        desc: "Convert Binary to Excess-3 code format.",
        code: "BinaryToExcess3",
        // seo: SeoDataImport.BinaryToExcess3Converter
      },
      {
        name: "Excess-3 to Binary",
        slug: "excess-3-to-binary",
        icon: <MdTransform />,
        desc: "Convert Excess-3 code back to Binary format.",
        code: "Excess3ToBinary",
        // seo: SeoDataImport.Excess3ToBinaryConverter
      },
      {
        name: "Binary to Hexadecimal Dump",
        slug: "binary-to-hexadecimal-dump",
        icon: <MdCode />,
        desc: "Generate a hexadecimal dump from Binary data.",
        code: "BinaryToHexadecimalDump",
        // seo: SeoDataImport.BinaryToHexadecimalDumpConverter
      },
      {
        name: "Binary to Bitwise String",
        slug: "binary-to-bitwise-string",
        icon: <MdCode />,
        desc: "Convert Binary data to a bitwise string representation.",
        code: "BinaryToBitwiseString",
        // seo: SeoDataImport.BinaryToBitwiseStringConverter
      },
      {
        name: "Bitwise String to Binary",
        slug: "bitwise-string-to-binary",
        icon: <MdCode />,
        desc: "Convert a bitwise string back to Binary format.",
        code: "BitwiseStringToBinary",
        // seo: SeoDataImport.BitwiseStringToBinaryConverter
      },
      {
        name: "Binary to QR Code",
        slug: "binary-to-qr-code",
        icon: <MdQrCode2 />,
        desc: "Generate a QR code from Binary data.",
        code: "BinaryToQRCode",
        // seo: SeoDataImport.BinaryToQRCodeConverter
      },
      {
        name: "QR Code to Binary",
        slug: "qr-code-to-binary",
        icon: <MdQrCode2 />,
        desc: "Decode a QR code into Binary format.",
        code: "QRCodeToBinary",
        // seo: SeoDataImport.QRCodeToBinaryConverter
      },
      {
        name: "Binary to Bit Array",
        slug: "binary-to-bit-array",
        icon: <MdCode />,
        desc: "Convert Binary data into a bit array representation.",
        code: "BinaryToBitArray",
        // seo: SeoDataImport.BinaryToBitArrayConverter
      },
      {
        name: "Bit Array to Binary",
        slug: "bit-array-to-binary",
        icon: <MdCode />,
        desc: "Convert a bit array back to Binary format.",
        code: "BitArrayToBinary",
        // seo: SeoDataImport.BitArrayToBinaryConverter
      },
      {
        name: "Binary to Binary String",
        slug: "binary-to-binary-string",
        icon: <MdTextFields />,
        desc: "Convert Binary data to a readable binary string (e.g., '0101').",
        code: "BinaryToBinaryString",
        // seo: SeoDataImport.BinaryToBinaryStringConverter
      },
      {
        name: "Binary String to Binary",
        slug: "binary-string-to-binary",
        icon: <MdTextFields />,
        desc: "Convert a binary string back to Binary format.",
        code: "BinaryStringToBinary",
        // seo: SeoDataImport.BinaryStringToBinaryConverter
      },
      {
        name: "Binary to Checksum",
        slug: "binary-to-checksum",
        icon: <MdSecurity />,
        desc: "Generate a checksum from Binary data.",
        code: "BinaryToChecksum",
        // seo: SeoDataImport.BinaryToChecksumConverter
      },
      {
        name: "Binary Bit Counter",
        slug: "binary-bit-counter",
        icon: <MdCalculate />,
        desc: "Count the number of 1s and 0s in Binary data.",
        code: "BinaryBitCounter",
        // seo: SeoDataImport.BinaryBitCounter
      },
      {
        name: "Binary to Bitwise Mask",
        slug: "binary-to-bitwise-mask",
        icon: <MdCode />,
        desc: "Generate a bitwise mask from Binary data.",
        code: "BinaryToBitwiseMask",
        // seo: SeoDataImport.BinaryToBitwiseMaskConverter
      },
      {
        name: "Binary Parity Checker",
        slug: "binary-parity-checker",
        icon: <MdSecurity />,
        desc: "Calculate parity (odd/even) of Binary data.",
        code: "BinaryParityChecker",
        // seo: SeoDataImport.BinaryParityChecker
      },
      {
        name: "Binary to Run-Length Encoding",
        slug: "binary-to-run-length-encoding",
        icon: <MdTransform />,
        desc: "Convert Binary data to Run-Length Encoding format.",
        code: "BinaryToRunLengthEncoding",
        // seo: SeoDataImport.BinaryToRunLengthEncodingConverter
      },
      {
        name: "Run-Length Encoding to Binary",
        slug: "run-length-encoding-to-binary",
        icon: <MdTransform />,
        desc: "Decode Run-Length Encoded data back to Binary.",
        code: "RunLengthEncodingToBinary",
        // seo: SeoDataImport.RunLengthEncodingToBinaryConverter
      },
      {
        name: "Binary to ASCII85",
        slug: "binary-to-ascii85",
        icon: <MdTransform />,
        desc: "Convert Binary data to ASCII85 encoding.",
        code: "BinaryToASCII85",
        // seo: SeoDataImport.BinaryToASCII85Converter
      },
      {
        name: "ASCII85 to Binary",
        slug: "ascii85-to-binary",
        icon: <MdTransform />,
        desc: "Decode ASCII85 data back to Binary format.",
        code: "ASCII85ToBinary",
        // seo: SeoDataImport.ASCII85ToBinaryConverter
      },
      {
        name: "Binary to Bitwise AND",
        slug: "binary-to-bitwise-and",
        icon: <MdCalculate />,
        desc: "Perform bitwise AND on multiple Binary inputs.",
        code: "BinaryToBitwiseAND",
        // seo: SeoDataImport.BinaryToBitwiseANDConverter
      },
      {
        name: "Binary to Bitwise OR",
        slug: "binary-to-bitwise-or",
        icon: <MdCalculate />,
        desc: "Perform bitwise OR on multiple Binary inputs.",
        code: "BinaryToBitwiseOR",
        // seo: SeoDataImport.BinaryToBitwiseORConverter
      },
      {
        name: "Binary Bitwise Inverter",
        slug: "binary-bitwise-inverter",
        icon: <MdTransform />,
        desc: "Invert all bits in a Binary number (NOT operation).",
        code: "BinaryBitwiseInverter",
        // seo: SeoDataImport.BinaryBitwiseInverter
      },
      {
        name: "Binary to Hexadecimal String",
        slug: "binary-to-hexadecimal-string",
        icon: <MdCode />,
        desc: "Convert Binary to a hexadecimal string representation.",
        code: "BinaryToHexadecimalString",
        // seo: SeoDataImport.BinaryToHexadecimalStringConverter
      },
      {
        name: "Binary Bit Rotator",
        slug: "binary-bit-rotator",
        icon: <MdTransform />,
        desc: "Rotate bits in a Binary number left or right.",
        code: "BinaryBitRotator",
        // seo: SeoDataImport.BinaryBitRotator
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
        seo: SeoDataImport.MolecularWeightCalculator,
      },
      {
        name: "Physics Unit Converter",
        slug: "physics-unit-converter",
        icon: <MdScience />,
        desc: "Convert between different physics units for length, mass, energy, and more.",
        code: "PhysicsUnitConverter",
        seo: SeoDataImport.PhysicsUnitConverter,
      },
    
      {
        name: "Astronomical Unit Converter",
        slug: "astronomical-unit-converter",
        icon: <MdScience />,
        desc: "Convert astronomical units such as light-years, parsecs, and AU.",
        code: "AstronomicalUnitConverter",
        seo: SeoDataImport.AstronomicalUnitConverter,
      },
      {
        name: "Periodic Table Explorer",
        slug: "periodic-table-explorer",
        icon: <MdScience />,
        desc: "Explore detailed information about elements in the periodic table.",
        code: "PeriodicTableExplorer",
        seo: SeoDataImport.PeriodicTableExplorer,
      },
      // New 50 Science Tools
      {
        name: "Chemical Equation Balancer",
        slug: "chemical-equation-balancer",
        icon: <MdScience />,
        desc: "Balance chemical equations automatically for accurate reactions.",
        code: "ChemicalEquationBalancer",
        // seo: SeoDataImport.ChemicalEquationBalancer, 
      },
      {
        name: "Molarity Calculator",
        slug: "molarity-calculator",
        icon: <MdBiotech />,
        desc: "Calculate the molarity of a solution based on moles and volume.",
        code: "MolarityCalculator",
        // seo: SeoDataImport.MolarityCalculator
      },
      {
        name: "pH Calculator",
        slug: "ph-calculator",
        icon: <MdScience />,
        desc: "Determine the pH of a solution from hydrogen ion concentration.",
        code: "PHCalculator",
        // seo: SeoDataImport.PHCalculator
      },
      {
        name: "Ideal Gas Law Calculator",
        slug: "ideal-gas-law-calculator",
        icon: <MdScience />,
        desc: "Solve for pressure, volume, temperature, or moles using the ideal gas law.",
        code: "IdealGasLawCalculator",
        // seo: SeoDataImport.IdealGasLawCalculator
      },
      {
        name: "Kinetic Energy Calculator",
        slug: "kinetic-energy-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the kinetic energy of an object based on mass and velocity.",
        code: "KineticEnergyCalculator",
        // seo: SeoDataImport.KineticEnergyCalculator
      },
      {
        name: "Gravitational Force Calculator",
        slug: "gravitational-force-calculator",
        icon: <MdScience />,
        desc: "Compute gravitational force between two masses using Newton's law.",
        code: "GravitationalForceCalculator",
        // seo: SeoDataImport.GravitationalForceCalculator
      },
      {
        name: "Half-Life Calculator",
        slug: "half-life-calculator",
        icon: <MdScience />,
        desc: "Calculate the half-life of a radioactive substance.",
        code: "HalfLifeCalculator",
        // seo: SeoDataImport.HalfLifeCalculator
      },
      {
        name: "Density Calculator",
        slug: "density-calculator",
        icon: <MdScience />,
        desc: "Determine the density of an object from mass and volume.",
        code: "DensityCalculator",
        // seo: SeoDataImport.DensityCalculator
      },
      {
        name: "Wave Speed Calculator",
        slug: "wave-speed-calculator",
        icon: <MdScience />,
        desc: "Calculate wave speed using frequency and wavelength.",
        code: "WaveSpeedCalculator",
        // seo: SeoDataImport.WaveSpeedCalculator
      },
      {
        name: "Ohm's Law Calculator",
        slug: "ohms-law-calculator",
        icon: <MdElectricBolt />,
        desc: "Solve for voltage, current, or resistance using Ohm's Law.",
        code: "OhmsLawCalculator",
        // seo: SeoDataImport.OhmsLawCalculator
      },
      {
        name: "Heat Transfer Calculator",
        slug: "heat-transfer-calculator",
        icon: <MdScience />,
        desc: "Calculate heat transfer based on mass, specific heat, and temperature change.",
        code: "HeatTransferCalculator",
        // seo: SeoDataImport.HeatTransferCalculator
      },
      {
        name: "Photon Energy Calculator",
        slug: "photon-energy-calculator",
        icon: <MdScience />,
        desc: "Compute the energy of a photon from its wavelength or frequency.",
        code: "PhotonEnergyCalculator",
        // seo: SeoDataImport.PhotonEnergyCalculator
      },
      {
        name: "Star Brightness Calculator",
        slug: "star-brightness-calculator",
        icon: <MdStar />,
        desc: "Calculate apparent and absolute magnitude of stars.",
        code: "StarBrightnessCalculator",
        // seo: SeoDataImport.StarBrightnessCalculator
      },
      {
        name: "Orbital Period Calculator",
        slug: "orbital-period-calculator",
        icon: <MdScience />,
        desc: "Determine the orbital period of a celestial body.",
        code: "OrbitalPeriodCalculator",
        // seo: SeoDataImport.OrbitalPeriodCalculator
      },
      {
        name: "Stoichiometry Calculator",
        slug: "stoichiometry-calculator",
        icon: <MdBiotech />,
        desc: "Calculate reactant and product amounts in chemical reactions.",
        code: "StoichiometryCalculator",
        // seo: SeoDataImport.StoichiometryCalculator
      },
      {
        name: "Dilution Calculator",
        slug: "dilution-calculator",
        icon: <MdScience />,
        desc: "Calculate concentrations and volumes for solution dilutions.",
        code: "DilutionCalculator",
        // seo: SeoDataImport.DilutionCalculator
      },
      {
        name: "Electric Field Calculator",
        slug: "electric-field-calculator",
        icon: <MdElectricBolt />,
        desc: "Compute electric field strength from charge and distance.",
        code: "ElectricFieldCalculator",
        // seo: SeoDataImport.ElectricFieldCalculator
      },
      {
        name: "Magnetic Field Calculator",
        slug: "magnetic-field-calculator",
        icon: <MdScience />,
        desc: "Calculate magnetic field strength from current and distance.",
        code: "MagneticFieldCalculator",
        // seo: SeoDataImport.MagneticFieldCalculator
      },
      {
        name: "Pressure Converter",
        slug: "pressure-converter",
        icon: <MdScience />,
        desc: "Convert between pressure units like pascal, atm, and psi.",
        code: "PressureConverter",
        // seo: SeoDataImport.PressureConverter
      },
      {
        name: "Velocity Calculator",
        slug: "velocity-calculator",
        icon: <MdCalculate />,
        desc: "Calculate velocity from distance and time.",
        code: "VelocityCalculator",
        // seo: SeoDataImport.VelocityCalculator
      },
      {
        name: "Acceleration Calculator",
        slug: "acceleration-calculator",
        icon: <MdCalculate />,
        desc: "Determine acceleration from velocity and time.",
        code: "AccelerationCalculator",
        // seo: SeoDataImport.AccelerationCalculator
      },
      {
        name: "Titrator Simulator",
        slug: "titrator-simulator",
        icon: <MdBiotech />,
        desc: "Simulate titration processes to find equivalence points.",
        code: "TitratorSimulator",
        // seo: SeoDataImport.TitratorSimulator
      },
      {
        name: "Planck's Constant Calculator",
        slug: "plancks-constant-calculator",
        icon: <MdScience />,
        desc: "Calculate energy using Planck’s constant and frequency.",
        code: "PlancksConstantCalculator",
        // seo: SeoDataImport.PlancksConstantCalculator
      },
      {
        name: "Nuclear Decay Simulator",
        slug: "nuclear-decay-simulator",
        icon: <MdScience />,
        desc: "Simulate radioactive decay over time.",
        code: "NuclearDecaySimulator",
        // seo: SeoDataImport.NuclearDecaySimulator
      },
      {
        name: "Gas Volume Calculator",
        slug: "gas-volume-calculator",
        icon: <MdScience />,
        desc: "Calculate gas volume using temperature and pressure.",
        code: "GasVolumeCalculator",
        // seo: SeoDataImport.GasVolumeCalculator
      },
      {
        name: "Thermodynamic Efficiency Calculator",
        slug: "thermodynamic-efficiency-calculator",
        icon: <MdScience />,
        desc: "Calculate efficiency of thermodynamic cycles.",
        code: "ThermodynamicEfficiencyCalculator",
        // seo: SeoDataImport.ThermodynamicEfficiencyCalculator
      },
      {
        name: "Lens Focal Length Calculator",
        slug: "lens-focal-length-calculator",
        icon: <MdScience />,
        desc: "Determine focal length of lenses in optical systems.",
        code: "LensFocalLengthCalculator",
        // seo: SeoDataImport.LensFocalLengthCalculator
      },
      {
        name: "Wave Interference Simulator",
        slug: "wave-interference-simulator",
        icon: <MdScience />,
        desc: "Simulate interference patterns of waves.",
        code: "WaveInterferenceSimulator",
        // seo: SeoDataImport.WaveInterferenceSimulator
      },
      {
        name: "Quantum Energy Level Calculator",
        slug: "quantum-energy-level-calculator",
        icon: <MdScience />,
        desc: "Calculate energy levels in quantum systems.",
        code: "QuantumEnergyLevelCalculator",
        // seo: SeoDataImport.QuantumEnergyLevelCalculator
      },
      {
        name: "Reaction Rate Calculator",
        slug: "reaction-rate-calculator",
        icon: <MdBiotech />,
        desc: "Compute the rate of chemical reactions.",
        code: "ReactionRateCalculator",
        // seo: SeoDataImport.ReactionRateCalculator
      },
      {
        name: "Centripetal Force Calculator",
        slug: "centripetal-force-calculator",
        icon: <MdCalculate />,
        desc: "Calculate centripetal force for circular motion.",
        code: "CentripetalForceCalculator",
        // seo: SeoDataImport.CentripetalForceCalculator
      },
      {
        name: "Planet Gravity Simulator",
        slug: "planet-gravity-simulator",
        icon: <MdStar />,
        desc: "Simulate gravitational acceleration on different planets.",
        code: "PlanetGravitySimulator",
        // seo: SeoDataImport.PlanetGravitySimulator
      },
      {
        name: "Sound Speed Calculator",
        slug: "sound-speed-calculator",
        icon: <MdVolumeUp />,
        desc: "Calculate the speed of sound in various mediums.",
        code: "SoundSpeedCalculator",
        // seo: SeoDataImport.SoundSpeedCalculator
      },
      {
        name: "Light Refraction Simulator",
        slug: "light-refraction-simulator",
        icon: <MdScience />,
        desc: "Simulate light refraction through different materials.",
        code: "LightRefractionSimulator",
        // seo: SeoDataImport.LightRefractionSimulator
      },
      {
        name: "Electromagnetic Spectrum Converter",
        slug: "electromagnetic-spectrum-converter",
        icon: <MdScience />,
        desc: "Convert between wavelength, frequency, and energy of EM waves.",
        code: "ElectromagneticSpectrumConverter",
        // seo: SeoDataImport.ElectromagneticSpectrumConverter
      },
      {
        name: "Protein Mass Calculator",
        slug: "protein-mass-calculator",
        icon: <MdBiotech />,
        desc: "Calculate the mass of proteins from amino acid sequences.",
        code: "ProteinMassCalculator",
        // seo: SeoDataImport.ProteinMassCalculator
      },
      {
        name: "Osmotic Pressure Calculator",
        slug: "osmotic-pressure-calculator",
        icon: <MdScience />,
        desc: "Compute osmotic pressure of solutions.",
        code: "OsmoticPressureCalculator",
        // seo: SeoDataImport.OsmoticPressureCalculator
      },
      {
        name: "Kinetic Molecular Theory Simulator",
        slug: "kinetic-molecular-theory-simulator",
        icon: <MdScience />,
        desc: "Simulate gas particle behavior using kinetic theory.",
        code: "KineticMolecularTheorySimulator",
        // seo: SeoDataImport.KineticMolecularTheorySimulator
      },
      {
        name: "Planetary Orbit Simulator",
        slug: "planetary-orbit-simulator",
        icon: <MdStar />,
        desc: "Simulate orbits of planets around a star.",
        code: "PlanetaryOrbitSimulator",
        // seo: SeoDataImport.PlanetaryOrbitSimulator
      },
      {
        name: "Heat Capacity Calculator",
        slug: "heat-capacity-calculator",
        icon: <MdScience />,
        desc: "Calculate heat capacity of materials.",
        code: "HeatCapacityCalculator",
        // seo: SeoDataImport.HeatCapacityCalculator
      },
      {
        name: "Fluid Dynamics Simulator",
        slug: "fluid-dynamics-simulator",
        icon: <MdScience />,
        desc: "Simulate fluid flow and pressure dynamics.",
        code: "FluidDynamicsSimulator",
        // seo: SeoDataImport.FluidDynamicsSimulator
      },
      {
        name: "Atomic Mass Calculator",
        slug: "atomic-mass-calculator",
        icon: <MdScience />,
        desc: "Calculate atomic mass from isotopic composition.",
        code: "AtomicMassCalculator",
        // seo: SeoDataImport.AtomicMassCalculator
      },
      {
        name: "Doppler Effect Calculator",
        slug: "doppler-effect-calculator",
        icon: <MdScience />,
        desc: "Calculate frequency shift due to the Doppler effect.",
        code: "DopplerEffectCalculator",
        // seo: SeoDataImport.DopplerEffectCalculator
      },
      {
        name: "Thermal Expansion Calculator",
        slug: "thermal-expansion-calculator",
        icon: <MdScience />,
        desc: "Calculate material expansion due to temperature change.",
        code: "ThermalExpansionCalculator",
        // seo: SeoDataImport.ThermalExpansionCalculator
      },
      {
        name: "Nuclear Binding Energy Calculator",
        slug: "nuclear-binding-energy-calculator",
        icon: <MdScience />,
        desc: "Compute the binding energy of atomic nuclei.",
        code: "NuclearBindingEnergyCalculator",
        // seo: SeoDataImport.NuclearBindingEnergyCalculator
      },
      {
        name: "Capacitance Calculator",
        slug: "capacitance-calculator",
        icon: <MdElectricBolt />,
        desc: "Calculate capacitance in electrical circuits.",
        code: "CapacitanceCalculator",
        // seo: SeoDataImport.CapacitanceCalculator
      },
      {
        name: "Particle Collision Simulator",
        slug: "particle-collision-simulator",
        icon: <MdScience />,
        desc: "Simulate collisions between particles with momentum conservation.",
        code: "ParticleCollisionSimulator",
        // seo: SeoDataImport.ParticleCollisionSimulator
      },
      {
        name: "Vapor Pressure Calculator",
        slug: "vapor-pressure-calculator",
        icon: <MdScience />,
        desc: "Calculate vapor pressure of liquids at different temperatures.",
        code: "VaporPressureCalculator",
        // seo: SeoDataImport.VaporPressureCalculator
      },
      {
        name: "Quantum Wavefunction Simulator",
        slug: "quantum-wavefunction-simulator",
        icon: <MdScience />,
        desc: "Simulate quantum wavefunctions for simple systems.",
        code: "QuantumWavefunctionSimulator",
        // seo: SeoDataImport.QuantumWavefunctionSimulator
      },
      {
        name: "Entropy Calculator",
        slug: "entropy-calculator",
        icon: <MdScience />,
        desc: "Calculate entropy changes in thermodynamic processes.",
        code: "EntropyCalculator",
        // seo: SeoDataImport.EntropyCalculator
      },
      {
        name: "Black Hole Event Horizon Calculator",
        slug: "black-hole-event-horizon-calculator",
        icon: <MdStar />,
        desc: "Calculate the event horizon radius of a black hole.",
        code: "BlackHoleEventHorizonCalculator",
        // seo: SeoDataImport.BlackHoleEventHorizonCalculator
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
        seo: SeoDataImport.PasswordStrengthChecker,
      },
      {
        name: "Email Validator",
        slug: "email-validator",
        icon: <MdSecurity />,
        desc: "Check if an email address is valid, properly formatted, and exists.",
        code: "EmailValidator",
        seo: SeoDataImport.EmailValidator,
      },
      // New 50 Security Tools
      {
        name: "Password Generator",
        slug: "password-generator",
        icon: <MdLock />,
        desc: "Generate strong, random passwords with customizable options.",
        code: "PasswordGenerator",
        // seo: SeoDataImport.PasswordGenerator
      },
      {
        name: "Encryption Tool",
        slug: "encryption-tool",
        icon: <MdLock />,
        desc: "Encrypt text or files using various algorithms like AES or RSA.",
        code: "EncryptionTool",
        // seo: SeoDataImport.EncryptionTool
      },
      {
        name: "Decryption Tool",
        slug: "decryption-tool",
        icon: <MdLockOpen />,
        desc: "Decrypt encrypted text or files with the correct key.",
        code: "DecryptionTool",
        // seo: SeoDataImport.DecryptionTool
      },
      {
        name: "Hash Generator",
        slug: "hash-generator",
        icon: <MdFingerprint />,
        desc: "Create hashes (e.g., MD5, SHA) from text or files.",
        code: "HashGenerator",
        // seo: SeoDataImport.HashGenerator
      },
      {
        name: "Hash Verifier",
        slug: "hash-verifier",
        icon: <MdFingerprint />,
        desc: "Verify the integrity of data by comparing hash values.",
        code: "HashVerifier",
        // seo: SeoDataImport.HashVerifier
      },
      {
        name: "SSL Certificate Checker",
        slug: "ssl-certificate-checker",
        icon: <MdSecurity />,
        desc: "Validate SSL certificates for domains and check expiration.",
        code: "SSLCertificateChecker",
        // seo: SeoDataImport.SSLCertificateChecker
      },
      {
        name: "IP Address Scanner",
        slug: "ip-address-scanner",
        icon: <MdNetworkCheck />,
        desc: "Scan IP addresses for open ports and vulnerabilities.",
        code: "IPAddressScanner",
        // seo: SeoDataImport.IPAddressScanner
      },
      {
        name: "URL Security Checker",
        slug: "url-security-checker",
        icon: <MdLink />,
        desc: "Analyze URLs for potential phishing or malicious content.",
        code: "URLSecurityChecker",
        // seo: SeoDataImport.URLSecurityChecker
      },
      {
        name: "Two-Factor Authentication Generator",
        slug: "two-factor-authentication-generator",
        icon: <MdVpnKey />,
        desc: "Generate time-based one-time passwords (TOTP) for 2FA.",
        code: "TwoFactorAuthenticationGenerator",
        // seo: SeoDataImport.TwoFactorAuthenticationGenerator
      },
      {
        name: "JWT Decoder",
        slug: "jwt-decoder",
        icon: <MdSecurity />,
        desc: "Decode JSON Web Tokens to inspect their payload.",
        code: "JWTDecoder",
        // seo: SeoDataImport.JWTDecoder
      },
      {
        name: "JWT Generator",
        slug: "jwt-generator",
        icon: <MdSecurity />,
        desc: "Create JSON Web Tokens for secure authentication.",
        code: "JWTGenerator",
        // seo: SeoDataImport.JWTGenerator
      },
      {
        name: "File Encryption Tool",
        slug: "file-encryption-tool",
        icon: <MdLock />,
        desc: "Encrypt files with strong encryption algorithms.",
        code: "FileEncryptionTool",
        // seo: SeoDataImport.FileEncryptionTool
      },
      {
        name: "File Decryption Tool",
        slug: "file-decryption-tool",
        icon: <MdLockOpen />,
        desc: "Decrypt encrypted files with the appropriate key.",
        code: "FileDecryptionTool",
        // seo: SeoDataImport.FileDecryptionTool
      },
      {
        name: "API Key Generator",
        slug: "api-key-generator",
        icon: <MdVpnKey />,
        desc: "Generate secure API keys for application authentication.",
        code: "APIKeyGenerator",
        // seo: SeoDataImport.APIKeyGenerator
      },
      {
        name: "Secure Random Number Generator",
        slug: "secure-random-number-generator",
        icon: <MdSecurity />,
        desc: "Generate cryptographically secure random numbers.",
        code: "SecureRandomNumberGenerator",
        // seo: SeoDataImport.SecureRandomNumberGenerator
      },
      {
        name: "XSS Vulnerability Tester",
        slug: "xss-vulnerability-tester",
        icon: <MdBugReport />,
        desc: "Test websites for cross-site scripting vulnerabilities.",
        code: "XSSVulnerabilityTester",
        // seo: SeoDataImport.XSSVulnerabilityTester
      },
      {
        name: "SQL Injection Tester",
        slug: "sql-injection-tester",
        icon: <MdBugReport />,
        desc: "Check for SQL injection vulnerabilities in queries.",
        code: "SQLInjectionTester",
        // seo: SeoDataImport.SQLInjectionTester
      },
      {
        name: "Password Hash Generator",
        slug: "password-hash-generator",
        icon: <MdFingerprint />,
        desc: "Generate secure password hashes using bcrypt or similar.",
        code: "PasswordHashGenerator",
        // seo: SeoDataImport.PasswordHashGenerator
      },
      {
        name: "Password Hash Verifier",
        slug: "password-hash-verifier",
        icon: <MdFingerprint />,
        desc: "Verify passwords against stored hashes.",
        code: "PasswordHashVerifier",
        // seo: SeoDataImport.PasswordHashVerifier
      },
      {
        name: "ROT13 Encoder",
        slug: "rot13-encoder",
        icon: <MdSecurity />,
        desc: "Encode text using the ROT13 cipher for basic obfuscation.",
        code: "ROT13Encoder",
        // seo: SeoDataImport.ROT13Encoder
      },
      {
        name: "ROT13 Decoder",
        slug: "rot13-decoder",
        icon: <MdSecurity />,
        desc: "Decode ROT13-encoded text back to plain text.",
        code: "ROT13Decoder",
        // seo: SeoDataImport.ROT13Decoder
      },
      {
        name: "Base64 File Encoder",
        slug: "base64-file-encoder",
        icon: <MdSecurity />,
        desc: "Encode files into Base64 format for secure transfer.",
        code: "Base64FileEncoder",
        // seo: SeoDataImport.Base64FileEncoder
      },
      {
        name: "Base64 File Decoder",
        slug: "base64-file-decoder",
        icon: <MdSecurity />,
        desc: "Decode Base64-encoded files back to their original form.",
        code: "Base64FileDecoder",
        // seo: SeoDataImport.Base64FileDecoder
      },
      {
        name: "Digital Signature Generator",
        slug: "digital-signature-generator",
        icon: <MdDraw />,
        desc: "Create digital signatures for document authenticity.",
        code: "DigitalSignatureGenerator",
        // seo: SeoDataImport.DigitalSignatureGenerator
      },
      {
        name: "Digital Signature Verifier",
        slug: "digital-signature-verifier",
        icon: <MdDraw />,
        desc: "Verify the authenticity of digital signatures.",
        code: "DigitalSignatureVerifier",
        // seo: SeoDataImport.DigitalSignatureVerifier
      },
      {
        name: "Token Generator",
        slug: "token-generator",
        icon: <MdVpnKey />,
        desc: "Generate secure tokens for session management or APIs.",
        code: "TokenGenerator",
        // seo: SeoDataImport.TokenGenerator
      },
      {
        name: "Token Validator",
        slug: "token-validator",
        icon: <MdVpnKey />,
        desc: "Validate security tokens for authenticity and expiration.",
        code: "TokenValidator",
        // seo: SeoDataImport.TokenValidator
      },
      {
        name: "Secure File Shredder",
        slug: "secure-file-shredder",
        icon: <MdDeleteForever />,
        desc: "Permanently delete files with secure overwriting.",
        code: "SecureFileShredder",
        // seo: SeoDataImport.SecureFileShredder
      },
      {
        name: "Firewall Rule Tester",
        slug: "firewall-rule-tester",
        icon: <MdSecurity />,
        desc: "Test firewall rules for effectiveness and gaps.",
        code: "FirewallRuleTester",
        // seo: SeoDataImport.FirewallRuleTester
      },
      {
        name: "CSRF Token Generator",
        slug: "csrf-token-generator",
        icon: <MdSecurity />,
        desc: "Generate CSRF tokens to prevent cross-site request forgery.",
        code: "CSRFTokenGenerator",
        // seo: SeoDataImport.CSRFTokenGenerator
      },
      {
        name: "OAuth Token Generator",
        slug: "oauth-token-generator",
        icon: <MdVpnKey />,
        desc: "Generate OAuth tokens for secure API access.",
        code: "OAuthTokenGenerator",
        seo: SeoDataImport.OAuthTokenGenerator
      },
      {
        name: "Password Entropy Calculator",
        slug: "password-entropy-calculator",
        icon: <MdSecurity />,
        desc: "Calculate the entropy of passwords to assess security.",
        code: "PasswordEntropyCalculator",
        // seo: SeoDataImport.PasswordEntropyCalculator
      },
      {
        name: "Brute Force Time Estimator",
        slug: "brute-force-time-estimator",
        icon: <MdTimer />,
        desc: "Estimate time to brute-force crack a password.",
        code: "BruteForceTimeEstimator",
        // seo: SeoDataImport.BruteForceTimeEstimator
      },
      {
        name: "MAC Address Validator",
        slug: "mac-address-validator",
        icon: <MdNetworkCheck />,
        desc: "Validate MAC addresses for correct format and uniqueness.",
        code: "MACAddressValidator",
        // seo: SeoDataImport.MACAddressValidator
      },
      {
        name: "Secure Email Header Analyzer",
        slug: "secure-email-header-analyzer",
        icon: <MdEmail />,
        desc: "Analyze email headers for security and authenticity.",
        code: "SecureEmailHeaderAnalyzer",
        // seo: SeoDataImport.SecureEmailHeaderAnalyzer
      },
      {
        name: "Checksum Generator",
        slug: "checksum-generator",
        icon: <MdFingerprint />,
        desc: "Generate checksums for data integrity verification.",
        code: "ChecksumGenerator",
        // seo: SeoDataImport.ChecksumGenerator
      },
      {
        name: "Checksum Verifier",
        slug: "checksum-verifier",
        icon: <MdFingerprint />,
        desc: "Verify data integrity using checksum comparisons.",
        code: "ChecksumVerifier",
        // seo: SeoDataImport.ChecksumVerifier
      },
      {
        name: "Vulnerability Scanner",
        slug: "vulnerability-scanner",
        icon: <MdBugReport />,
        desc: "Scan systems or code for common security vulnerabilities.",
        code: "VulnerabilityScanner",
        // seo: SeoDataImport.VulnerabilityScanner
      },
      {
        name: "Secure QR Code Generator",
        slug: "secure-qr-code-generator",
        icon: <MdQrCode2 />,
        desc: "Create QR codes with embedded security features.",
        code: "SecureQRCodeGenerator",
        // seo: SeoDataImport.SecureQRCodeGenerator
      },
      {
        name: "Key Pair Generator",
        slug: "key-pair-generator",
        icon: <MdVpnKey />,
        desc: "Generate public and private key pairs for encryption.",
        code: "KeyPairGenerator",
        // seo: SeoDataImport.KeyPairGenerator
      },
      {
        name: "Password Policy Tester",
        slug: "password-policy-tester",
        icon: <MdSecurity />,
        desc: "Test passwords against organizational security policies.",
        code: "PasswordPolicyTester",
        // seo: SeoDataImport.PasswordPolicyTester
      },
      {
        name: "Secure File Transfer Simulator",
        slug: "secure-file-transfer-simulator",
        icon: <MdCloudUpload />,
        desc: "Simulate secure file transfers with encryption protocols.",
        code: "SecureFileTransferSimulator",
        // seo: SeoDataImport.SecureFileTransferSimulator
      },
      {
        name: "Session ID Generator",
        slug: "session-id-generator",
        icon: <MdSecurity />,
        desc: "Generate secure session IDs for web applications.",
        code: "SessionIDGenerator",
        // seo: SeoDataImport.SessionIDGenerator
      },
      {
        name: "HMAC Generator",
        slug: "hmac-generator",
        icon: <MdFingerprint />,
        desc: "Generate HMAC (Hash-based Message Authentication Code) for data.",
        code: "HMACGenerator",
        // seo: SeoDataImport.HMACGenerator
      },
      {
        name: "HMAC Verifier",
        slug: "hmac-verifier",
        icon: <MdFingerprint />,
        desc: "Verify HMAC signatures for data authenticity.",
        code: "HMACVerifier",
        // seo: SeoDataImport.HMACVerifier
      },
      {
        name: "Secure PIN Generator",
        slug: "secure-pin-generator",
        icon: <MdLock />,
        desc: "Generate secure PINs for authentication purposes.",
        code: "SecurePINGenerator",
        // seo: SeoDataImport.SecurePINGenerator
      },
      {
        name: "Password Leak Checker",
        slug: "password-leak-checker",
        icon: <MdSecurity />,
        desc: "Check if a password has been exposed in known data breaches.",
        code: "PasswordLeakChecker",
        // seo: SeoDataImport.PasswordLeakChecker
      },
      {
        name: "Secure Backup Code Generator",
        slug: "secure-backup-code-generator",
        icon: <MdVpnKey />,
        desc: "Generate backup codes for multi-factor authentication recovery.",
        code: "SecureBackupCodeGenerator",
        // seo: SeoDataImport.SecureBackupCodeGenerator
      },
      {
        name: "Network Packet Sniffer Simulator",
        slug: "network-packet-sniffer-simulator",
        icon: <MdNetworkCheck />,
        desc: "Simulate packet sniffing to analyze network security.",
        code: "NetworkPacketSnifferSimulator",
        // seo: SeoDataImport.NetworkPacketSnifferSimulator
      },
      {
        name: "Security Headers Analyzer",
        slug: "security-headers-analyzer",
        icon: <MdSecurity />,
        desc: "Analyze HTTP security headers for websites.",
        code: "SecurityHeadersAnalyzer",
        // seo: SeoDataImport.SecurityHeadersAnalyzer
      },
    ],
  },
  {
    category: "Calculators",
    slug: "calculator-tools",
    desc: "Perform a wide range of calculations with ease",
    icon: <MdCalculate />,
    tools: [
      {
        name: "Fraction Calculator",
        slug: "fraction-calculator",
        icon: <MdCalculate />,
        desc: "Add, subtract, multiply, and divide fractions with step-by-step results.",
        code: "FractionCalculator",
        seo: SeoDataImport.FractionCalculator,
      },
      {
        name: "GCD and LCM Calculator",
        slug: "gcd-lcm-calculator",
        icon: <MdCalculate />,
        desc: "Find the Greatest Common Divisor and Least Common Multiple of numbers.",
        code: "GCDLCMCalculator",
        seo: SeoDataImport.GCDLCMCalculator,
      },

      {
        name: "Exponent Calculator",
        slug: "exponent-calculator",
        icon: <MdCalculate />,
        desc: "Compute powers and exponential values quickly.",
        code: "ExponentCalculator",
        seo: SeoDataImport.ExponentCalculator,
      },
      {
        name: "Root Calculator",
        slug: "root-calculator",
        icon: <MdCalculate />,
        desc: "Find square roots, cube roots, and nth roots of numbers.",
        code: "RootCalculator",
        seo: SeoDataImport.RootCalculator,
      },
      {
        name: "Logarithm Calculator",
        slug: "logarithm-calculator",
        icon: <MdCalculate />,
        desc: "Calculate logarithms with custom bases.",
        code: "LogarithmCalculator",
        seo: SeoDataImport.LogarithmCalculator,
      },
      {
        name: "Mortgage Calculator",
        slug: "mortgage-calculator",
        icon: <MdCalculate />,
        desc: "Estimate monthly mortgage payments based on loan amount, interest, and term.",
        code: "MortgageCalculator",
        seo: SeoDataImport.MortgageCalculator,
      },
      {
        name: "Loan Calculator",
        slug: "loan-calculator",
        icon: <MdCalculate />,
        desc: "Calculate loan payments, interest, and payoff time.",
        code: "LoanCalculator",
        seo: SeoDataImport.LoanCalculator,
      },
      {
        name: "Compound Interest Calculator",
        slug: "compound-interest-calculator",
        icon: <MdCalculate />,
        desc: "Compute compound interest for savings or investments.",
        code: "CompoundInterestCalculator",
        seo: SeoDataImport.CompoundInterestCalculator,
      },
      {
        name: "BMI Calculator",
        slug: "bmi-calculator",
        icon: <MdCalculate />,
        desc: "Calculate Body Mass Index based on height and weight.",
        code: "BMICalculator",
        seo: SeoDataImport.BMICalculator,
      },
      {
        name: "Calorie Calculator",
        slug: "calorie-calculator",
        icon: <MdCalculate />,
        desc: "Estimate daily calorie needs based on activity level and goals.",
        code: "CalorieCalculator",
        seo: SeoDataImport.CalorieCalculator,
      },
      {
        name: "Unit Converter Calculator",
        slug: "unit-converter-calculator",
        icon: <MdCalculate />,
        desc: "Convert between units like length, weight, volume, and more.",
        code: "UnitConverterCalculator",
        seo: SeoDataImport.UnitConverterCalculator,
      },
      {
        name: "Age Calculator",
        slug: "age-calculator",
        icon: <MdCalculate />,
        desc: "Determine age in years, months, and days from a birthdate.",
        code: "AgeCalculator",
        seo: SeoDataImport.AgeCalculator,
      },
      {
        name: "Time Duration Calculator",
        slug: "time-duration-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the time difference between two dates or times.",
        code: "TimeDurationCalculator",
        seo: SeoDataImport.TimeDurationCalculator,
      },
      {
        name: "Tip Calculator",
        slug: "tip-calculator",
        icon: <MdCalculate />,
        desc: "Calculate tips and split bills among multiple people.",
        code: "TipCalculator",
        seo: SeoDataImport.TipCalculator,
      },
      {
        name: "Probability Calculator",
        slug: "probability-calculator",
        icon: <MdCalculate />,
        desc: "Compute probabilities for various events and scenarios.",
        code: "ProbabilityCalculator",
        seo: SeoDataImport.ProbabilityCalculator,
      },

      {
        name: "Scientific Calculator",
        slug: "scientific-calculator",
        icon: <MdCalculate />,
        desc: "Perform advanced mathematical calculations with a scientific calculator.",
        code: "ScientificCalculator",
        seo: SeoDataImport.ScientificCalculator,
      },
      {
        name: "Factorial Calculator",
        slug: "factorial-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the factorial of any number easily.",
        code: "FactorialCalculator",
        seo: SeoDataImport.FactorialCalculator,
      },
      {
        name: "Matrix Calculator",
        slug: "matrix-calculator",
        icon: <MdCalculate />,
        desc: "Perform matrix operations like addition, multiplication, and inverses.",
        code: "MatrixCalculator",
        seo: SeoDataImport.MatrixCalculator,
      },
      {
        name: "Percentage Calculator",
        slug: "percentage-calculator",
        icon: <MdCalculate />,
        desc: "Easily compute percentages for discounts, taxes, and profit margins.",
        code: "PercentageCalculator",
        seo: SeoDataImport.PercentageCalculator,
      },
      {
        name: "Average Calculator",
        slug: "average-calculator",
        icon: <MdCalculate />,
        desc: "Compute the arithmetic mean of a set of numbers.",
        code: "AverageCalculator",
        seo: SeoDataImport.AverageCalculator,
      },
      {
        name: "Confidence Interval Calculator",
        slug: "confidence-interval-calculator",
        icon: <MdCalculate />,
        desc: "Calculate confidence intervals for statistical data.",
        code: "ConfidenceIntervalCalculator",
        seo: SeoDataImport.ConfidenceIntervalCalculator,
      },
      {
        name: "Sales Tax Calculator",
        slug: "sales-tax-calculator",
        icon: <MdCalculate />,
        desc: "Determine the sales tax amount and total cost.",
        code: "SalesTaxCalculator",
        seo: SeoDataImport.SalesTaxCalculator,
      },
      {
        name: "Margin Calculator",
        slug: "margin-calculator",
        icon: <MdCalculate />,
        desc: "Calculate profit margins based on cost and revenue.",
        code: "MarginCalculator",
        seo: SeoDataImport.MarginCalculator,
      },
      {
        name: "PayPal Fee Calculator",
        slug: "paypal-fee-calculator",
        icon: <MdCalculate />,
        desc: "Estimate PayPal fees for transactions.",
        code: "PayPalFeeCalculator",
        seo: SeoDataImport.PayPalFeeCalculator,
      },
      {
        name: "Discount Calculator",
        slug: "discount-calculator",
        icon: <MdCalculate />,
        desc: "Calculate discounted prices and savings.",
        code: "DiscountCalculator",
        seo: SeoDataImport.DiscountCalculator,
      },
      {
        name: "Earnings Per Share Calculator",
        slug: "earnings-per-share-calculator",
        icon: <MdCalculate />,
        desc: "Compute earnings per share for financial analysis.",
        code: "EarningsPerShareCalculator",
        seo: SeoDataImport.EarningsPerShareCalculator,
      },
      {
        name: "CPM Calculator",
        slug: "cpm-calculator",
        icon: <MdCalculate />,
        desc: "Calculate cost per thousand impressions for advertising.",
        code: "CPMCalculator",
        seo: SeoDataImport.CPMCalculator,
      },
      {
        name: "Loan To Value Calculator",
        slug: "loan-to-value-calculator",
        icon: <MdCalculate />,
        desc: "Determine the loan-to-value ratio for loans.",
        code: "LoanToValueCalculator",
        seo: SeoDataImport.LoanToValueCalculator,
      },
      {
        name: "GST Calculator",
        slug: "gst-calculator",
        icon: <MdCalculate />,
        desc: "Calculate Goods and Services Tax for purchases.",
        code: "GSTCalculator",
        seo: SeoDataImport.GSTCalculator,
      },
      {
        name: "Chronological Age Calculator",
        slug: "chronological-age-calculator",
        icon: <MdCalculate />,
        desc: "Calculate exact age based on birthdate.",
        code: "ChronologicalAgeCalculator",
        seo: SeoDataImport.ChronologicalAgeCalculator,
      },
      {
        name: "Hours Calculator",
        slug: "hours-calculator",
        icon: <MdCalculate />,
        desc: "Calculate total hours worked or time differences.",
        code: "HoursCalculator",
        seo: SeoDataImport.HoursCalculator,
      },
      {
        name: "Grade Calculator",
        slug: "grade-calculator",
        icon: <MdCalculate />,
        desc: "Compute final grades based on scores.",
        code: "GradeCalculator",
        seo: SeoDataImport.GradeCalculator,
      },
      {
        name: "GPA Calculator",
        slug: "gpa-calculator",
        icon: <MdCalculate />,
        desc: "Calculate Grade Point Average from grades.",
        code: "GPACalculator",
        seo: SeoDataImport.GPACalculator,
      },
      {
        name: "Percentage Increase Calculator",
        slug: "percentage-increase-calculator",
        icon: <MdCalculate />,
        desc: "Determine the percentage increase between two values.",
        code: "PercentageIncreaseCalculator",
        seo: SeoDataImport.PercentageIncreaseCalculator,
      },
      {
        name: "Percentage Decrease Calculator",
        slug: "percentage-decrease-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the percentage decrease between two values.",
        code: "PercentageDecreaseCalculator",
        seo: SeoDataImport.PercentageDecreaseCalculator,
      },
      {
        name: "Percentage Change Calculator",
        slug: "percentage-change-calculator",
        icon: <MdCalculate />,
        desc: "Find the percentage change between two numbers.",
        code: "PercentageChangeCalculator",
        seo: SeoDataImport.PercentageChangeCalculator,
      },
      {
        name: "Percentage Difference Calculator",
        slug: "percentage-difference-calculator",
        icon: <MdCalculate />,
        desc: "Compute the percentage difference between two values.",
        code: "PercentageDifferenceCalculator",
        seo: SeoDataImport.PercentageDifferenceCalculator,
      },
      {
        name: "Time Calculator",
        slug: "time-calculator",
        icon: <MdCalculate />,
        desc: "Add or subtract time units like hours and minutes.",
        code: "TimeCalculator",
        seo: SeoDataImport.TimeCalculator,
      },
      {
        name: "Salary Calculator",
        slug: "salary-calculator",
        icon: <MdCalculate />,
        desc: "Estimate net salary after taxes and deductions.",
        code: "SalaryCalculator",
        seo: SeoDataImport.SalaryCalculator,
      },
      {
        name: "Investment Calculator",
        slug: "investment-calculator",
        icon: <MdCalculate />,
        desc: "Calculate returns on investments over time.",
        code: "InvestmentCalculator",
        seo: SeoDataImport.InvestmentCalculator,
      },
      {
        name: "TDEE Calculator",
        slug: "tdee-calculator",
        icon: <MdCalculate />,
        desc: "Estimate Total Daily Energy Expenditure for fitness goals.",
        code: "TDEECalculator",
        seo: SeoDataImport.TDEECalculator,
      },
      {
        name: "Mean Median Mode Calculator",
        slug: "mean-median-mode-calculator",
        icon: <MdCalculate />,
        desc: "Calculate mean, median, and mode of a dataset.",
        code: "MeanMedianModeCalculator",
        seo: SeoDataImport.MeanMedianModeCalculator,
      },
      {
        name: "Statistics Calculator",
        slug: "statistics-calculator",
        icon: <MdCalculate />,
        desc: "Compute mean, median, mode, and standard deviation.",
        code: "StatisticsCalculator",
        seo: SeoDataImport.StatisticsCalculator,
      },
      {
        name: "Derivative Calculator",
        slug: "derivative-calculator",
        icon: <MdCalculate />,
        desc: "Compute derivatives of functions step-by-step.",
        code: "DerivativeCalculator",
        seo: SeoDataImport.DerivativeCalculator,
      },
      {
        name: "Integral Calculator",
        slug: "integral-calculator",
        icon: <MdCalculate />,
        desc: "Calculate definite and indefinite integrals.",
        code: "IntegralCalculator",
        seo: SeoDataImport.IntegralCalculator,
      },
      {
        name: "Vector Calculator",
        slug: "vector-calculator",
        icon: <MdCalculate />,
        desc: "Perform operations on vectors like addition and dot product.",
        code: "VectorCalculator",
        seo: SeoDataImport.VectorCalculator,
      },
      {
        name: "Complex Number Calculator",
        slug: "complex-number-calculator",
        icon: <MdCalculate />,
        desc: "Perform operations on complex numbers.",
        code: "ComplexNumberCalculator",
        seo: SeoDataImport.ComplexNumberCalculator,
      },
      {
        name: "Permutation Calculator",
        slug: "permutation-calculator",
        icon: <MdCalculate />,
        desc: "Calculate permutations of a set of items.",
        code: "PermutationCalculator",
        seo: SeoDataImport.PermutationCalculator,
      },
      {
        name: "Combination Calculator",
        slug: "combination-calculator",
        icon: <MdCalculate />,
        desc: "Compute combinations of a set of items.",
        code: "CombinationCalculator",
        seo: SeoDataImport.CombinationCalculator,
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
        name: "Equation Solver",
        slug: "equation-solver",
        icon: <MdCalculate />,
        desc: "Solve linear and quadratic equations instantly.",
        code: "EquationSolver",
        seo: SeoDataImport.EquationSolver,
      },
      {
        name: "Prime Number Checker",
        slug: "prime-number-checker",
        icon: <MdCalculate />,
        desc: "Determine if a number is prime or composite.",
        code: "PrimeNumberChecker",
        seo: SeoDataImport.PrimeNumberChecker,
      },
      {
        name: "Polynomial Factorizer",
        slug: "polynomial-factorizer",
        icon: <MdCalculate />,
        desc: "Factorize polynomial expressions with ease.",
        code: "PolynomialFactorizer",
        seo: SeoDataImport.PolynomialFactorizer,
      },
      {
        name: "Quadratic Equation Solver",
        slug: "quadratic-equation-solver",
        icon: <MdCalculate />,
        desc: "Solve quadratic equations and find roots.",
        code: "QuadraticEquationSolver",
        seo: SeoDataImport.QuadraticEquationSolver,
      },
      {
        name: "Matrix Determinant",
        slug: "matrix-determinant",
        icon: <MdCalculate />,
        desc: "Find the determinant of square matrices.",
        code: "MatrixDeterminant",
        seo: SeoDataImport.MatrixDeterminant,
      },
      {
        name: "Matrix Inverse",
        slug: "matrix-inverse",
        icon: <MdCalculate />,
        desc: "Compute the inverse of a matrix.",
        code: "MatrixInverse",
        seo: SeoDataImport.MatrixInverse,
      },
      {
        name: "Trigonometry Solver",
        slug: "trigonometry-solver",
        icon: <MdCalculate />,
        desc: "Solve trigonometric equations and identities.",
        code: "TrigonometrySolver",
        seo: SeoDataImport.TrigonometrySolver,
      },
      {
        name: "Logarithm Solver",
        slug: "logarithm-solver",
        icon: <MdCalculate />,
        desc: "Solve logarithmic equations with any base.",
        code: "LogarithmSolver",
        seo: SeoDataImport.LogarithmSolver,
      },
      {
        name: "Exponent Solver",
        slug: "exponent-solver",
        icon: <MdCalculate />,
        desc: "Simplify and solve exponential equations.",
        code: "ExponentSolver",
        seo: SeoDataImport.ExponentSolver,
      },
      {
        name: "Prime Factorization",
        slug: "prime-factorization",
        icon: <MdCalculate />,
        desc: "Break down numbers into their prime factors.",
        code: "PrimeFactorization",
        seo: SeoDataImport.PrimeFactorization,
      },
      {
        name: "GCD and LCM Finder",
        slug: "gcd-lcm-finder",
        icon: <MdCalculate />,
        desc: "Calculate Greatest Common Divisor and Least Common Multiple.",
        code: "GCDLCMFinder",
        seo: SeoDataImport.GCDLCMFinder,
      },
      {
        name: "Sequence Generator",
        slug: "sequence-generator",
        icon: <MdCalculate />,
        desc: "Generate arithmetic and geometric sequences.",
        code: "SequenceGenerator",
        seo: SeoDataImport.SequenceGenerator,
      },
      {
        name: "Binomial Theorem Expander",
        slug: "binomial-theorem-expander",
        icon: <MdCalculate />,
        desc: "Expand binomial expressions using the binomial theorem.",
        code: "BinomialTheoremExpander",
        seo: SeoDataImport.BinomialTheoremExpander,
      },
      {
        name: "Root Finder",
        slug: "root-finder",
        icon: <MdCalculate />,
        desc: "Find roots of equations, including square and nth roots.",
        code: "RootFinder",
        seo: SeoDataImport.RootFinder,
      },
      {
        name: "System of Equations Solver",
        slug: "system-of-equations-solver",
        icon: <MdCalculate />,
        desc: "Solve systems of linear equations with multiple variables.",
        code: "SystemOfEquationsSolver",
        seo: SeoDataImport.SystemOfEquationsSolver,
      },
      {
        name: "Probability Solver",
        slug: "probability-solver",
        icon: <MdCalculate />,
        desc: "Calculate probabilities for various events.",
        code: "ProbabilitySolver",
        seo: SeoDataImport.ProbabilitySolver,
      },
      {
        name: "Fraction Simplifier",
        slug: "fraction-simplifier",
        icon: <MdCalculate />,
        desc: "Reduce fractions to their simplest form.",
        code: "FractionSimplifier",
        seo: SeoDataImport.FractionSimplifier,
      },
      {
        name: "Derivative Finder",
        slug: "derivative-finder",
        icon: <MdCalculate />,
        desc: "Compute derivatives of functions with ease.",
        code: "DerivativeFinder",
        seo: SeoDataImport.DerivativeFinder,
      },
      {
        name: "Integral Solver",
        slug: "integral-solver",
        icon: <MdCalculate />,
        desc: "Solve definite and indefinite integrals.",
        code: "IntegralSolver",
        seo: SeoDataImport.IntegralSolver,
      },
      {
        name: "Vector Analyzer",
        slug: "vector-analyzer",
        icon: <MdCalculate />,
        desc: "Perform operations like dot and cross products on vectors.",
        code: "VectorAnalyzer",
        seo: SeoDataImport.VectorAnalyzer,
      },
      {
        name: "Complex Number Solver",
        slug: "complex-number-solver",
        icon: <MdCalculate />,
        desc: "Handle operations on complex numbers.",
        code: "ComplexNumberSolver",
        seo: SeoDataImport.ComplexNumberSolver,
      },
      {
        name: "Permutation Generator",
        slug: "permutation-generator",
        icon: <MdCalculate />,
        desc: "Generate all permutations of a set.",
        code: "PermutationGenerator",
        seo: SeoDataImport.PermutationGenerator,
      },
      {
        name: "Combination Generator",
        slug: "combination-generator",
        icon: <MdCalculate />,
        desc: "Generate combinations of a set of items.",
        code: "CombinationGenerator",
        seo: SeoDataImport.CombinationGenerator,
      },
      {
        name: "Statistics Analyzer",
        slug: "statistics-analyzer",
        icon: <MdCalculate />,
        desc: "Compute mean, median, mode, and variance.",
        code: "StatisticsAnalyzer",
        seo: SeoDataImport.StatisticsAnalyzer,
      },
      {
        name: "Graph Plotter",
        slug: "graph-plotter",
        icon: <MdCalculate />,
        desc: "Plot mathematical functions and equations.",
        code: "GraphPlotter",
        seo: SeoDataImport.GraphPlotter,
      },
      {
        name: "Unit Converter",
        slug: "unit-converter",
        icon: <MdCalculate />,
        desc: "Convert between various mathematical units.",
        code: "UnitConverter",
        seo: SeoDataImport.UnitConverter,
      },
      {
        name: "Inequality Solver",
        slug: "inequality-solver",
        icon: <MdCalculate />,
        desc: "Solve linear and nonlinear inequalities.",
        code: "InequalitySolver",
        seo: SeoDataImport.InequalitySolver,
      },
      {
        name: "Factorial Generator",
        slug: "factorial-generator",
        icon: <MdCalculate />,
        desc: "Generate factorial values for numbers.",
        code: "FactorialGenerator",
        seo: SeoDataImport.FactorialGenerator,
      },
      {
        name: "Matrix Transposer",
        slug: "matrix-transposer",
        icon: <MdCalculate />,
        desc: "Transpose matrices with a single click.",
        code: "MatrixTransposer",
        seo: SeoDataImport.MatrixTransposer,
      },
      {
        name: "Eigenvalue Finder",
        slug: "eigenvalue-finder",
        icon: <MdCalculate />,
        desc: "Find eigenvalues of square matrices.",
        code: "EigenvalueFinder",
        seo: SeoDataImport.EigenvalueFinder,
      },
      {
        name: "Gaussian Eliminator",
        slug: "gaussian-eliminator",
        icon: <MdCalculate />,
        desc: "Solve systems of equations using Gaussian elimination.",
        code: "GaussianEliminator",
        seo: SeoDataImport.GaussianEliminator,
      },
      {
        name: "Number Base Converter",
        slug: "number-base-converter",
        icon: <MdCalculate />,
        desc: "Convert numbers between different bases.",
        code: "NumberBaseConverter",
        seo: SeoDataImport.NumberBaseConverter,
      },
      {
        name: "Sigma Notation Expander",
        slug: "sigma-notation-expander",
        icon: <MdCalculate />,
        desc: "Expand and evaluate sigma notation sums.",
        code: "SigmaNotationExpander",
        seo: SeoDataImport.SigmaNotationExpander,
      },
      {
        name: "Taylor Series Generator",
        slug: "taylor-series-generator",
        icon: <MdCalculate />,
        desc: "Generate Taylor series for functions.",
        code: "TaylorSeriesGenerator",
        seo: SeoDataImport.TaylorSeriesGenerator,
      },
      {
        name: "Limit Evaluator",
        slug: "limit-evaluator",
        icon: <MdCalculate />,
        desc: "Evaluate limits of mathematical functions.",
        code: "LimitEvaluator",
        seo: SeoDataImport.LimitEvaluator,
      },
      {
        name: "Partial Fraction Decomposer",
        slug: "partial-fraction-decomposer",
        icon: <MdCalculate />,
        desc: "Decompose rational expressions into partial fractions.",
        code: "PartialFractionDecomposer",
        seo: SeoDataImport.PartialFractionDecomposer,
      },
      {
        name: "Modular Arithmetic Solver",
        slug: "modular-arithmetic-solver",
        icon: <MdCalculate />,
        desc: "Solve equations in modular arithmetic.",
        code: "ModularArithmeticSolver",
        seo: SeoDataImport.ModularArithmeticSolver,
      },
      {
        name: "Fibonacci Sequence Generator",
        slug: "fibonacci-sequence-generator",
        icon: <MdCalculate />,
        desc: "Generate terms of the Fibonacci sequence.",
        code: "FibonacciSequenceGenerator",
        seo: SeoDataImport.FibonacciSequenceGenerator,
      },
      {
        name: "Divisibility Tester",
        slug: "divisibility-tester",
        icon: <MdCalculate />,
        desc: "Test if a number is divisible by another.",
        code: "DivisibilityTester",
        seo: SeoDataImport.DivisibilityTester,
      },
      {
        name: "Rational Equation Solver",
        slug: "rational-equation-solver",
        icon: <MdCalculate />,
        desc: "Solve equations involving rational expressions.",
        code: "RationalEquationSolver",
        seo: SeoDataImport.RationalEquationSolver,
      },
      {
        name: "Set Operations Tool",
        slug: "set-operations-tool",
        icon: <MdCalculate />,
        desc: "Perform union, intersection, and difference on sets.",
        code: "SetOperationsTool",
        seo: SeoDataImport.SetOperationsTool,
      },
      {
        name: "Linear Regression Analyzer",
        slug: "linear-regression-analyzer",
        icon: <MdCalculate />,
        desc: "Fit a linear regression model to data points.",
        code: "LinearRegressionAnalyzer",
        seo: SeoDataImport.LinearRegressionAnalyzer,
      },
      {
        name: "Exponent Simplifier",
        slug: "exponent-simplifier",
        icon: <MdCalculate />,
        desc: "Simplify expressions with exponents.",
        code: "ExponentSimplifier",
        seo: SeoDataImport.ExponentSimplifier,
      },
      {
        name: "Polynomial Root Approximator",
        slug: "polynomial-root-approximator",
        icon: <MdCalculate />,
        desc: "Approximate roots of higher-degree polynomials.",
        code: "PolynomialRootApproximator",
        seo: SeoDataImport.PolynomialRootApproximator,
      },
      {
        name: "Trigonometric Identity Prover",
        slug: "trigonometric-identity-prover",
        icon: <MdCalculate />,
        desc: "Prove or simplify trigonometric identities.",
        code: "TrigonometricIdentityProver",
        seo: SeoDataImport.TrigonometricIdentityProver,
      },
      {
        name: "Continued Fraction Expander",
        slug: "continued-fraction-expander",
        icon: <MdCalculate />,
        desc: "Expand numbers into continued fractions.",
        code: "ContinuedFractionExpander",
        seo: SeoDataImport.ContinuedFractionExpander,
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
        seo: SeoDataImport.ColorPicker,
      },
      {
        name: "Hex to RGB",
        slug: "hex-to-rgb",
        icon: <MdPalette />,
        desc: "Convert HEX color codes to RGB and vice versa.",
        code: "HexToRGB",
        seo: SeoDataImport.HexToRgbConverter,
      },
      {
        name: "Color Gradient Generator",
        slug: "color-gradient-generator",
        icon: <MdPalette />,
        desc: "Create beautiful color gradients with CSS code output.",
        code: "GradientGenerator",
        seo: SeoDataImport.ColorGradientGenerator,
      },
      {
        name: "Contrast Checker",
        slug: "contrast-checker",
        icon: <MdPalette />,
        desc: "Check color contrast for accessibility and readability compliance.",
        code: "ContrastChecker",
        seo: SeoDataImport.ContrastChecker,
      },
      {
        name: "Palette Generator",
        slug: "palette-generator",
        icon: <MdPalette />,
        desc: "Generate harmonious color palettes for design projects.",
        code: "PaletteGenerator",
        seo: SeoDataImport.PaletteGenerator,
      },
      // New 50 Color Tools
      {
        name: "RGB to Hex",
        slug: "rgb-to-hex",
        icon: <MdPalette />,
        desc: "Convert RGB color values to HEX codes.",
        code: "RGBToHex",
        // seo: SeoDataImport.RGBToHexConverter
      },
      {
        name: "HSL to RGB",
        slug: "hsl-to-rgb",
        icon: <MdPalette />,
        desc: "Transform HSL color values into RGB format.",
        code: "HSLToRGB",
        // seo: SeoDataImport.HSLToRGBConverter
      },
      {
        name: "RGB to HSL",
        slug: "rgb-to-hsl",
        icon: <MdPalette />,
        desc: "Convert RGB color values to HSL format.",
        code: "RGBToHSL",
        // seo: SeoDataImport.RGBToHSLConverter
      },
      {
        name: "Hex to HSL",
        slug: "hex-to-hsl",
        icon: <MdPalette />,
        desc: "Convert HEX color codes to HSL values.",
        code: "HexToHSL",
        // seo: SeoDataImport.HexToHSLConverter
      },
      {
        name: "HSL to Hex",
        slug: "hsl-to-hex",
        icon: <MdPalette />,
        desc: "Transform HSL color values into HEX codes.",
        code: "HSLToHex",
        // seo: SeoDataImport.HSLToHexConverter
      },
      {
        name: "CMYK to RGB",
        slug: "cmyk-to-rgb",
        icon: <MdPalette />,
        desc: "Convert CMYK color values to RGB format.",
        code: "CMYKToRGB",
        // seo: SeoDataImport.CMYKToRGBConverter
      },
      {
        name: "RGB to CMYK",
        slug: "rgb-to-cmyk",
        icon: <MdPalette />,
        desc: "Transform RGB color values into CMYK format.",
        code: "RGBToCMYK",
        // seo: SeoDataImport.RGBToCMYKConverter
      },
      {
        name: "Color Blindness Simulator",
        slug: "color-blindness-simulator",
        icon: <MdColorLens />,
        desc: "Simulate how colors appear to people with color vision deficiencies.",
        code: "ColorBlindnessSimulator",
        // seo: SeoDataImport.ColorBlindnessSimulator
      },
      {
        name: "Color Mixer",
        slug: "color-mixer",
        icon: <MdPalette />,
        desc: "Mix two or more colors to see the resulting shade.",
        code: "ColorMixer",
        // seo: SeoDataImport.ColorMixer
      },
      {
        name: "Color Harmony Analyzer",
        slug: "color-harmony-analyzer",
        icon: <MdPalette />,
        desc: "Analyze color combinations for harmonic relationships.",
        code: "ColorHarmonyAnalyzer",
        // seo: SeoDataImport.ColorHarmonyAnalyzer
      },
      {
        name: "Color Extractor",
        slug: "color-extractor",
        icon: <MdImage />,
        desc: "Extract dominant colors from an image.",
        code: "ColorExtractor",
        // seo: SeoDataImport.ColorExtractor
      },
      {
        name: "Color Wheel Generator",
        slug: "color-wheel-generator",
        icon: <MdPalette />,
        desc: "Generate an interactive color wheel with complementary colors.",
        code: "ColorWheelGenerator",
        // seo: SeoDataImport.ColorWheelGenerator
      },
      {
        name: "Color Temperature Converter",
        slug: "color-temperature-converter",
        icon: <MdBrightness6 />,
        desc: "Convert between color temperatures (Kelvin) and RGB values.",
        code: "ColorTemperatureConverter",
        // seo: SeoDataImport.ColorTemperatureConverter
      },
      {
        name: "Color Shade Generator",
        slug: "color-shade-generator",
        icon: <MdPalette />,
        desc: "Generate lighter and darker shades of a base color.",
        code: "ColorShadeGenerator",
        // seo: SeoDataImport.ColorShadeGenerator
      },
      {
        name: "Color Tint Generator",
        slug: "color-tint-generator",
        icon: <MdPalette />,
        desc: "Create tints by adding white to a base color.",
        code: "ColorTintGenerator",
        // seo: SeoDataImport.ColorTintGenerator
      },
      {
        name: "Color Tone Generator",
        slug: "color-tone-generator",
        icon: <MdPalette />,
        desc: "Generate tones by adding gray to a base color.",
        code: "ColorToneGenerator",
        // seo: SeoDataImport.ColorToneGenerator
      },
      {
        name: "Color Inversion Tool",
        slug: "color-inversion-tool",
        icon: <MdPalette />,
        desc: "Invert colors to find their opposites on the spectrum.",
        code: "ColorInversionTool",
        // seo: SeoDataImport.ColorInversionTool
      },
      {
        name: "Color Randomizer",
        slug: "color-randomizer",
        icon: <MdPalette />,
        desc: "Generate random colors with HEX, RGB, or HSL output.",
        code: "ColorRandomizer",
        // seo: SeoDataImport.ColorRandomizer
      },
      {
        name: "Color Difference Calculator",
        slug: "color-difference-calculator",
        icon: <MdPalette />,
        desc: "Calculate the perceptual difference between two colors.",
        code: "ColorDifferenceCalculator",
        // seo: SeoDataImport.ColorDifferenceCalculator
      },
      {
        name: "Color Brightness Adjuster",
        slug: "color-brightness-adjuster",
        icon: <MdBrightness6 />,
        desc: "Adjust the brightness of a color with real-time preview.",
        code: "ColorBrightnessAdjuster",
        // seo: SeoDataImport.ColorBrightnessAdjuster
      },
      {
        name: "Color Saturation Adjuster",
        slug: "color-saturation-adjuster",
        icon: <MdPalette />,
        desc: "Modify the saturation of a color interactively.",
        code: "ColorSaturationAdjuster",
        // seo: SeoDataImport.ColorSaturationAdjuster
      },
      {
        name: "Color Hue Adjuster",
        slug: "color-hue-adjuster",
        icon: <MdPalette />,
        desc: "Shift the hue of a color for creative adjustments.",
        code: "ColorHueAdjuster",
        // seo: SeoDataImport.ColorHueAdjuster
      },
      {
        name: "Color to Grayscale Converter",
        slug: "color-to-grayscale-converter",
        icon: <MdFilterBAndW />,
        desc: "Convert any color to its grayscale equivalent.",
        code: "ColorToGrayscaleConverter",
        // seo: SeoDataImport.ColorToGrayscaleConverter
      },
      {
        name: "Color Name Finder",
        slug: "color-name-finder",
        icon: <MdPalette />,
        desc: "Find the closest named color to a given HEX or RGB value.",
        code: "ColorNameFinder",
        // seo: SeoDataImport.ColorNameFinder
      },
      {
        name: "Color Scheme Generator",
        slug: "color-scheme-generator",
        icon: <MdPalette />,
        desc: "Generate color schemes (e.g., monochromatic, analogous) from a base color.",
        code: "ColorSchemeGenerator",
        // seo: SeoDataImport.ColorSchemeGenerator
      },
      {
        name: "Color Opacity Adjuster",
        slug: "color-opacity-adjuster",
        icon: <MdPalette />,
        desc: "Adjust the opacity of a color with RGBA output.",
        code: "ColorOpacityAdjuster",
        // seo: SeoDataImport.ColorOpacityAdjuster
      },
      {
        name: "Color Space Converter",
        slug: "color-space-converter",
        icon: <MdPalette />,
        desc: "Convert colors between different color spaces (e.g., LAB, XYZ).",
        code: "ColorSpaceConverter",
        // seo: SeoDataImport.ColorSpaceConverter
      },
      {
        name: "Color Delta E Calculator",
        slug: "color-delta-e-calculator",
        icon: <MdPalette />,
        desc: "Calculate the Delta E value for color difference in CIE LAB space.",
        code: "ColorDeltaECalculator",
        // seo: SeoDataImport.ColorDeltaECalculator
      },
      {
        name: "Color Accessibility Analyzer",
        slug: "color-accessibility-analyzer",
        icon: <MdAccessibility />,
        desc: "Analyze color pairs for WCAG accessibility compliance.",
        code: "ColorAccessibilityAnalyzer",
        // seo: SeoDataImport.ColorAccessibilityAnalyzer
      },
      {
        name: "Color Code Validator",
        slug: "color-code-validator",
        icon: <MdPalette />,
        desc: "Validate HEX, RGB, or HSL color codes for correctness.",
        code: "ColorCodeValidator",
        // seo: SeoDataImport.ColorCodeValidator
      },
      {
        name: "Color Palette Exporter",
        slug: "color-palette-exporter",
        icon: <MdPalette />,
        desc: "Export color palettes to CSS, JSON, or image formats.",
        code: "ColorPaletteExporter",
        // seo: SeoDataImport.ColorPaletteExporter
      },
      {
        name: "Color Palette Importer",
        slug: "color-palette-importer",
        icon: <MdPalette />,
        desc: "Import color palettes from files or URLs.",
        code: "ColorPaletteImporter",
        // seo: SeoDataImport.ColorPaletteImporter
      },
      {
        name: "Color Contrast Ratio Calculator",
        slug: "color-contrast-ratio-calculator",
        icon: <MdPalette />,
        desc: "Calculate the contrast ratio between two colors.",
        code: "ColorContrastRatioCalculator",
        // seo: SeoDataImport.ColorContrastRatioCalculator
      },
      {
        name: "Color Trend Analyzer",
        slug: "color-trend-analyzer",
        icon: <MdPalette />,
        desc: "Analyze current color trends based on design standards.",
        code: "ColorTrendAnalyzer",
        // seo: SeoDataImport.ColorTrendAnalyzer
      },
      {
        name: "Color Gradient Interpolator",
        slug: "color-gradient-interpolator",
        icon: <MdPalette />,
        desc: "Interpolate colors between two points in a gradient.",
        code: "ColorGradientInterpolator",
        // seo: SeoDataImport.ColorGradientInterpolator
      },
      {
        name: "Color Matching Tool",
        slug: "color-matching-tool",
        icon: <MdPalette />,
        desc: "Find colors that match or complement a given color.",
        code: "ColorMatchingTool",
        // seo: SeoDataImport.ColorMatchingTool
      },
      {
        name: "Color Palette Randomizer",
        slug: "color-palette-randomizer",
        icon: <MdPalette />,
        desc: "Randomize a palette with harmonious colors.",
        code: "ColorPaletteRandomizer",
        // seo: SeoDataImport.ColorPaletteRandomizer
      },
      {
        name: "Color Vision Test Simulator",
        slug: "color-vision-test-simulator",
        icon: <MdColorLens />,
        desc: "Simulate color vision tests like Ishihara plates.",
        code: "ColorVisionTestSimulator",
        // seo: SeoDataImport.ColorVisionTestSimulator
      },
      {
        name: "Color Hex Code Generator",
        slug: "color-hex-code-generator",
        icon: <MdPalette />,
        desc: "Generate random HEX color codes with previews.",
        code: "ColorHexCodeGenerator",
        // seo: SeoDataImport.ColorHexCodeGenerator
      },
      {
        name: "Color to CSS Converter",
        slug: "color-to-css-converter",
        icon: <MdCode />,
        desc: "Convert colors to CSS-compatible formats (e.g., rgba, hex).",
        code: "ColorToCSSConverter",
        // seo: SeoDataImport.ColorToCSSConverter
      },
      {
        name: "Color Palette Organizer",
        slug: "color-palette-organizer",
        icon: <MdPalette />,
        desc: "Organize and categorize multiple color palettes.",
        code: "ColorPaletteOrganizer",
        // seo: SeoDataImport.ColorPaletteOrganizer
      },
      {
        name: "Color Luminance Calculator",
        slug: "color-luminance-calculator",
        icon: <MdBrightness6 />,
        desc: "Calculate the relative luminance of a color.",
        code: "ColorLuminanceCalculator",
        // seo: SeoDataImport.ColorLuminanceCalculator
      },
      {
        name: "Color Transparency Blender",
        slug: "color-transparency-blender",
        icon: <MdPalette />,
        desc: "Blend colors with transparency for layered effects.",
        code: "ColorTransparencyBlender",
        // seo: SeoDataImport.ColorTransparencyBlender
      },
      {
        name: "Color Picker from Image",
        slug: "color-picker-from-image",
        icon: <MdImage />,
        desc: "Pick specific colors from uploaded images.",
        code: "ColorPickerFromImage",
        // seo: SeoDataImport.ColorPickerFromImage
      },
      {
        name: "Color Palette Synchronizer",
        slug: "color-palette-synchronizer",
        icon: <MdSync />,
        desc: "Synchronize palettes across design tools or projects.",
        code: "ColorPaletteSynchronizer",
        // seo: SeoDataImport.ColorPaletteSynchronizer
      },
      {
        name: "Color Profile Converter",
        slug: "color-profile-converter",
        icon: <MdPalette />,
        desc: "Convert colors between ICC profiles (e.g., sRGB, Adobe RGB).",
        code: "ColorProfileConverter",
        // seo: SeoDataImport.ColorProfileConverter
      },
      {
        name: "Color Intensity Analyzer",
        slug: "color-intensity-analyzer",
        icon: <MdPalette />,
        desc: "Analyze the intensity levels of a color.",
        code: "ColorIntensityAnalyzer",
        // seo: SeoDataImport.ColorIntensityAnalyzer
      },
      {
        name: "Color Palette Contrast Tester",
        slug: "color-palette-contrast-tester",
        icon: <MdPalette />,
        desc: "Test contrast across an entire color palette.",
        code: "ColorPaletteContrastTester",
        // seo: SeoDataImport.ColorPaletteContrastTester
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
        seo: SeoDataImport.CurrencyConverter,
      },
      {
        name: "Loan Calculator",
        slug: "loan-calculator",
        icon: <MdAttachMoney />,
        desc: "Calculate monthly payments and total interest for loans.",
        code: "LoanCalculator",
        seo: SeoDataImport.LoanCalculator,
      },
      {
        name: "Tax Calculator",
        slug: "tax-calculator",
        icon: <MdAttachMoney />,
        desc: "Compute taxes based on income and deductions.",
        code: "TaxCalculator",
        seo: SeoDataImport.TaxCalculator,
      },
      {
        name: "Investment Calculator",
        slug: "investment-calculator",
        icon: <MdAttachMoney />,
        desc: "Project potential investment growth over time.",
        code: "InvestmentCalculator",
        seo: SeoDataImport.InvestmentCalculator,
      },
      {
        name: "Retirement Savings Calculator",
        slug: "retirement-savings-calculator",
        icon: <MdAttachMoney />,
        desc: "Plan your retirement savings and estimate future value.",
        code: "RetirementCalculator",
        seo: SeoDataImport.RetirementSavingsCalculator,
      },
      // New 50 Finance Tools
      {
        name: "Compound Interest Calculator",
        slug: "compound-interest-calculator",
        icon: <MdTrendingUp />,
        desc: "Calculate compound interest earnings over time.",
        code: "CompoundInterestCalculator",
        // seo: SeoDataImport.CompoundInterestCalculator
      },
      {
        name: "Mortgage Calculator",
        slug: "mortgage-calculator",
        icon: <MdAccountBalance />,
        desc: "Estimate monthly mortgage payments and total cost.",
        code: "MortgageCalculator",
        // seo: SeoDataImport.MortgageCalculator
      },
      {
        name: "Budget Planner",
        slug: "budget-planner",
        icon: <MdCalculate />,
        desc: "Create and manage monthly budgets with expense tracking.",
        code: "BudgetPlanner",
        // seo: SeoDataImport.BudgetPlanner
      },
      {
        name: "Savings Goal Calculator",
        slug: "savings-goal-calculator",
        icon: <MdSavings />,
        desc: "Determine how long to reach a savings goal with regular deposits.",
        code: "SavingsGoalCalculator",
        // seo: SeoDataImport.SavingsGoalCalculator
      },
      {
        name: "Interest Rate Converter",
        slug: "interest-rate-converter",
        icon: <MdAttachMoney />,
        desc: "Convert between annual, monthly, and daily interest rates.",
        code: "InterestRateConverter",
        // seo: SeoDataImport.InterestRateConverter
      },
      {
        name: "Net Worth Calculator",
        slug: "net-worth-calculator",
        icon: <MdAccountBalance />,
        desc: "Calculate your net worth based on assets and liabilities.",
        code: "NetWorthCalculator",
        // seo: SeoDataImport.NetWorthCalculator
      },
      {
        name: "Inflation Calculator",
        slug: "inflation-calculator",
        icon: <MdTrendingUp />,
        desc: "Adjust amounts for inflation to see past or future value.",
        code: "InflationCalculator",
        // seo: SeoDataImport.InflationCalculator
      },
      {
        name: "Credit Card Payoff Calculator",
        slug: "credit-card-payoff-calculator",
        icon: <MdCreditCard />,
        desc: "Estimate time and cost to pay off credit card debt.",
        code: "CreditCardPayoffCalculator",
        // seo: SeoDataImport.CreditCardPayoffCalculator
      },
      {
        name: "Amortization Schedule Generator",
        slug: "amortization-schedule-generator",
        icon: <MdCalculate />,
        desc: "Generate a detailed loan amortization schedule.",
        code: "AmortizationScheduleGenerator",
        // seo: SeoDataImport.AmortizationScheduleGenerator
      },
      {
        name: "Simple Interest Calculator",
        slug: "simple-interest-calculator",
        icon: <MdCalculate />,
        desc: "Calculate simple interest earnings or costs.",
        code: "SimpleInterestCalculator",
        // seo: SeoDataImport.SimpleInterestCalculator
      },
      {
        name: "ROI Calculator",
        slug: "roi-calculator",
        icon: <MdTrendingUp />,
        desc: "Compute Return on Investment for projects or portfolios.",
        code: "ROICalculator",
        // seo: SeoDataImport.ROICalculator
      },
      {
        name: "Annuity Calculator",
        slug: "annuity-calculator",
        icon: <MdAttachMoney />,
        desc: "Calculate annuity payments or future value.",
        code: "AnnuityCalculator",
        // seo: SeoDataImport.AnnuityCalculator
      },
      {
        name: "Tip Calculator",
        slug: "tip-calculator",
        icon: <MdAttachMoney />,
        desc: "Calculate tips and split bills among multiple people.",
        code: "TipCalculator",
        // seo: SeoDataImport.TipCalculator
      },
      {
        name: "Discount Calculator",
        slug: "discount-calculator",
        icon: <MdLocalOffer />,
        desc: "Calculate discounted prices and savings.",
        code: "DiscountCalculator",
        // seo: SeoDataImport.DiscountCalculator
      },
      {
        name: "Paycheck Calculator",
        slug: "paycheck-calculator",
        icon: <MdAccountBalance />,
        desc: "Estimate net pay after taxes and deductions.",
        code: "PaycheckCalculator",
        // seo: SeoDataImport.PaycheckCalculator
      },
      {
        name: "Future Value Calculator",
        slug: "future-value-calculator",
        icon: <MdTrendingUp />,
        desc: "Project the future value of an investment with interest.",
        code: "FutureValueCalculator",
        // seo: SeoDataImport.FutureValueCalculator
      },
      {
        name: "Present Value Calculator",
        slug: "present-value-calculator",
        icon: <MdCalculate />,
        desc: "Calculate the present value of future cash flows.",
        code: "PresentValueCalculator",
        // seo: SeoDataImport.PresentValueCalculator
      },
      {
        name: "Debt to Income Ratio Calculator",
        slug: "debt-to-income-ratio-calculator",
        icon: <MdAccountBalance />,
        desc: "Calculate your debt-to-income ratio for financial health.",
        code: "DebtToIncomeRatioCalculator",
        // seo: SeoDataImport.DebtToIncomeRatioCalculator
      },
      {
        name: "Stock Profit Calculator",
        slug: "stock-profit-calculator",
        icon: <MdTrendingUp />,
        desc: "Calculate profits or losses from stock investments.",
        code: "StockProfitCalculator",
        // seo: SeoDataImport.StockProfitCalculator
      },
      {
        name: "Dividend Yield Calculator",
        slug: "dividend-yield-calculator",
        icon: <MdAttachMoney />,
        desc: "Determine the dividend yield of a stock investment.",
        code: "DividendYieldCalculator",
        // seo: SeoDataImport.DividendYieldCalculator
      },
      {
        name: "Break-Even Point Calculator",
        slug: "break-even-point-calculator",
        icon: <MdCalculate />,
        desc: "Find the break-even point for business or investments.",
        code: "BreakEvenPointCalculator",
        // seo: SeoDataImport.BreakEvenPointCalculator
      },
      {
        name: "Savings Interest Calculator",
        slug: "savings-interest-calculator",
        icon: <MdSavings />,
        desc: "Calculate interest earned on savings accounts.",
        code: "SavingsInterestCalculator",
        // seo: SeoDataImport.SavingsInterestCalculator
      },
      {
        name: "Income Tax Bracket Analyzer",
        slug: "income-tax-bracket-analyzer",
        icon: <MdAttachMoney />,
        desc: "Determine your tax bracket based on income.",
        code: "IncomeTaxBracketAnalyzer",
        // seo: SeoDataImport.IncomeTaxBracketAnalyzer
      },
      {
        name: "Payroll Tax Calculator",
        slug: "payroll-tax-calculator",
        icon: <MdAccountBalance />,
        desc: "Estimate payroll taxes for employers and employees.",
        code: "PayrollTaxCalculator",
        // seo: SeoDataImport.PayrollTaxCalculator
      },
      {
        name: "Financial Independence Calculator",
        slug: "financial-independence-calculator",
        icon: <MdTrendingUp />,
        desc: "Plan for financial independence with savings and expenses.",
        code: "FinancialIndependenceCalculator",
        // seo: SeoDataImport.FinancialIndependenceCalculator
      },
      {
        name: "Expense Tracker",
        slug: "expense-tracker",
        icon: <MdCalculate />,
        desc: "Track and categorize daily or monthly expenses.",
        code: "ExpenseTracker",
        // seo: SeoDataImport.ExpenseTracker
      },
      {
        name: "Car Loan Calculator",
        slug: "car-loan-calculator",
        icon: <MdDirectionsCar />,
        desc: "Calculate payments and interest for car loans.",
        code: "CarLoanCalculator",
        // seo: SeoDataImport.CarLoanCalculator
      },
      {
        name: "Rental Yield Calculator",
        slug: "rental-yield-calculator",
        icon: <MdHome />,
        desc: "Calculate rental yield for real estate investments.",
        code: "RentalYieldCalculator",
        // seo: SeoDataImport.RentalYieldCalculator
      },
      {
        name: "Profit Margin Calculator",
        slug: "profit-margin-calculator",
        icon: <MdCalculate />,
        desc: "Determine profit margins from revenue and costs.",
        code: "ProfitMarginCalculator",
        // seo: SeoDataImport.ProfitMarginCalculator
      },
      {
        name: "Cash Flow Calculator",
        slug: "cash-flow-calculator",
        icon: <MdAccountBalance />,
        desc: "Analyze cash flow for personal or business finances.",
        code: "CashFlowCalculator",
        // seo: SeoDataImport.CashFlowCalculator
      },
      {
        name: "IRA Contribution Calculator",
        slug: "ira-contribution-calculator",
        icon: <MdSavings />,
        desc: "Estimate contributions and growth for an IRA account.",
        code: "IRAContributionCalculator",
        // seo: SeoDataImport.IRAContributionCalculator
      },
      {
        name: "401k Calculator",
        slug: "401k-calculator",
        icon: <MdSavings />,
        desc: "Plan your 401k contributions and retirement savings.",
        code: "401kCalculator",
        // seo: SeoDataImport.FourOhOneKCalculator
      },
      {
        name: "Bond Yield Calculator",
        slug: "bond-yield-calculator",
        icon: <MdAttachMoney />,
        desc: "Calculate the yield of bonds based on price and interest.",
        code: "BondYieldCalculator",
        // seo: SeoDataImport.BondYieldCalculator
      },
      {
        name: "Capital Gains Tax Calculator",
        slug: "capital-gains-tax-calculator",
        icon: <MdTrendingUp />,
        desc: "Estimate capital gains tax on investment profits.",
        code: "CapitalGainsTaxCalculator",
        // seo: SeoDataImport.CapitalGainsTaxCalculator
      },
      {
        name: "Depreciation Calculator",
        slug: "depreciation-calculator",
        icon: <MdCalculate />,
        desc: "Calculate asset depreciation using various methods.",
        code: "DepreciationCalculator",
        // seo: SeoDataImport.DepreciationCalculator
      },
      {
        name: "Sales Tax Calculator",
        slug: "sales-tax-calculator",
        icon: <MdAttachMoney />,
        desc: "Compute sales tax amounts based on rates and totals.",
        code: "SalesTaxCalculator",
        // seo: SeoDataImport.SalesTaxCalculator
      },
      {
        name: "Cost of Living Calculator",
        slug: "cost-of-living-calculator",
        icon: <MdAccountBalance />,
        desc: "Compare cost of living between different locations.",
        code: "CostOfLivingCalculator",
        // seo: SeoDataImport.CostOfLivingCalculator
      },
      {
        name: "Student Loan Calculator",
        slug: "student-loan-calculator",
        icon: <MdSchool />,
        desc: "Estimate payments and timelines for student loans.",
        code: "StudentLoanCalculator",
        // seo: SeoDataImport.StudentLoanCalculator
      },
      {
        name: "Crypto Profit Calculator",
        slug: "crypto-profit-calculator",
        icon: <MdTrendingUp />,
        desc: "Calculate profits or losses from cryptocurrency trades.",
        code: "CryptoProfitCalculator",
        // seo: SeoDataImport.CryptoProfitCalculator
      },
      {
        name: "Exchange Rate Forecaster",
        slug: "exchange-rate-forecaster",
        icon: <MdAttachMoney />,
        desc: "Forecast future exchange rates based on trends.",
        code: "ExchangeRateForecaster",
        // seo: SeoDataImport.ExchangeRateForecaster
      },
      {
        name: "Lease Payment Calculator",
        slug: "lease-payment-calculator",
        icon: <MdHome />,
        desc: "Calculate monthly lease payments for equipment or property.",
        code: "LeasePaymentCalculator",
        // seo: SeoDataImport.LeasePaymentCalculator
      },
      {
        name: "Time Value of Money Calculator",
        slug: "time-value-of-money-calculator",
        icon: <MdCalculate />,
        desc: "Calculate present and future values with interest rates.",
        code: "TimeValueOfMoneyCalculator",
        // seo: SeoDataImport.TimeValueOfMoneyCalculator
      },
      {
        name: "Net Present Value Calculator",
        slug: "net-present-value-calculator",
        icon: <MdCalculate />,
        desc: "Compute the NPV of cash flows for investment decisions.",
        code: "NetPresentValueCalculator",
        // seo: SeoDataImport.NetPresentValueCalculator
      },
      {
        name: "Internal Rate of Return Calculator",
        slug: "internal-rate-of-return-calculator",
        icon: <MdCalculate />,
        desc: "Calculate IRR for investment profitability analysis.",
        code: "InternalRateOfReturnCalculator",
        // seo: SeoDataImport.InternalRateOfReturnCalculator
      },
      {
        name: "Business Valuation Calculator",
        slug: "business-valuation-calculator",
        icon: <MdBusiness />,
        desc: "Estimate the value of a business based on revenue and assets.",
        code: "BusinessValuationCalculator",
        // seo: SeoDataImport.BusinessValuationCalculator
      },
      {
        name: "Payback Period Calculator",
        slug: "payback-period-calculator",
        icon: <MdCalculate />,
        desc: "Determine the time to recover an investment cost.",
        code: "PaybackPeriodCalculator",
        // seo: SeoDataImport.PaybackPeriodCalculator
      },
      {
        name: "Financial Ratio Analyzer",
        slug: "financial-ratio-analyzer",
        icon: <MdCalculate />,
        desc: "Analyze key financial ratios like liquidity and debt.",
        code: "FinancialRatioAnalyzer",
        // seo: SeoDataImport.FinancialRatioAnalyzer
      },
      {
        name: "Emergency Fund Calculator",
        slug: "emergency-fund-calculator",
        icon: <MdSavings />,
        desc: "Calculate the ideal size of an emergency fund.",
        code: "EmergencyFundCalculator",
        // seo: SeoDataImport.EmergencyFundCalculator
      },
      {
        name: "Home Affordability Calculator",
        slug: "home-affordability-calculator",
        icon: <MdHome />,
        desc: "Estimate how much house you can afford based on income.",
        code: "HomeAffordabilityCalculator",
        // seo: SeoDataImport.HomeAffordabilityCalculator
      },
    ],
  },
  {
    category: "Data Generator Tools",
    slug: "data-generator-tools",
    desc: "Tools for generating structured data in various formats",
    icon: <MdDataObject />,
    tools: [
      {
        name: "JSON Data Generator",
        slug: "json-data-generator",
        icon: <MdDataObject />,
        desc: "Generate sample JSON data for testing and development.",
        code: "JSONDataGenerator",
        seo: SeoDataImport.JSONDataGenerator,
      },
      {
        name: "YAML Data Generator",
        slug: "yaml-data-generator",
        icon: <MdDataObject />,
        desc: "Create YAML formatted data for configuration or testing.",
        code: "YAMLDataGenerator",
        seo: SeoDataImport.YAMLDataGenerator,
      },
      {
        name: "XML Data Generator",
        slug: "xml-data-generator",
        icon: <MdDataObject />,
        desc: "Generate XML data for use in development or simulations.",
        code: "XMLDataGenerator",
        seo: SeoDataImport.XMLDataGenerator,
      },
      {
        name: "CSV Data Generator",
        slug: "csv-data-generator",
        icon: <MdDataObject />,
        desc: "Produce CSV data for spreadsheets or database testing.",
        code: "CSVDataGenerator",
        seo: SeoDataImport.CSVDataGenerator,
      },
      {
        name: "SQL Data Generator",
        slug: "sql-data-generator",
        icon: <MdDataObject />,
        desc: "Generate SQL insert statements for database population.",
        code: "SQLDataGenerator",
        seo: SeoDataImport.SQLDataGenerator,
      },
      {
        name: "TOML Data Generator",
        slug: "toml-data-generator",
        icon: <MdDataObject />,
        desc: "Create TOML formatted data for lightweight configuration.",
        code: "TOMLDataGenerator",
        seo: SeoDataImport.TOMLDataGenerator,
      },
      {
        name: "Protobuf Data Generator",
        slug: "protobuf-data-generator",
        icon: <MdDataObject />,
        desc: "Produce Protocol Buffers data for efficient serialization.",
        code: "ProtobufDataGenerator",
        seo: SeoDataImport.ProtobufDataGenerator,
      },
      {
        name: "Avro Data Generator",
        slug: "avro-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Avro formatted data for big data processing.",
        code: "AvroDataGenerator",
        seo: SeoDataImport.AvroDataGenerator,
      },
      {
        name: "Parquet Data Generator",
        slug: "parquet-data-generator",
        icon: <MdDataObject />,
        desc: "Create Parquet files for columnar data storage.",
        code: "ParquetDataGenerator",
        seo: SeoDataImport.ParquetDataGenerator,
      },
      {
        name: "INI Data Generator",
        slug: "ini-data-generator",
        icon: <MdDataObject />,
        desc: "Generate INI formatted data for simple configuration files.",
        code: "INIDataGenerator",
        seo: SeoDataImport.INIDataGenerator,
      },
      {
        name: "TSV Data Generator",
        slug: "tsv-data-generator",
        icon: <MdDataObject />,
        desc: "Produce tab-separated values (TSV) data for tabular datasets.",
        code: "TSVDataGenerator",
        seo: SeoDataImport.TSVDataGenerator,
      },
      {
        name: "RDF Data Generator",
        slug: "rdf-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Resource Description Framework data for semantic web.",
        code: "RDFDataGenerator",
        seo: SeoDataImport.RDFDataGenerator,
      },
      {
        name: "JSONL Data Generator",
        slug: "jsonl-data-generator",
        icon: <MdDataObject />,
        desc: "Create JSON Lines data for streaming or logging purposes.",
        code: "JSONLDataGenerator",
        seo: SeoDataImport.JSONLDataGenerator,
      },
      {
        name: "BSON Data Generator",
        slug: "bson-data-generator",
        icon: <MdDataObject />,
        desc: "Generate BSON data for MongoDB-compatible binary storage.",
        code: "BSONDataGenerator",
        seo: SeoDataImport.BSONDataGenerator,
      },
      {
        name: "Markdown Table Generator",
        slug: "markdown-table-generator",
        icon: <MdDataObject />,
        desc: "Produce Markdown tables for documentation or display.",
        code: "MarkdownTableGenerator",
        seo: SeoDataImport.MarkdownTableGenerator,
      },
      {
        name: "Apache Arrow Data Generator",
        slug: "apache-arrow-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Apache Arrow data for in-memory analytics.",
        code: "ApacheArrowDataGenerator",
        seo: SeoDataImport.ApacheArrowDataGenerator,
      },
      {
        name: "HDF5 Data Generator",
        slug: "hdf5-data-generator",
        icon: <MdDataObject />,
        desc: "Create HDF5 datasets for scientific data storage.",
        code: "HDF5DataGenerator",
        seo: SeoDataImport.HDF5DataGenerator,
      },
      {
        name: "EDN Data Generator",
        slug: "edn-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Extensible Data Notation data for Clojure projects.",
        code: "EDNDataGenerator",
        seo: SeoDataImport.EDNDataGenerator,
      },
      {
        name: "ORC Data Generator",
        slug: "orc-data-generator",
        icon: <MdDataObject />,
        desc: "Produce Optimized Row Columnar (ORC) data for big data.",
        code: "ORCDataGenerator",
        seo: SeoDataImport.ORCDataGenerator,
      },
      {
        name: "MessagePack Data Generator",
        slug: "messagepack-data-generator",
        icon: <MdDataObject />,
        desc: "Generate MessagePack data for compact binary serialization.",
        code: "MessagePackDataGenerator",
        seo: SeoDataImport.MessagePackDataGenerator,
      },
      {
        name: "LDIF Data Generator",
        slug: "ldif-data-generator",
        icon: <MdDataObject />,
        desc: "Create LDAP Data Interchange Format data for directory services.",
        code: "LDIFDataGenerator",
        seo: SeoDataImport.LDIFDataGenerator,
      },
      {
        name: "GeoJSON Data Generator",
        slug: "geojson-data-generator",
        icon: <MdDataObject />,
        desc: "Generate GeoJSON data for geospatial applications.",
        code: "GeoJSONDataGenerator",
        seo: SeoDataImport.GeoJSONDataGenerator,
      },
      {
        name: "KML Data Generator",
        slug: "kml-data-generator",
        icon: <MdDataObject />,
        desc: "Create Keyhole Markup Language data for geographic visualization.",
        code: "KMLDataGenerator",
        seo: SeoDataImport.KMLDataGenerator,
      },
      {
        name: "Thrift Data Generator",
        slug: "thrift-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Apache Thrift data for cross-language RPC.",
        code: "ThriftDataGenerator",
        seo: SeoDataImport.ThriftDataGenerator,
      },
      {
        name: "CBOR Data Generator",
        slug: "cbor-data-generator",
        icon: <MdDataObject />,
        desc: "Produce Concise Binary Object Representation data for IoT.",
        code: "CBORDataGenerator",
        seo: SeoDataImport.CBORDataGenerator,
      },
      {
        name: "DSON Data Generator",
        slug: "dson-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Doge Serialized Object Notation data for playful testing.",
        code: "DSONDataGenerator",
        seo: SeoDataImport.DSONDataGenerator,
      },

      {
        name: "FlatBuffers Data Generator",
        slug: "flatbuffers-data-generator",
        icon: <MdDataObject />,
        desc: "Produce FlatBuffers data for high-performance serialization.",
        code: "FlatBuffersDataGenerator",
        seo: SeoDataImport.FlatBuffersDataGenerator,
      },
      {
        name: "HOCON Data Generator",
        slug: "hocon-data-generator",
        icon: <MdDataObject />,
        desc: "Generate Human-Optimized Config Object Notation data.",
        code: "HOCONDataGenerator",
        seo: SeoDataImport.HOCONDataGenerator,
      },
    ],
  },
  {
    category: "Schema or Model Generator Tools",
    slug: "schema-model-generator-tools",
    desc: "Tools for generating schemas, models, or database structures",
    icon: <MdSchema />,
    tools: [
      
      {
        name: "MongoDB Schema Generator",
        slug: "mongodb-schema-generator",
        icon: <MdSchema />,
        desc: "Generate MongoDB schemas for NoSQL document collections.",
        code: "MongoDBSchemaGenerator",
        seo: SeoDataImport.MongoDBSchemaGenerator,
      },
      {
        name: "MySQL Schema Generator",
        slug: "mysql-schema-generator",
        icon: <MdSchema />,
        desc: "Create MySQL database schemas with tables and relationships.",
        code: "MySQLSchemaGenerator",
        seo: SeoDataImport.MySQLSchemaGenerator,
      },
      {
        name: "Prisma Schema Generator",
        slug: "prisma-schema-generator",
        icon: <MdSchema />,
        desc: "Generate Prisma schemas for type-safe database access.",
        code: "PrismaSchemaGenerator",
        seo: SeoDataImport.PrismaSchemaGenerator,
      },
      {
        name: "PostgreSQL Schema Generator",
        slug: "postgresql-schema-generator",
        icon: <MdSchema />,
        desc: "Produce PostgreSQL schemas with advanced constraints.",
        code: "PostgreSQLSchemaGenerator",
        seo: SeoDataImport.PostgreSQLSchemaGenerator,
      },
      {
        name: "SQLite Schema Generator",
        slug: "sqlite-schema-generator",
        icon: <MdSchema />,
        desc: "Generate SQLite database schemas for lightweight applications.",
        code: "SQLiteSchemaGenerator",
        seo: SeoDataImport.SQLiteSchemaGenerator,
      },
      {
        name: "DynamoDB Schema Generator",
        slug: "dynamodb-schema-generator",
        icon: <MdSchema />,
        desc: "Create DynamoDB table schemas for AWS NoSQL databases.",
        code: "DynamoDBSchemaGenerator",
        seo: SeoDataImport.DynamoDBSchemaGenerator,
      },
      
      {
        name: "GraphQL Model Generator",
        slug: "graphql-model-generator",
        icon: <MdSchema />,
        desc: "Generate GraphQL type definitions and resolvers.",
        code: "GraphQLModelGenerator",
        seo: SeoDataImport.GraphQLModelGenerator,
      },
      

      {
        name: "CouchDB Schema Generator",
        slug: "couchdb-schema-generator",
        icon: <MdSchema />,
        desc: "Generate CouchDB document schemas for NoSQL.",
        code: "CouchDBSchemaGenerator",
        seo: SeoDataImport.CouchDBSchemaGenerator,
      },

      {
        name: "ArangoDB Schema Generator",
        slug: "arangodb-schema-generator",
        icon: <MdSchema />,
        desc: "Generate ArangoDB schemas for multi-model databases.",
        code: "ArangoDBSchemaGenerator",
        seo: SeoDataImport.ArangoDBSchemaGenerator,
      },
      {
        name: "InfluxDB Schema Generator",
        slug: "influxdb-schema-generator",
        icon: <MdSchema />,
        desc: "Create InfluxDB schemas for time-series data.",
        code: "InfluxDBSchemaGenerator",
        seo: SeoDataImport.InfluxDBSchemaGenerator,
      },
      {
        name: "TimescaleDB Schema Generator",
        slug: "timescaledb-schema-generator",
        icon: <MdSchema />,
        desc: "Generate TimescaleDB schemas for time-series PostgreSQL.",
        code: "TimescaleDBSchemaGenerator",
        seo: SeoDataImport.TimescaleDBSchemaGenerator,
      },

      {
        name: "MariaDB Schema Generator",
        slug: "mariadb-schema-generator",
        icon: <MdSchema />,
        desc: "Generate MariaDB schemas for relational databases.",
        code: "MariaDBSchemaGenerator",
        seo: SeoDataImport.MariaDBSchemaGenerator,
      },
      {
        name: "SurrealDB Schema Generator",
        slug: "surrealdb-schema-generator",
        icon: <MdSchema />,
        desc: "Create SurrealDB schemas for multi-model NoSQL.",
        code: "SurrealDBSchemaGenerator",
        seo: SeoDataImport.SurrealDBSchemaGenerator,
      },
      {
        name: "Supabase Schema Generator",
        slug: "supabase-schema-generator",
        icon: <MdSchema />,
        desc: "Generate Supabase schemas for PostgreSQL-based APIs.",
        code: "SupabaseSchemaGenerator",
        seo: SeoDataImport.SupabaseSchemaGenerator,
      },
      {
        name: "Cassandra Schema Generator",
        slug: "cassandra-schema-generator",
        icon: <MdSchema />,
        desc: "Generate Cassandra schemas for distributed NoSQL databases.",
        code: "CassandraSchemaGenerator",
        seo: SeoDataImport.CassandraSchemaGenerator,
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
        seo: SeoDataImport.BarcodeScanner,
      },
      {
        name: "QR Code Scanner",
        slug: "qr-code-scanner",
        icon: <MdQrCodeScanner />,
        desc: "Scan QR codes to access links, product info, or promotions.",
        code: "QRCodeScanner",
        seo: SeoDataImport.QRCodeScanner,
      },
      {
        name: "YouTube to Text",
        slug: "youtube-to-text",
        icon: <MdVideoLibrary />,
        desc: "Retrieve and download transcripts from YouTube videos.",
        code: "YouTubeToText",
        seo: SeoDataImport.YouTubeToTextConverter,
      },
      // New 100 Unique Misc Tools
      {
        name: "Random Name Generator",
        slug: "random-name-generator",
        icon: <MdPersonOutline />,
        desc: "Generate random names for characters, usernames, or projects.",
        code: "RandomNameGenerator",
        // seo: SeoDataImport.RandomNameGenerator
      },
      {
        name: "Weather Forecast Viewer",
        slug: "weather-forecast-viewer",
        icon: <MdWbSunny />,
        desc: "View current and forecasted weather for any location.",
        code: "WeatherForecastViewer",
        // seo: SeoDataImport.WeatherForecastViewer
      },
      {
        name: "Unit Price Comparator",
        slug: "unit-price-comparator",
        icon: <MdShoppingCart />,
        desc: "Compare unit prices of products to find the best deal.",
        code: "UnitPriceComparator",
        // seo: SeoDataImport.UnitPriceComparator
      },
      {
        name: "Text Translator",
        slug: "text-translator",
        icon: <MdTranslate />,
        desc: "Translate text into multiple languages instantly.",
        code: "TextTranslator",
        // seo: SeoDataImport.TextTranslator
      },
      {
        name: "File Size Analyzer",
        slug: "file-size-analyzer",
        icon: <MdInsertDriveFile />,
        desc: "Analyze the size of files and folders on your device.",
        code: "FileSizeAnalyzer",
        // seo: SeoDataImport.FileSizeAnalyzer
      },
      {
        name: "Random Dice Roller",
        slug: "random-dice-roller",
        icon: <MdCasino />,
        desc: "Roll virtual dice with customizable sides and quantities.",
        code: "RandomDiceRoller",
        // seo: SeoDataImport.RandomDiceRoller
      },
      {
        name: "Event Countdown Creator",
        slug: "event-countdown-creator",
        icon: <MdEvent />,
        desc: "Create countdowns for events or deadlines.",
        code: "EventCountdownCreator",
        // seo: SeoDataImport.EventCountdownCreator
      },
      {
        name: "IP Geolocation Finder",
        slug: "ip-geolocation-finder",
        icon: <MdLocationOn />,
        desc: "Find the geographic location of an IP address.",
        code: "IPGeolocationFinder",
        // seo: SeoDataImport.IPGeolocationFinder
      },
      {
        name: "Domain Availability Checker",
        slug: "domain-availability-checker",
        icon: <MdDomain />,
        desc: "Check if a domain name is available for registration.",
        code: "DomainAvailabilityChecker",
        // seo: SeoDataImport.DomainAvailabilityChecker
      },
      {
        name: "Website Uptime Monitor",
        slug: "website-uptime-monitor",
        icon: <MdNetworkCheck />,
        desc: "Monitor website uptime and receive downtime alerts.",
        code: "WebsiteUptimeMonitor",
        // seo: SeoDataImport.WebsiteUptimeMonitor
      },
      {
        name: "Random Team Generator",
        slug: "random-team-generator",
        icon: <MdGroup />,
        desc: "Generate random teams from a list of names.",
        code: "RandomTeamGenerator",
        // seo: SeoDataImport.RandomTeamGenerator
      },
      {
        name: "Speed Test Tool",
        slug: "speed-test-tool",
        icon: <MdSpeed />,
        desc: "Test your internet download and upload speeds.",
        code: "SpeedTestTool",
        // seo: SeoDataImport.SpeedTestTool
      },
      {
        name: "Random Password Phrase Generator",
        slug: "random-password-phrase-generator",
        icon: <MdLock />,
        desc: "Generate memorable password phrases using random words.",
        code: "RandomPasswordPhraseGenerator",
        // seo: SeoDataImport.RandomPasswordPhraseGenerator
      },
      {
        name: "Typing Speed Tester",
        slug: "typing-speed-tester",
        icon: <MdKeyboard />,
        desc: "Measure your typing speed and accuracy.",
        code: "TypingSpeedTester",
        // seo: SeoDataImport.TypingSpeedTester
      },
      {
        name: "Random Country Generator",
        slug: "random-country-generator",
        icon: <MdPublic />,
        desc: "Generate a random country name with basic info.",
        code: "RandomCountryGenerator",
        // seo: SeoDataImport.RandomCountryGenerator
      },
      {
        name: "Sound Frequency Generator",
        slug: "sound-frequency-generator",
        icon: <MdVolumeUp />,
        desc: "Generate audio tones at specific frequencies.",
        code: "SoundFrequencyGenerator",
        // seo: SeoDataImport.SoundFrequencyGenerator
      },
      {
        name: "Random Quote Generator",
        slug: "random-quote-generator",
        icon: <MdFormatQuote />,
        desc: "Generate random quotes for inspiration or fun.",
        code: "RandomQuoteGenerator",
        // seo: SeoDataImport.RandomQuoteGenerator
      },
      {
        name: "Screen Resolution Tester",
        slug: "screen-resolution-tester",
        icon: <MdMonitor />,
        desc: "Test and display your current screen resolution.",
        code: "ScreenResolutionTester",
        // seo: SeoDataImport.ScreenResolutionTester
      },
      {
        name: "Random City Generator",
        slug: "random-city-generator",
        icon: <MdLocationCity />,
        desc: "Generate random city names with location details.",
        code: "RandomCityGenerator",
        // seo: SeoDataImport.RandomCityGenerator
      },
      {
        name: "Metronome Tool",
        slug: "metronome-tool",
        icon: <MdMusicNote />,
        desc: "Use an online metronome for music practice or timing.",
        code: "MetronomeTool",
        // seo: SeoDataImport.MetronomeTool
      },
      {
        name: "Random Animal Generator",
        slug: "random-animal-generator",
        icon: <MdPets />,
        desc: "Generate random animal names with fun facts.",
        code: "RandomAnimalGenerator",
        // seo: SeoDataImport.RandomAnimalGenerator
      },
      {
        name: "Clipboard Manager",
        slug: "clipboard-manager",
        icon: <MdContentPaste />,
        desc: "Manage and access your clipboard history easily.",
        code: "ClipboardManager",
        // seo: SeoDataImport.ClipboardManager
      },
      {
        name: "Random Movie Picker",
        slug: "random-movie-picker",
        icon: <MdMovie />,
        desc: "Pick a random movie from a genre or list.",
        code: "RandomMoviePicker",
        // seo: SeoDataImport.RandomMoviePicker
      },
      {
        name: "Timezone Meeting Scheduler",
        slug: "timezone-meeting-scheduler",
        icon: <MdSchedule />,
        desc: "Schedule meetings across multiple time zones.",
        code: "TimezoneMeetingScheduler",
        // seo: SeoDataImport.TimezoneMeetingScheduler
      },
      {
        name: "Random Book Title Generator",
        slug: "random-book-title-generator",
        icon: <MdBook />,
        desc: "Generate random book titles for creative inspiration.",
        code: "RandomBookTitleGenerator",
        // seo: SeoDataImport.RandomBookTitleGenerator
      },
      {
        name: "Mouse Click Counter",
        slug: "mouse-click-counter",
        icon: <MdMouse />,
        desc: "Count mouse clicks for gaming or testing purposes.",
        code: "MouseClickCounter",
        // seo: SeoDataImport.MouseClickCounter
      },
      {
        name: "Random Recipe Generator",
        slug: "random-recipe-generator",
        icon: <MdRestaurant />,
        desc: "Generate random recipes based on available ingredients.",
        code: "RandomRecipeGenerator",
        // seo: SeoDataImport.RandomRecipeGenerator
      },
      {
        name: "URL Shortener",
        slug: "url-shortener",
        icon: <MdLink />,
        desc: "Shorten long URLs for easy sharing.",
        code: "URLShortener",
        // seo: SeoDataImport.URLShortener
      },
      {
        name: "Random Song Lyric Generator",
        slug: "random-song-lyric-generator",
        icon: <MdMusicNote />,
        desc: "Create random song lyrics for inspiration.",
        code: "RandomSongLyricGenerator",
        // seo: SeoDataImport.RandomSongLyricGenerator
      },
      {
        name: "Device Information Viewer",
        slug: "device-information-viewer",
        icon: <MdSettings />,
        desc: "Display details about your device’s hardware and software.",
        code: "DeviceInformationViewer",
        // seo: SeoDataImport.DeviceInformationViewer
      },
      {
        name: "Random Trivia Question Generator",
        slug: "random-trivia-question-generator",
        icon: <MdQuiz />,
        desc: "Generate random trivia questions for fun or quizzes.",
        code: "RandomTriviaQuestionGenerator",
        // seo: SeoDataImport.RandomTriviaQuestionGenerator
      },
      {
        name: "Battery Status Checker",
        slug: "battery-status-checker",
        icon: <MdBatteryChargingFull />,
        desc: "Check your device’s battery level and health.",
        code: "BatteryStatusChecker",
        // seo: SeoDataImport.BatteryStatusChecker
      },
      {
        name: "Random Card Drawer",
        slug: "random-card-drawer",
        icon: <MdCasino />,
        desc: "Draw random cards from a virtual deck.",
        code: "RandomCardDrawer",
        // seo: SeoDataImport.RandomCardDrawer
      },
      {
        name: "Noise Level Meter",
        slug: "noise-level-meter",
        icon: <MdVolumeUp />,
        desc: "Measure ambient noise levels using your device.",
        code: "NoiseLevelMeter",
        // seo: SeoDataImport.NoiseLevelMeter
      },
      {
        name: "Random Joke Generator",
        slug: "random-joke-generator",
        icon: <MdSentimentSatisfied />,
        desc: "Generate random jokes for a quick laugh.",
        code: "RandomJokeGenerator",
        // seo: SeoDataImport.RandomJokeGenerator
      },
      {
        name: "Browser Compatibility Checker",
        slug: "browser-compatibility-checker",
        icon: <MdWeb />,
        desc: "Check website compatibility across different browsers.",
        code: "BrowserCompatibilityChecker",
        // seo: SeoDataImport.BrowserCompatibilityChecker
      },
      {
        name: "Random Word Pair Generator",
        slug: "random-word-pair-generator",
        icon: <MdTextFields />,
        desc: "Generate random word pairs for creative prompts.",
        code: "RandomWordPairGenerator",
        // seo: SeoDataImport.RandomWordPairGenerator
      },
      {
        name: "Light Meter Tool",
        slug: "light-meter-tool",
        icon: <MdBrightness5 />,
        desc: "Measure ambient light levels using your device.",
        code: "LightMeterTool",
        // seo: SeoDataImport.LightMeterTool
      },
      {
        name: "Random Workout Generator",
        slug: "random-workout-generator",
        icon: <MdFitnessCenter />,
        desc: "Create random workout routines based on fitness goals.",
        code: "RandomWorkoutGenerator",
        // seo: SeoDataImport.RandomWorkoutGenerator
      },
      {
        name: "Keyboard Shortcut Finder",
        slug: "keyboard-shortcut-finder",
        icon: <MdKeyboard />,
        desc: "Find keyboard shortcuts for popular applications.",
        code: "KeyboardShortcutFinder",
        // seo: SeoDataImport.KeyboardShortcutFinder
      },
      {
        name: "Random Emoji Generator",
        slug: "random-emoji-generator",
        icon: <MdEmojiEmotions />,
        desc: "Generate random sets of emojis for fun or messaging.",
        code: "RandomEmojiGenerator",
        // seo: SeoDataImport.RandomEmojiGenerator
      },
      {
        name: "File Type Identifier",
        slug: "file-type-identifier",
        icon: <MdInsertDriveFile />,
        desc: "Identify the type and format of any file.",
        code: "FileTypeIdentifier",
        // seo: SeoDataImport.FileTypeIdentifier
      },
      {
        name: "Random Art Prompt Generator",
        slug: "random-art-prompt-generator",
        icon: <MdBrush />,
        desc: "Generate creative art prompts for artists.",
        code: "RandomArtPromptGenerator",
        // seo: SeoDataImport.RandomArtPromptGenerator
      },
      {
        name: "Webcam Tester",
        slug: "webcam-tester",
        icon: <MdVideocam />,
        desc: "Test your webcam functionality and quality.",
        code: "WebcamTester",
        // seo: SeoDataImport.WebcamTester
      },
      {
        name: "Random Password Hint Generator",
        slug: "random-password-hint-generator",
        icon: <MdLock />,
        desc: "Create obscure password hints for security.",
        code: "RandomPasswordHintGenerator",
        // seo: SeoDataImport.RandomPasswordHintGenerator
      },
      {
        name: "Microphone Tester",
        slug: "microphone-tester",
        icon: <MdMic />,
        desc: "Test your microphone’s audio input and quality.",
        code: "MicrophoneTester",
        // seo: SeoDataImport.MicrophoneTester
      },
      {
        name: "Random Story Starter Generator",
        slug: "random-story-starter-generator",
        icon: <MdCreate />,
        desc: "Generate random story starters for writers.",
        code: "RandomStoryStarterGenerator",
        // seo: SeoDataImport.RandomStoryStarterGenerator
      },
      {
        name: "Random Riddle Generator",
        slug: "random-riddle-generator",
        icon: <MdQuiz />,
        desc: "Create random riddles for entertainment or challenges.",
        code: "RandomRiddleGenerator",
        // seo: SeoDataImport.RandomRiddleGenerator
      },
      {
        name: "Mouse Sensitivity Tester",
        slug: "mouse-sensitivity-tester",
        icon: <MdMouse />,
        desc: "Test and adjust your mouse sensitivity settings.",
        code: "MouseSensitivityTester",
        // seo: SeoDataImport.MouseSensitivityTester
      },
      {
        name: "Random Plant Generator",
        slug: "random-plant-generator",
        icon: <MdLocalFlorist />,
        desc: "Generate random plant names with care tips.",
        code: "RandomPlantGenerator",
        // seo: SeoDataImport.RandomPlantGenerator
      },
      {
        name: "Hotkey Customizer",
        slug: "hotkey-customizer",
        icon: <MdKeyboard />,
        desc: "Customize hotkeys for your applications or games.",
        code: "HotkeyCustomizer",
        // seo: SeoDataImport.HotkeyCustomizer
      },
      {
        name: "Random Vehicle Generator",
        slug: "random-vehicle-generator",
        icon: <MdDirectionsCar />,
        desc: "Generate random vehicle makes and models.",
        code: "RandomVehicleGenerator",
        // seo: SeoDataImport.RandomVehicleGenerator
      },
      {
        name: "Clipboard Text Cleaner",
        slug: "clipboard-text-cleaner",
        icon: <MdContentPaste />,
        desc: "Clean formatting from text copied to your clipboard.",
        code: "ClipboardTextCleaner",
        // seo: SeoDataImport.ClipboardTextCleaner
      },
      {
        name: "Random Historical Event Generator",
        slug: "random-historical-event-generator",
        icon: <MdHistory />,
        desc: "Generate details of random historical events.",
        code: "RandomHistoricalEventGenerator",
        // seo: SeoDataImport.RandomHistoricalEventGenerator
      },
      {
        name: "Screen Color Calibrator",
        slug: "screen-color-calibrator",
        icon: <MdMonitor />,
        desc: "Calibrate your screen’s color settings for accuracy.",
        code: "ScreenColorCalibrator",
        // seo: SeoDataImport.ScreenColorCalibrator
      },
      {
        name: "Random Language Phrase Generator",
        slug: "random-language-phrase-generator",
        icon: <MdTranslate />,
        desc: "Generate random phrases in various languages.",
        code: "RandomLanguagePhraseGenerator",
        // seo: SeoDataImport.RandomLanguagePhraseGenerator
      },
      {
        name: "Virtual Coin Flipper",
        slug: "virtual-coin-flipper",
        icon: <MdCasino />,
        desc: "Flip a virtual coin for heads or tails decisions.",
        code: "VirtualCoinFlipper",
        // seo: SeoDataImport.VirtualCoinFlipper
      },
      {
        name: "Random Food Dish Generator",
        slug: "random-food-dish-generator",
        icon: <MdRestaurant />,
        desc: "Generate random food dishes from global cuisines.",
        code: "RandomFoodDishGenerator",
        // seo: SeoDataImport.RandomFoodDishGenerator
      },
      {
        name: "Task Randomizer",
        slug: "task-randomizer",
        icon: <MdList />,
        desc: "Randomize a list of tasks for scheduling or fun.",
        code: "TaskRandomizer",
        // seo: SeoDataImport.TaskRandomizer
      },
      {
        name: "Random Writing Prompt Generator",
        slug: "random-writing-prompt-generator",
        icon: <MdCreate />,
        desc: "Generate random writing prompts for authors.",
        code: "RandomWritingPromptGenerator",
        // seo: SeoDataImport.RandomWritingPromptGenerator
      },
      {
        name: "Random Image Downloader",
        slug: "random-image-downloader",
        icon: <MdImage />,
        desc: "Download random images from the web based on keywords.",
        code: "RandomImageDownloader",
        // seo: SeoDataImport.RandomImageDownloader
      },
      {
        name: "Virtual Spinner Wheel",
        slug: "virtual-spinner-wheel",
        icon: <MdCasino />,
        desc: "Spin a customizable virtual wheel for decisions or games.",
        code: "VirtualSpinnerWheel",
        // seo: SeoDataImport.VirtualSpinnerWheel
      },
      {
        name: "Random Character Trait Generator",
        slug: "random-character-trait-generator",
        icon: <MdPersonOutline />,
        desc: "Generate random traits for fictional characters.",
        code: "RandomCharacterTraitGenerator",
        // seo: SeoDataImport.RandomCharacterTraitGenerator
      },
      {
        name: "Browser Cache Cleaner",
        slug: "browser-cache-cleaner",
        icon: <MdWeb />,
        desc: "Clear your browser cache with a single click.",
        code: "BrowserCacheCleaner",
        // seo: SeoDataImport.BrowserCacheCleaner
      },
      {
        name: "Random Music Genre Picker",
        slug: "random-music-genre-picker",
        icon: <MdMusicNote />,
        desc: "Pick a random music genre for listening inspiration.",
        code: "RandomMusicGenrePicker",
        // seo: SeoDataImport.RandomMusicGenrePicker
      },
      {
        name: "Random Travel Destination Generator",
        slug: "random-travel-destination-generator",
        icon: <MdFlight />,
        desc: "Generate random travel destinations with details.",
        code: "RandomTravelDestinationGenerator",
        // seo: SeoDataImport.RandomTravelDestinationGenerator
      },
      {
        name: "Virtual Ruler Tool",
        slug: "virtual-ruler-tool",
        icon: <MdStraighten />,
        desc: "Measure objects on your screen with a virtual ruler.",
        code: "VirtualRulerTool",
        // seo: SeoDataImport.VirtualRulerTool
      },
      {
        name: "Random Fact Generator",
        slug: "random-fact-generator",
        icon: <MdInfoOutline />,
        desc: "Generate random interesting facts on various topics.",
        code: "RandomFactGenerator",
        // seo: SeoDataImport.RandomFactGenerator
      },
      {
        name: "Virtual Compass Tool",
        slug: "virtual-compass-tool",
        icon: <MdExplore />,
        desc: "Use a virtual compass for navigation or curiosity.",
        code: "VirtualCompassTool",
        // seo: SeoDataImport.VirtualCompassTool
      },
      {
        name: "Random Game Idea Generator",
        slug: "random-game-idea-generator",
        icon: <MdVideogameAsset />,
        desc: "Generate random game ideas for developers or players.",
        code: "RandomGameIdeaGenerator",
        // seo: SeoDataImport.RandomGameIdeaGenerator
      },
      {
        name: "Clipboard URL Expander",
        slug: "clipboard-url-expander",
        icon: <MdLink />,
        desc: "Expand shortened URLs copied to your clipboard.",
        code: "ClipboardURLExpander",
        // seo: SeoDataImport.ClipboardURLExpander
      },
      {
        name: "Random Holiday Generator",
        slug: "random-holiday-generator",
        icon: <MdCelebration />,
        desc: "Generate random holidays with celebration ideas.",
        code: "RandomHolidayGenerator",
        // seo: SeoDataImport.RandomHolidayGenerator
      },
      {
        name: "Virtual Level Tool",
        slug: "virtual-level-tool",
        icon: <MdBuild />,
        desc: "Use your device as a virtual level for alignment.",
        code: "VirtualLevelTool",
        // seo: SeoDataImport.VirtualLevelTool
      },
      {
        name: "Random Science Fact Generator",
        slug: "random-science-fact-generator",
        icon: <MdScience />,
        desc: "Generate random science facts for education or fun.",
        code: "RandomScienceFactGenerator",
        // seo: SeoDataImport.RandomScienceFactGenerator
      },
      {
        name: "Browser Extension Tester",
        slug: "browser-extension-tester",
        icon: <MdWeb />,
        desc: "Test browser extensions for compatibility and function.",
        code: "BrowserExtensionTester",
        // seo: SeoDataImport.BrowserExtensionTester
      },
      {
        name: "Random Poetry Line Generator",
        slug: "random-poetry-line-generator",
        icon: <MdCreate />,
        desc: "Generate random lines of poetry for inspiration.",
        code: "RandomPoetryLineGenerator",
        // seo: SeoDataImport.RandomPoetryLineGenerator
      },
      {
        name: "Virtual Protractor Tool",
        slug: "virtual-protractor-tool",
        icon: <MdStraighten />,
        desc: "Measure angles on your screen with a virtual protractor.",
        code: "VirtualProtractorTool",
        // seo: SeoDataImport.VirtualProtractorTool
      },
      {
        name: "Random Mythical Creature Generator",
        slug: "random-mythical-creature-generator",
        icon: <MdBuild />,
        desc: "Generate random mythical creatures with descriptions.",
        code: "RandomMythicalCreatureGenerator",
        // seo: SeoDataImport.RandomMythicalCreatureGenerator
      },
      {
        name: "Random Charity Finder",
        slug: "random-charity-finder",
        icon: <MdVolunteerActivism />,
        desc: "Find random charities to support based on interests.",
        code: "RandomCharityFinder",
        // seo: SeoDataImport.RandomCharityFinder
      },
      {
        name: "Virtual Bubble Level",
        slug: "virtual-bubble-level",
        icon: <MdBuild />,
        desc: "Use a virtual bubble level to check surface alignment.",
        code: "VirtualBubbleLevel",
        // seo: SeoDataImport.VirtualBubbleLevel
      },
      {
        name: "Random Invention Idea Generator",
        slug: "random-invention-idea-generator",
        icon: <MdLightbulbOutline />,
        desc: "Generate random invention ideas for brainstorming.",
        code: "RandomInventionIdeaGenerator",
        // seo: SeoDataImport.RandomInventionIdeaGenerator
      },
      {
        name: "Clipboard History Cleaner",
        slug: "clipboard-history-cleaner",
        icon: <MdContentPaste />,
        desc: "Clear your clipboard history for privacy.",
        code: "ClipboardHistoryCleaner",
        // seo: SeoDataImport.ClipboardHistoryCleaner
      },
      {
        name: "Random Space Object Generator",
        slug: "random-space-object-generator",
        icon: <MdStar />,
        desc: "Generate random space objects like stars or planets.",
        code: "RandomSpaceObjectGenerator",
        // seo: SeoDataImport.RandomSpaceObjectGenerator
      },
      {
        name: "Virtual Magnifier Tool",
        slug: "virtual-magnifier-tool",
        icon: <MdZoomIn />,
        desc: "Magnify parts of your screen for detailed viewing.",
        code: "VirtualMagnifierTool",
        // seo: SeoDataImport.VirtualMagnifierTool
      },
    ],
  },
];

export default ToolList;
