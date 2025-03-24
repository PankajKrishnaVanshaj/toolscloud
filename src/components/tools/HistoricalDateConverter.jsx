"use client";
import React, { useState, useCallback } from "react";
import { FaSync, FaDownload } from "react-icons/fa";

// Julian to Gregorian conversion utility
const julianToGregorian = (julianDate) => {
  const JDN = Math.floor(julianDate.getTime() / (1000 * 60 * 60 * 24)) + 2440588;
  const f = JDN + 1401 + Math.floor((Math.floor((4 * JDN + 274277) / 146097) * 3) / 4) - 38;
  const e = 4 * f + 3;
  const g = Math.floor((e % 1461) / 4);
  const h = 5 * g + 2;
  const D = Math.floor((h % 153) / 5) + 1;
  const M = Math.floor((h / 153 + 2) % 12) + 1;
  const Y = Math.floor(e / 1461) - 4716 + Math.floor((12 + 2 - M) / 12);
  return new Date(Y, M - 1, D);
};

// Gregorian to Julian conversion utility
const gregorianToJulian = (gregorianDate) => {
  const JDN = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * 24)) + 2440588;
  const a = Math.floor((14 - gregorianDate.getMonth()) / 12);
  const y = gregorianDate.getFullYear() + 4800 - a;
  const m = gregorianDate.getMonth() + 12 * a - 3;
  const JD = gregorianDate.getDate() + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  return new Date((JD - 2440588) * (1000 * 60 * 60 * 24));
};

// Roman date conversion (AUC - Ab Urbe Condita)
const toRomanDate = (gregorianDate) => {
  const aucYear = gregorianDate.getFullYear() + 753;
  return `${aucYear} AUC`;
};

// Simplified Hebrew calendar conversion (approximation)
const gregorianToHebrew = (gregorianDate) => {
  const year = gregorianDate.getFullYear() + 3760; // Hebrew year starts 3761 BC
  const monthNames = ["Tishrei", "Cheshvan", "Kislev", "Tevet", "Shevat", "Adar I", "Adar II", "Nisan", "Iyar", "Sivan", "Tammuz", "Av", "Elul"];
  const month = monthNames[gregorianDate.getMonth()]; // Simplified mapping
  const day = gregorianDate.getDate();
  return `${day} ${month} ${year}`;
};

// Simplified Islamic (Hijri) calendar conversion (approximation)
const gregorianToIslamic = (gregorianDate) => {
  const JDN = Math.floor(gregorianDate.getTime() / (1000 * 60 * 60 * 24)) + 2440588;
  const islamicJD = JDN - 1948440; // Islamic epoch starts 622 CE
  const year = Math.floor((30 * islamicJD + 10646) / 10631);
  const remainder = islamicJD - Math.floor((year - 1) * 10631 / 30);
  const month = Math.min(12, Math.ceil(remainder / 29.5));
  const day = Math.floor(remainder - (month - 1) * 29.5) + 1;
  const monthNames = ["Muharram", "Safar", "Rabiʻ I", "Rabiʻ II", "Jumada I", "Jumada II", "Rajab", "Shaʻban", "Ramadan", "Shawwal", "Dhuʻl-Qiʻdah", "Dhuʻl-Hijjah"];
  return `${day} ${monthNames[month - 1]} ${year} AH`;
};

