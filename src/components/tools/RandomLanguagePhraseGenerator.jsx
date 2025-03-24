"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaCopy, FaVolumeUp } from "react-icons/fa";

const RandomLanguagePhraseGenerator = () => {
  const [phrase, setPhrase] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("random");
  const [history, setHistory] = useState([]);

  const languages = [
    { name: "Spanish", code: "es" },
    { name: "French", code: "fr" },
    { name: "German", code: "de" },
    { name: "Italian", code: "it" },
    { name: "Japanese", code: "ja" },
    { name: "Russian", code: "ru" },
    { name: "Chinese", code: "zh" },
    { name: "Arabic", code: "ar" },
  ];

  const phrases = {
    greetings: ["Hello", "Good morning", "Good evening", "Hi there", "Welcome"],
    farewells: ["Goodbye", "See you later", "Take care", "Farewell", "Bye"],
    questions: [
      "How are you?",
      "What time is it?",
      "Where are you?",
      "Can you help me?",
      "What is this?",
    ],
    expressions: ["Thank you", "Please", "Excuse me", "I love you", "Sorry"],
  };

  const translations = {
    // Same translations as in your original code (omitted for brevity)
    "Hello": {
      es: "Hola",
      fr: "Bonjour",
      de: "Hallo",
      it: "Ciao",
      ja: "こんにちは",
      ru: "Привет",
      zh: "你好",
      ar: "مرحبا",
    },
    "Good morning": {
      es: "Buenos días",
      fr: "Bon matin",
      de: "Guten Morgen",
      it: "Buongiorno",
      ja: "おはよう",
      ru: "Доброе утро",
      zh: "早上好",
      ar: "صباح الخير",
    },
    "Good evening": {
      es: "Buenas noches",
      fr: "Bonsoir",
      de: "Guten Abend",
      it: "Buonasera",
      ja: "こんばんは",
      ru: "Добрый вечер",
      zh: "晚上好",
      ar: "مساء الخير",
    },
    "Hi there": {
      es: "Hola ahí",
      fr: "Salut là",
      de: "Hallo da",
      it: "Ciao lì",
      ja: "やあ",
      ru: "Привет там",
      zh: "嗨",
      ar: "مرحبا هناك",
    },
    "Welcome": {
      es: "Bienvenido",
      fr: "Bienvenue",
      de: "Willkommen",
      it: "Benvenuto",
      ja: "ようこそ",
      ru: "Добро пожаловать",
      zh: "欢迎",
      ar: "مرحبا",
    },
    "Goodbye": {
      es: "Adiós",
      fr: "Au revoir",
      de: "Auf Wiedersehen",
      it: "Arrivederci",
      ja: "じゃあね",
      ru: "До свидания",
      zh: "再见",
      ar: "وداعا",
    },
    "See you later": {
      es: "Hasta luego",
      fr: "À plus tard",
      de: "Bis später",
      it: "Ci vediamo dopo",
      ja: "またね",
      ru: "Увидимся позже",
      zh: "回头见",
      ar: "أراك لاحقا",
    },
    "Take care": {
      es: "Cuídate",
      fr: "Prends soin",
      de: "Pass auf",
      it: "Stai attento",
      ja: "気をつけて",
      ru: "Береги себя",
      zh: "保重",
      ar: "اعتن بنفسك",
    },
    "Farewell": {
      es: "Despedida",
      fr: "Adieu",
      de: "Abschied",
      it: "Addio",
      ja: "別れ",
      ru: "Прощание",
      zh: "告别",
      ar: "وداع",
    },
    "Bye": {
      es: "Chao",
      fr: "Salut",
      de: "Tschüss",
      it: "Ciao",
      ja: "バイ",
      ru: "Пока",
      zh: "拜拜",
      ar: "مع السلامة",
    },
    "How are you?": {
      es: "¿Cómo estás?",
      fr: "Comment vas-tu?",
      de: "Wie geht es dir?",
      it: "Come stai?",
      ja: "お元気ですか？",
      ru: "Как дела?",
      zh: "你好吗？",
      ar: "كيف حالك؟",
    },
    "What time is it?": {
      es: "¿Qué hora es?",
      fr: "Quelle heure est-il?",
      de: "Wie spät ist es?",
      it: "Che ora è?",
      ja: "何時ですか？",
      ru: "Который час?",
      zh: "现在几点？",
      ar: "كم الساعة؟",
    },
    "Where are you?": {
      es: "¿Dónde estás?",
      fr: "Où es-tu?",
      de: "Wo bist du?",
      it: "Dove sei?",
      ja: "どこにいますか？",
      ru: "Где ты?",
      zh: "你在哪里？",
      ar: "أين أنت؟",
    },
    "Can you help me?": {
      es: "¿Puedes ayudarme?",
      fr: "Peux-tu m’aider?",
      de: "Kannst du mir helfen?",
      it: "Puoi aiutarmi?",
      ja: "助けてくれますか？",
      ru: "Можешь помочь?",
      zh: "你能帮我吗？",
      ar: "هل يمكنك مساعدتي؟",
    },
    "What is this?": {
      es: "¿Qué es esto?",
      fr: "Qu’est-ce que c’est?",
      de: "Was ist das?",
      it: "Cos’è questo?",
      ja: "これは何ですか？",
      ru: "Что это?",
      zh: "这是什么？",
      ar: "ما هذا؟",
    },
    "Thank you": {
      es: "Gracias",
      fr: "Merci",
      de: "Danke",
      it: "Grazie",
      ja: "ありがとう",
      ru: "Спасибо",
      zh: "谢谢",
      ar: "شكرا",
    },
    "Please": {
      es: "Por favor",
      fr: "S’il te plaît",
      de: "Bitte",
      it: "Per favore",
      ja: "お願いします",
      ru: "Пожалуйста",
      zh: "请",
      ar: "من فضلك",
    },
    "Excuse me": {
      es: "Perdón",
      fr: "Excuse-moi",
      de: "Entschuldigung",
      it: "Scusami",
      ja: "すみません",
      ru: "Извините",
      zh: "对不起",
      ar: "عذرا",
    },
    "I love you": {
      es: "Te amo",
      fr: "Je t’aime",
      de: "Ich liebe dich",
      it: "Ti amo",
      ja: "愛してる",
      ru: "Я тебя люблю",
      zh: "我爱你",
      ar: "أحبك",
    },
    "Sorry": {
      es: "Lo siento",
      fr: "Désolé",
      de: "Entschuldigung",
      it: "Mi dispiace",
      ja: "ごめんなさい",
      ru: "Извини",
      zh: "对不起",
      ar: "آسف",
    },
  };

  const generatePhrase = useCallback(() => {
    const category =
      selectedCategory === "all"
        ? Object.keys(phrases)[Math.floor(Math.random() * Object.keys(phrases).length)]
        : selectedCategory;
    const englishPhrase =
      phrases[category][Math.floor(Math.random() * phrases[category].length)];
    const language =
      selectedLanguage === "random"
        ? languages[Math.floor(Math.random() * languages.length)]
        : languages.find((lang) => lang.code === selectedLanguage);

    const newPhrase = {
      english: englishPhrase,
      translated: translations[englishPhrase][language.code],
      language: language.name,
      category,
    };

    setPhrase(newPhrase);
    setHistory((prev) => [newPhrase, ...prev.slice(0, 9)]); // Keep last 10
  }, [selectedCategory, selectedLanguage]);

  const copyToClipboard = () => {
    if (phrase) {
      navigator.clipboard.writeText(
        `${phrase.language}: ${phrase.translated} (${phrase.english})`
      );
      alert("Phrase copied to clipboard!");
    }
  };

  const speakPhrase = () => {
    if (phrase && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(phrase.translated);
      utterance.lang = phrase.language === "Chinese" ? "zh-CN" : phrase.language.slice(0, 2).toLowerCase();
      speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech not supported in your browser.");
    }
  };

  const reset = () => {
    setPhrase(null);
    setSelectedCategory("all");
    setSelectedLanguage("random");
    setHistory([]);
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-lg p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          Random Language Phrase Generator
        </h1>

        {/* Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(phrases).map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500"
            >
              <option value="random">Random Language</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <button
            onClick={generatePhrase}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center"
          >
            <FaSync className="mr-2" /> Generate Phrase
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!phrase}
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaCopy className="mr-2" /> Copy
          </button>
          <button
            onClick={speakPhrase}
            disabled={!phrase}
            className="flex-1 py-2 px-4 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <FaVolumeUp className="mr-2" /> Speak
          </button>
        </div>

        {/* Generated Phrase */}
        {phrase ? (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-green-600 mb-2">
              {phrase.language} ({phrase.category})
            </h2>
            <p className="text-2xl font-medium mb-2">{phrase.translated}</p>
            <p className="text-gray-700">English: "{phrase.english}"</p>
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">
            Generate a phrase to get started!
          </p>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Recent Phrases</h3>
            <ul className="text-sm text-gray-600 space-y-2 max-h-40 overflow-y-auto">
              {history.map((item, index) => (
                <li key={index}>
                  <span className="font-medium">{item.language}:</span>{" "}
                  {item.translated} (English: "{item.english}")
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Features */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-700 mb-2">Features</h3>
          <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
            <li>Select specific category or language</li>
            <li>Copy phrase to clipboard</li>
            <li>Text-to-speech functionality</li>
            <li>History of recent phrases</li>
          </ul>
        </div>

        {/* Note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          Note: Translations are simplified. Speech synthesis depends on browser support.
        </p>
      </div>
    </div>
  );
};

export default RandomLanguagePhraseGenerator;