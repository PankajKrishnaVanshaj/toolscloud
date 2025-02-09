"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { BsGrid3X3Gap } from "react-icons/bs";

const WaffleMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu();
      }
    };

    const handleKeyPress = (event) => {
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
      <div onClick={toggleMenu} className="text-primary">
        <BsGrid3X3Gap size={30} />
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-secondary ring-opacity-5">
          <div className="py-1">
            {apps.map((app, index) => (
              <Link href={app.url} key={index} target="_blank">
                <span className="flex items-center px-4 py-2 text-md font-bold text-secondary hover:bg-gray-100 ">
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

const apps = [
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
    name: "SkillGrow",
    url: "https://skillgrow.pankri.com/",
    icon: "/appicons/skillgrow.png",
  },

  {
    name: "ChaSpo",
    url: "https://chaspo.pankri.com/",
    icon: "/appicons/chaspo.png",
  },
];
