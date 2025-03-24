"use client";
import { FiShare2 } from "react-icons/fi";
import { useState } from "react";

export const ShareButton = ({ url, title = "Check out this tool!", text = "A free online tool from PK ToolsCloud." }) => {
  const [feedback, setFeedback] = useState(""); 
  const shareData = {
    title: title, 
    text: text,   
    url: `https://toolscloud.pankri.com/${url}/tool`, 
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setFeedback("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setFeedback("URL copied to clipboard!");
        console.log("URL copied to clipboard:", shareData.url);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred.";
      setFeedback(`Share failed: ${errorMessage}`);
      console.error("Share failed:", errorMessage);
    } finally {
      // Clear feedback after 2 seconds
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  return (
    <div className="">
      <button
        onClick={handleShare}
        className="text-primary font-extrabold py-1 px-4 rounded-full shadow-inner shadow-secondary transition duration-300 hover:bg-secondary/25 focus:outline-none focus:ring-2 focus:ring-primary"
        aria-label="Share this tool"
      >
        <FiShare2 size={18} />
      </button>
      {/* Feedback Tooltip */}
      {feedback && (
        <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-sm py-1 px-2 rounded shadow-lg z-10">
          {feedback}
        </div>
      )}
    </div>
  );
};