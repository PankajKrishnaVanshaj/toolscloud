"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import WaffleMenu from "./WaffleMenu";
import ToolList from "../staticData/ToolList";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const router = useRouter();

  const handleCategoryChange = (e) => {
    const categorySlug = e.target.value;
    setSelectedCategory(categorySlug);
    if (categorySlug) {
      router.push(`/${categorySlug}`);
    }
  };

  return (
    <nav className="z-50 flex items-center justify-between h-16 px-4 py-1 backdrop-blur-md bg-white/20 rounded-full mx-2 my-0.5 shadow-md border border-gray-200 md:px-10 lg:px-16 xl:px-20 2xl:px-28 transition-all duration-300">
      {/* Left Section: Logo */}
      <Link href="/" className="flex items-center space-x-2">
        <Image
          alt="logo"
          className="w-12 md:w-16 h-auto cursor-pointer invert transition-transform duration-300 hover:scale-110"
          src="/appicons/toolscloud.png"
          height={900}
          width={900}
          priority
        />
        <span className="text-lg md:text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          PK ToolsCloud
        </span>
      </Link>

      {/* Middle Section: Search & Categories */}
      <div className="flex items-center gap-4">
        {/* Category Selector */}
        <div className="relative hidden xl:block">
          <select
            className="px-4 py-2 w-80 text-sm font-medium border border-secondary rounded-lg outline-none  shadow-sm transition-all duration-300 hover:border-secondary focus:ring-2 focus:ring-primary focus:border-primary"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Tools Categories</option>
            {ToolList.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.category}
              </option>
            ))}
          </select>
        </div>

        {/* Integrated Search Bar */}
        <SearchBar />
      </div>

      {/* Right Section: Waffle Menu & Mobile Search */}
      <div className="flex items-center gap-3">
      
        {/* Waffle Menu */}
        <div className="hidden md:flex">
          <WaffleMenu className="transition-all duration-300 hover:scale-105" />
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden p-1 rounded-lg transition-all hover:bg-gray-100">
          <WaffleMenu />
        </button>
      </div>
    </nav>
  );
}
