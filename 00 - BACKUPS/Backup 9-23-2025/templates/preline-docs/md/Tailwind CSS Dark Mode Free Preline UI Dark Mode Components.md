---
title: "Tailwind CSS Dark Mode Free Preline UI Dark Mode Components"
source_type: "pdf"
converted_at: "2025-09-23T05:59:10"
page_count: 3
ai_note: "Headings per page; bullets preserved; paragraphs merged; hyphenated wraps fixed."
---

## Page 1
Customization Tailwind CSS Dark Mode Style your site in dark mode with ready made Preline UI's dark mode toggle components. Requires JS Note that this component requires the use of our Theme Switch plugin, else you can skip this message if you are already using Preline UI as a package. Learn more With dark mode becoming a first-class feature in many operating systems, it's increasingly common to design a dark version of your website alongside the default design. By integrating dark mode, you can meet user preferences and improve readability in low-light environments, ensuring your site is both functional and aesthetically pleasing. Tailwind and Preline UI make this easy by including a dark variant, allowing you to style your site differently when dark mode is enabled. If you want your dark theme to be driven by a CSS selector instead of the `prefers-color-scheme` media query, override the `dark` variant to use your custom selector: About Manual Set Up Toggling dark mode manually @import 'tailwindcss'; @custom-variant dark (&:where(.dark, .dark *)); ComponentsDark Mode Sidebar On this page v3.2.1 5,940

## Page 2
Now instead of `dark:*` utilities being applied based on `prefers-color-scheme`, they will be applied whenever the `dark` class is present earlier in the HTML tree: How you add the `dark` class to the `html` element is up to you, but a common approach is to use a bit of JavaScript that updates the `class` attribute and syncs that preference to somewhere like `localStorage`. For more information, visit Tailwind CSS Dark Mode Use `data-hs-theme-switch` If you want to create a dark mode switcher for Tailwind CSS and Preline UI, you'll have to add some JavaScript code and a toggle element that a user can use to change their preferences. Preview HTML JS Copy Preview HTML JS Copy <html class="dark"> <body> <div class="bg-white dark:bg-black"> <!-- ... --> </div> </body> </html> Switcher options Switcher Button toggle

## Page 3
Use `data-hs-theme-click-value`. Preview HTML JS Copy Provides `destroy` method that helps to destroy a theme switch. Preview HTML JS Copy Destroy theme switch Select Destroy and Reinitialize NE W R einitialize theme switch © 2025 Preline Labs.
