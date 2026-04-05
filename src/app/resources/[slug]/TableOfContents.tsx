"use client";

import { useState } from "react";

interface Section {
  id: string;
  heading: string;
}

export default function TableOfContents({
  sections,
}: {
  sections: Section[];
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      aria-label="Table of contents"
      className="rounded-xl border border-navy-700 bg-navy-800/50"
    >
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-5 py-4 text-left lg:hidden"
      >
        <span className="text-sm font-semibold text-navy-200">
          Table of Contents
        </span>
        <svg
          className={`h-4 w-4 text-navy-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 8.25l-7.5 7.5-7.5-7.5"
          />
        </svg>
      </button>

      {/* Desktop heading */}
      <div className="hidden px-5 pt-5 pb-2 lg:block">
        <span className="text-xs font-semibold uppercase tracking-wider text-navy-500">
          In this article
        </span>
      </div>

      {/* Links */}
      <ul
        className={`space-y-0.5 px-3 pb-4 ${
          isOpen ? "block" : "hidden lg:block"
        }`}
      >
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              onClick={() => setIsOpen(false)}
              className="block rounded-lg px-2 py-2 text-sm text-navy-400 transition-colors hover:bg-navy-700/50 hover:text-navy-200"
            >
              {section.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
