"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Grip } from "lucide-react";
import Image from "next/image";

interface App {
  name: string;
  url: string;
  icon: string;
}

const WaffleMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      window.addEventListener("click", handleOutsideClick);
      window.addEventListener("keydown", handleKeyPress);
    }

    return () => {
      window.removeEventListener("click", handleOutsideClick);
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={toggleMenu}>
        <Grip size={30} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            {apps.map((app, index) => (
              <Link href={app.url} key={index} target="_blank">
                <span className="flex items-center px-4 py-2 text-md font-bold text-gray-700 hover:bg-gray-100 ">
                  <Image
                    src={app.icon}
                    className="w-8 h-8 mr-2"
                    alt={app.name}
                    height={800}
                    width={800}
                  />
                  {app.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WaffleMenu;

const apps: App[] = [
  {
    name: "Blogify",
    url: "https://blogify.pankri.com/",
    icon: "/appicons/pankri.png",
  },
  {
    name: "Facefeed",
    url: "https://facefeed.pankri.com/",
    icon: "/appicons/facepin.png",
  },
  {
    name: "DigMark",
    url: "https://digmark.pankri.com/",
    icon: "/appicons/digmark.png",
  },
  {
    name: "ToolsCloud",
    url: "https://toolscloud.pankri.com/",
    icon: "/appicons/toolscloud.png",
  },

  {
    name: "SkillGrow",
    url: "https://skillgrow.pankri.com/",
    icon: "/appicons/skillgrow.png",
  },

  {
    name: "ChaSpo",
    url: "https://chaspo.pankri.com/",
    icon: "/appicons/chaspo.png",
  },
  {
    name: "Jobhive",
    url: "https://jobhive.pankri.com/",
    icon: "/appicons/jobhive.png",
  },
  // {
  //   name: "WorkBoard",
  //   url: "https://workboard.pankri.com/",
  //   icon: "/appicons/workboard.png",
  // },

  // {
  //   name: "QR code",
  //   url: "https://qrcode.pankri.com/",
  //   icon: "/appicons/qrcodepoint.png",
  // },
  {
    name: "DraSpo",
    url: "https://draspo.pankri.com/",
    icon: "/appicons/draspo.png",
  },
];
