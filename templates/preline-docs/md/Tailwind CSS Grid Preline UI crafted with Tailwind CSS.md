---
title: "Tailwind CSS Grid Preline UI crafted with Tailwind CSS"
source_type: "pdf"
converted_at: "2025-09-23T05:59:10"
page_count: 7
ai_note: "Headings per page; bullets preserved; paragraphs merged; hyphenated wraps fixed."
---

## Page 1
Layout Tailwind CSS Grid Use the powerful mobile-first flexbox grid to build layouts of all shapes and sizes thanks to a twelve column system and dozens of predefined classes. Use the `grid-cols-{n}` utilities to create grids with n equally sized columns. See the Grid Template Columns for a complete list of grid options. Grid Template Columns Specifying the columns in a grid 01 02 03 04 05 06 07 08 09 <div class="grid grid-cols-4 gap-4"> <div>01</div> <!-- ... --> <div>09</div> </div> Grid Column Start / End Spanning Columns ComponentsGrid Sidebar On this page v3.2.1 5,940

## Page 2
Use the `col-span-{n}` utilities to make an element span n columns. Use the `col-start-{n}` and `col-end-{n}` utilities to make an element start or end at the nth grid line. These can also be combined with the `col-span-{n}` utilities to span a specific number of columns. Note that CSS grid lines start at 1, not 0, so a full-width element in a 6-column grid would start at line 1 and end at line 7. 01 02 03 04 05 06 07 <div class="grid grid-cols-3 gap-4"> <div class="...">01</div> <div class="...">02</div> <div class="...">03</div> <div class="col-span-2 ...">04</div> <div class="...">05</div> <div class="...">06</div> <div class="col-span-2 ...">07</div> </div> Starting and ending lines 01 02 03 04

## Page 3
Every column width same size example. See the Grid Column Start / End for a complete list of grid options. Use the `grid-rows-{n}` utilities to create grids with n equally sized rows. <div class="grid grid-cols-6 gap-4"> <div class="col-start-2 col-span-4 ...">01</div> <div class="col-start-1 col-end-3 ...">02</div> <div class="col-end-7 col-span-2 ...">03</div> <div class="col-start-1 col-end-7 ...">04</div> </div> Equal width Column Column Column <div class="grid grid-cols-12 gap-4"> <div class="col-span-4">Column</div> <div class="col-span-4">Column</div> <div class="col-span-4">Column</div> </div> Grid Template Rows Specifying the rows in a grid 01 02 03 05 06 07 09

## Page 4
See the Grid Template Rows for a complete list of grid options. Use the `row-span-{n}` utilities to make an element span n rows. Use the `row-start-{n}` and `row-end-{n}` utilities to make an element start or end at the nth grid line. These can also be combined with the `row-span-{n}` utilities to span a specific number of rows. 04 08 <div class="grid grid-rows-4 grid-flow-col gap-4"> <div>01</div> <!-- ... --> <div>09</div> </div> Grid Row Start / End Spanning rows 01 02 03 <div class="grid grid-rows-3 grid-flow-col gap-4"> <div class="row-span-3 ...">01</div> <div class="col-span-2 ...">02</div> <div class="row-span-2 col-span-2 ...">03</div> </div> Starting and ending lines

## Page 5
Note that CSS grid lines start at 1, not 0, so a full-height element in a 3-row grid would start at line 1 and end at line 4. See the Grid Row Start / End for a complete list of grid options. Use the `grid-flow-{keyword}` utilities to control how the auto-placement algorithm works for a grid layout. 01 02 03 <div class="grid grid-rows-3 grid-flow-col gap-4"> <div class="row-start-2 row-span-2 ...">01</div> <div class="row-end-3 row-span-2 ...">02</div> <div class="row-start-1 row-end-4 ...">03</div> </div> Grid Auto Flow Controlling grid element placement 01 02 03 04 05 <div class="grid grid-flow-row-dense grid-cols-3 grid-rows-3 ..."> <div class="col-span-2">01</div> <div class="col-span-2">02</div>

## Page 6
See the Grid Auto Flow for a complete list of grid options. Use `gap-{size}` to change the gap between both rows and columns in grid and flexbox layouts. Use `gap-x-{size}` and `gap-y-{size}` to change the gap between rows and columns independently. <div>03</div> <div>04</div> <div>05</div> </div> Gap Setting the gap between elements 01 02 03 04 <div class="grid gap-4 grid-cols-2"> <div>01</div> <div>02</div> <div>03</div> <div>04</div> </div> Changing row and column gaps independently 01 02 03 04 05 06

## Page 7
See the Gap for a complete list of grid options. <div class="grid gap-x-8 gap-y-4 grid-cols-3"> <div>01</div> <div>02</div> <div>03</div> <div>04</div> <div>05</div> <div>06</div> </div> © 2025 Preline Labs.