const HistoricalDateConverter = () => {
  const [gregorianDate, setGregorianDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeZone, setTimeZone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [calendar, setCalendar] = useState("gregorian");
  const [convertedDate, setConvertedDate] = useState("");
  const [eraNotation, setEraNotation] = useState("AD/BC");
  const [language, setLanguage] = useState("en-US");
  const [error, setError] = useState("");

  const timeZones = Intl.supportedValuesOf("timeZone");
  const languages = ["en-US", "fr-FR", "es-ES", "de-DE", "it-IT"];

  const calendars = {
    gregorian: "Gregorian (Modern)",
    julian: "Julian",
    roman: "Roman (AUC)",
    hebrew: "Hebrew (Approximate)",
    islamic: "Islamic (Hijri, Approximate)",
  };

  const convertDate = useCallback(
    (inputDate) => {
      try {
        const date = new Date(inputDate);
        if (isNaN(date.getTime())) throw new Error("Invalid date");

        let result;
        switch (calendar) {
          case "gregorian":
            result = formatDate(date, "gregorian");
            break;
          case "julian":
            result = formatDate(gregorianToJulian(date), "julian");
            break;
          case "roman":
            result = toRomanDate(date);
            break;
          case "hebrew":
            result = gregorianToHebrew(date);
            break;
          case "islamic":
            result = gregorianToIslamic(date);
            break;
          default:
            result = "Unsupported calendar";
        }
        setConvertedDate(result);
        setError("");
      } catch (err) {
        setConvertedDate("");
        setError(`Error: ${err.message}`);
      }
    },
    [calendar, timeZone, eraNotation, language]
  );

  const formatDate = (date, type) => {
    const options = {
      timeZone,
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    let formatted = new Intl.DateTimeFormat(language, options).format(date);
    const year = date.getFullYear();
    if (eraNotation === "AD/BC") {
      formatted = year < 0 ? `${formatted.replace("-", "")} BC` : `${formatted} AD`;
    } else if (eraNotation === "CE/BCE") {
      formatted = year < 0 ? `${formatted.replace("-", "")} BCE` : `${formatted} CE`;
    }
    return `${formatted} (${type})`;
  };

  const handleGregorianInput = (value) => {
    setGregorianDate(value);
    convertDate(value);
  };

  const handleNow = () => {
    const now = new Date().toISOString().slice(0, 10);
    setGregorianDate(now);
    convertDate(now);
  };

  const reset = () => {
    const now = new Date().toISOString().slice(0, 10);
    setGregorianDate(now);
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setCalendar("gregorian");
    setEraNotation("AD/BC");
    setLanguage("en-US");
    setConvertedDate("");
    setError("");
    convertDate(now);
  };

  const downloadResult = () => {
    const text = `Gregorian Date: ${gregorianDate}\nConverted Date: ${convertedDate}\nCalendar: ${calendars[calendar]}\nTime Zone: ${timeZone}\nEra Notation: ${eraNotation}\nLanguage: ${language}`;
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `date-conversion-${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen  flex items-center justify-center ">
      <div className="w-full  bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-gray-800">
          Historical Date Converter
        </h1>

        <div className="grid gap-6">
          {/* Input Section */}
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gregorian Date
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={gregorianDate}
                  onChange={(e) => handleGregorianInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleNow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Calendar
                </label>
                <select
                  value={calendar}
                  onChange={(e) => {
                    setCalendar(e.target.value);
                    convertDate(gregorianDate);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(calendars).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Zone
                </label>
                <select
                  value={timeZone}
                  onChange={(e) => {
                    setTimeZone(e.target.value);
                    convertDate(gregorianDate);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {timeZones.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Era Notation
                </label>
                <select
                  value={eraNotation}
                  onChange={(e) => {
                    setEraNotation(e.target.value);
                    convertDate(gregorianDate);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="AD/BC">AD/BC</option>
                  <option value="CE/BCE">CE/BCE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
                    convertDate(gregorianDate);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={reset}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <FaSync className="mr-2" /> Reset
            </button>
            <button
              onClick={downloadResult}
              disabled={!convertedDate}
              className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <FaDownload className="mr-2" /> Download Result
            </button>
          </div>

          {/* Results Section */}
          {convertedDate && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold mb-2 text-gray-700">Converted Date:</h2>
              <p className="text-sm text-gray-600">{convertedDate}</p>
            </div>
          )}

          {/* Error Section */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}

          {/* Features & Notes */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-700 mb-2">Features & Notes</h3>
            <ul className="list-disc list-inside text-blue-600 text-sm space-y-1">
              <li>Supports Gregorian, Julian, Roman (AUC), Hebrew, and Islamic calendars</li>
              <li>Adjustable time zones and era notations (AD/BC, CE/BCE)</li>
              <li>Multi-language support for date formatting</li>
              <li>Download conversion result as text file</li>
              <li>Note: Hebrew and Islamic conversions are simplified approximations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDateConverter;