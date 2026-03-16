# ElectroMart CSV Import Policy

This project uses a schema-first CSV contract owned by ElectroMart.
External website-builder formats are not imported directly.

## Required headers

`sku,name,brand,category,price`

## Recommended headers

`listPrice,stock,rating,segment,status,fulfillment,featured,description,keywords,image,images,videos,media,collection,additionalInfoTitle1,additionalInfoDescription1,additionalInfoTitle2,additionalInfoDescription2`

## Rules

1. Convert third-party files before import.
   Command:
   `npm.cmd run csv:convert:project -- --input "C:\path\catalog_products.csv"`
2. Run preflight before admin import.
   Command:
   `npm.cmd run csv:preflight -- --file "C:\path\catalog_products_clean_import.csv"`
3. Import only the converted clean file in admin panel.
4. Compatibility fields are preserved and merged into product description during import.
5. HTML-heavy text from source files is sanitized to plain text.
6. Keep one row per SKU. Duplicate SKU rows are rejected before import.
7. Keep CSV size under ~30 MB per import. Split large files into batches.
8. Collection/category labels are normalized to page-friendly slugs (example: `Today's Deals` -> `todays-deals`).
