---
title: "Tailwind CSS Configuration Preline UI crafted with Tailwind CSS"
source_type: "pdf"
converted_at: "2025-09-23T05:59:10"
page_count: 2
ai_note: "Headings per page; bullets preserved; paragraphs merged; hyphenated wraps fixed."
---

## Page 1
Customization Tailwind CSS Configuration A guide to configuring and customizing the default Preline UI and Tailwind CSS options and styles. Make sure that the Preline UI is successfully installed as a plugin in your Tailwind CSS. If you haven't done so, you get started with our quick setup. The `@theme` directive is where you define your color palette, fonts, type scale, border sizes, breakpoints — anything related to the visual design of your site. Configuration options Theme @theme { --color-blue: oklch(0.707 0.165 254.624); --color-purple: oklch(0.714 0.203 305.504); --color-pink: oklch(0.718 0.202 349.761); --color-orange: oklch(0.75 0.183 55.934); --color-green: oklch(0.792 0.209 151.711); --color-yellow: oklch(0.852 0.199 91.936); --color-gray-dark: oklch(0.13 0.028 261.692); --color-gray: oklch(0.707 0.022 261.325); --color-gray-light: oklch(0.985 0.002 247.839); --font-serif: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Seg --font-serif: "Merriweather", "serif"; --columns: 14; --spacing-8xl: 96rem; --spacing-9xl: 128rem; ComponentsConfiguration Sidebar On this page v3.2.1 5,940

## Page 2
The `@plugins` directive allows you to register plugins. The `prefix` option allows you to add a custom prefix to all of Preline UI and Tailwind's generated utility classes. For example, you could add a `hs` prefix by setting the `prefix` option like so: Now every class will be generated with the configured prefix: For more information, visit the official Tailwind CSS configuration. --radius-4xl: 2rem; } Plugins @plugin "@tailwindcss/forms"; @plugin "@tailwindcss/aspect-ratio"; Prefix @import "tailwindcss" prefix(hs); .hs\:text-start { text-align: left; } .hs\:text-center { text-align: center; } .hs\:text-end { text-align: right; } /* etc. */ © 2025 Preline Labs.
