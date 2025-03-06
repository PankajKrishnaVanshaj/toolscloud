// components/RandomLanguagePhraseGenerator.js
'use client';

import React, { useState } from 'react';

const RandomLanguagePhraseGenerator = () => {
  const [phrase, setPhrase] = useState(null);

  const languages = [
    { name: 'Spanish', code: 'es' },
    { name: 'French', code: 'fr' },
    { name: 'German', code: 'de' },
    { name: 'Italian', code: 'it' },
    { name: 'Japanese', code: 'ja' },
    { name: 'Russian', code: 'ru' },
    { name: 'Chinese', code: 'zh' },
    { name: 'Arabic', code: 'ar' },
  ];

  const phrases = {
    greetings: [
      'Hello', 'Good morning', 'Good evening', 'Hi there', 'Welcome'
    ],
    farewells: [
      'Goodbye', 'See you later', 'Take care', 'Farewell', 'Bye'
    ],
    questions: [
      'How are you?', 'What time is it?', 'Where are you?', 
      'Can you help me?', 'What is this?'
    ],
    expressions: [
      'Thank you', 'Please', 'Excuse me', 'I love you', 'Sorry'
    ]
  };

  // Simple translation dictionary (not comprehensive, for demonstration)
  const translations = {
    'Hello': {
      es: 'Hola', fr: 'Bonjour', de: 'Hallo', it: 'Ciao', 
      ja: 'こんにちは', ru: 'Привет', zh: '你好', ar: 'مرحبا'
    },
    'Good morning': {
      es: 'Buenos días', fr: 'Bon matin', de: 'Guten Morgen', it: 'Buongiorno',
      ja: 'おはよう', ru: 'Доброе утро', zh: '早上好', ar: 'صباح الخير'
    },
    'Good evening': {
      es: 'Buenas noches', fr: 'Bonsoir', de: 'Guten Abend', it: 'Buonasera',
      ja: 'こんばんは', ru: 'Добрый вечер', zh: '晚上好', ar: 'مساء الخير'
    },
    'Hi there': {
      es: 'Hola ahí', fr: 'Salut là', de: 'Hallo da', it: 'Ciao lì',
      ja: 'やあ', ru: 'Привет там', zh: '嗨', ar: 'مرحبا هناك'
    },
    'Welcome': {
      es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen', it: 'Benvenuto',
      ja: 'ようこそ', ru: 'Добро пожаловать', zh: '欢迎', ar: 'مرحبا'
    },
    'Goodbye': {
      es: 'Adiós', fr: 'Au revoir', de: 'Auf Wiedersehen', it: 'Arrivederci',
      ja: 'じゃあね', ru: 'До свидания', zh: '再见', ar: 'وداعا'
    },
    'See you later': {
      es: 'Hasta luego', fr: 'À plus tard', de: 'Bis später', it: 'Ci vediamo dopo',
      ja: 'またね', ru: 'Увидимся позже', zh: '回头见', ar: 'أراك لاحقا'
    },
    'Take care': {
      es: 'Cuídate', fr: 'Prends soin', de: 'Pass auf', it: 'Stai attento',
      ja: '気をつけて', ru: 'Береги себя', zh: '保重', ar: 'اعتن بنفسك'
    },
    'Farewell': {
      es: 'Despedida', fr: 'Adieu', de: 'Abschied', it: 'Addio',
      ja: '別れ', ru: 'Прощание', zh: '告别', ar: 'وداع'
    },
    'Bye': {
      es: 'Chao', fr: 'Salut', de: 'Tschüss', it: 'Ciao',
      ja: 'バイ', ru: 'Пока', zh: '拜拜', ar: 'مع السلامة'
    },
    'How are you?': {
      es: '¿Cómo estás?', fr: 'Comment vas-tu?', de: 'Wie geht es dir?', it: 'Come stai?',
      ja: 'お元気ですか？', ru: 'Как дела?', zh: '你好吗？', ar: 'كيف حالك؟'
    },
    'What time is it?': {
      es: '¿Qué hora es?', fr: 'Quelle heure est-il?', de: 'Wie spät ist es?', it: 'Che ora è?',
      ja: '何時ですか？', ru: 'Который час?', zh: '现在几点？', ar: 'كم الساعة؟'
    },
    'Where are you?': {
      es: '¿Dónde estás?', fr: 'Où es-tu?', de: 'Wo bist du?', it: 'Dove sei?',
      ja: 'どこにいますか？', ru: 'Где ты?', zh: '你在哪里？', ar: 'أين أنت؟'
    },
    'Can you help me?': {
      es: '¿Puedes ayudarme?', fr: 'Peux-tu m’aider?', de: 'Kannst du mir helfen?', it: 'Puoi aiutarmi?',
      ja: '助けてくれますか？', ru: 'Можешь помочь?', zh: '你能帮我吗？', ar: 'هل يمكنك مساعدتي؟'
    },
    'What is this?': {
      es: '¿Qué es esto?', fr: 'Qu’est-ce que c’est?', de: 'Was ist das?', it: 'Cos’è questo?',
      ja: 'これは何ですか？', ru: 'Что это?', zh: '这是什么？', ar: 'ما هذا؟'
    },
    'Thank you': {
      es: 'Gracias', fr: 'Merci', de: 'Danke', it: 'Grazie',
      ja: 'ありがとう', ru: 'Спасибо', zh: '谢谢', ar: 'شكرا'
    },
    'Please': {
      es: 'Por favor', fr: 'S’il te plaît', de: 'Bitte', it: 'Per favore',
      ja: 'お願いします', ru: 'Пожалуйста', zh: '请', ar: 'من فضلك'
    },
    'Excuse me': {
      es: 'Perdón', fr: 'Excuse-moi', de: 'Entschuldigung', it: 'Scusami',
      ja: 'すみません', ru: 'Извините', zh: '对不起', ar: 'عذرا'
    },
    'I love you': {
      es: 'Te amo', fr: 'Je t’aime', de: 'Ich liebe dich', it: 'Ti amo',
      ja: '愛してる', ru: 'Я тебя люблю', zh: '我爱你', ar: 'أحبك'
    },
    'Sorry': {
      es: 'Lo siento', fr: 'Désolé', de: 'Entschuldigung', it: 'Mi dispiace',
      ja: 'ごめんなさい', ru: 'Извини', zh: '对不起', ar: 'آسف'
    }
  };

  const generatePhrase = () => {
    const category = Object.keys(phrases)[Math.floor(Math.random() * Object.keys(phrases).length)];
    const englishPhrase = phrases[category][Math.floor(Math.random() * phrases[category].length)];
    const language = languages[Math.floor(Math.random() * languages.length)];
    
    setPhrase({
      english: englishPhrase,
      translated: translations[englishPhrase][language.code],
      language: language.name
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Random Language Phrase Generator</h1>
      
      <div className="flex justify-center mb-6">
        <button
          onClick={generatePhrase}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
        >
          Generate New Phrase
        </button>
      </div>

      {phrase && (
        <div className="bg-gray-50 p-4 rounded-md text-center">
          <h2 className="text-lg font-semibold mb-2 text-green-600">
            {phrase.language}
          </h2>
          <p className="text-xl mb-2">
            {phrase.translated}
          </p>
          <p className="text-gray-700">
            English: "{phrase.english}"
          </p>
        </div>
      )}

      {!phrase && (
        <p className="text-center text-gray-500">
          Click the button to generate a random phrase!
        </p>
      )}

      <p className="text-xs text-gray-500 mt-4 text-center">
        Note: Translations are simplified and may not reflect all dialects or nuances.
      </p>
    </div>
  );
};

export default RandomLanguagePhraseGenerator;