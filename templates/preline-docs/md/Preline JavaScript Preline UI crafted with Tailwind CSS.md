---
title: "Preline JavaScript Preline UI crafted with Tailwind CSS"
source_type: "pdf"
converted_at: "2025-09-23T05:59:10"
page_count: 3
ai_note: "Headings per page; bullets preserved; paragraphs merged; hyphenated wraps fixed."
---

## Page 1
Getting Started Preline JavaScript This page explains how Preline JavaScript works, its methodology, and provides some examples. Heads up! For detailed documentation on plugins, please visit the plugins page. Learn more Preline JavaScript plugins include `autoInit` static method, it's useful when you need to reinitialize all elements on the page. This method can also be used with certain collections of initialized elements. AJAX example: Helper for dynamic added components window.HSStaticMethods.autoInit(); window.HSStaticMethods.autoInit(['carousel', 'dropdown']); <select id="dynamic-select-options" data-hs-select='{ "placeholder": "Select option...", ... }' class="hidden --prevent-on-load-init"></select> <button type="button" id="load-options">Load Options</button> <script> Getting Started Preline JavaScript Sidebar On this page v3.2.1 5,940

## Page 2
To use static methods inside TS files, it is necessary to declare the interface inside the files where method is called, this will prevent possible warnings and errors. document.getElementById("load-options").addEventListener("click", function() { loadOptions(); }); function loadOptions() { const xhr = new XMLHttpRequest(); xhr.onreadystatechange = function() { if (this.readyState == 4) { if (this.status == 200) { const options = JSON.parse(this.responseText); populateOptions(options); } else { console.error("Failed to load options:", this.status, this.statusText); } } }; xhr.open("GET", "https://some-api.com/options", true); xhr.send(); } function populateOptions(options) { const selectElement = document.getElementById("dynamic-select-options"); selectElement.innerHTML = ""; options.forEach(function(option) { const optionElement = document.createElement("option"); optionElement.value = option.value; optionElement.textContent = option.text; selectElement.appendChild(optionElement); }); window.HSStaticMethods.autoInit(['select']); } </script> Usage of static methods inside TypeScript (TS) files

## Page 3
To prevent an element from auto-initializing, you can add the `--prevent-on-load-init` CSS class. This can be useful if you want to initialize elements using an event other than load. ... import { IStaticMethods } from "preline/preline"; declare global { interface Window { HSStaticMethods: IStaticMethods; } } ... window.HSStaticMethods.autoInit(); Prevent auto initialize <select data-hs-select='{ "placeholder": "Select option...", ... }' class="hidden --prevent-on-load-init"> <option value="">Choose</option> ... </select> <script> document.addEventListener('DOMContentLoaded', () => { document.querySelectorAll('[data-hs-select].--prevent-on-load-init').forEach((el) => }); </script> © 2025 Preline Labs.
