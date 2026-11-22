# Empreinte Flex Staff

## Overview

A showroom operations workspace for shifts spent taking payments, finding stock, and checking orders. Lead with the task a staff member can do next. The management overview starts with inventory search and direct actions, followed by one summary strip and recent orders.

## Visual language

Use softly neutral page and navigation surfaces, white work panels, charcoal text, and blue for the active destination and primary action. Reserve amber for operational notices. The staff stylesheet owns the runtime palette. The shared brand tokens remain in the stylesheet root, and the authenticated workspace surface and text tokens live under the staff shell.

## Typography

Inter is the baseline for French and English. IBM Plex Sans Arabic supplies Arabic text with natural letter spacing and a generous line height. Prioritize readable 14 to 15 px labels and controls, tabular figures, and localized number formatting.

## Layout

Keep search visually prominent and reusable between the dashboard, stock, and point of sale. Use four summary metrics across on wide screens and two across at narrow widths. Keep navigation, showroom selection, language, and sign out discoverable with minimal repeated chrome. Give frequently used checkout controls generous hit areas.

In point of sale, show one entry per product. Expand one at a time to choose dimensions and thickness, then show the selected SKU, price, and remaining stock beside the add button. Keep those dimensions visible in the cart.

Use the catalog's primary product photo in the point-of-sale row, selection panel, and cart. Reserve stable image space and use a neutral mattress icon for missing photos. On phones, keep the thumbnail in the row and let the size controls take the full width.

Inventory uses the same product photos and dimension controls as point of sale. Product rows show the available total, with a compact table for each size's thickness, stock, and adjustments.

Catalog cards keep product photos in a bounded frame above the text and align actions below the price. Catalog search uses the product name and the standard staff search field.

Price editing uses dimension buttons and one editable row per thickness and SKU. Each row shows the current price and saves independently.

Adding a variant uses centimetres and DZD, with common mattress sizes as shortcuts. The server generates the product reference from the product and dimensions.

Manage photos shows the ordered product gallery, with the main photo first. Replacing a photo keeps its position. Removing a photo requires confirmation and leaves the next usable photo as the main one.

Staff navigation groups destinations by workflow. Dashboard sits above Sales and Products, with Team and access under Administration. Only show groups with destinations available to the current role. Separate groups with space and mark the current page with a light tint and blue icon. Keep row dimensions and label weight consistent.

The staff header puts showroom context at the start and language selection at the end. A single showroom is displayed as text. Scrollbars use a light thumb and transparent track, with stronger feedback when hovered or dragged.
