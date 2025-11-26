import Papa from 'papaparse';

export interface ShopifyProduct {
    Handle: string;
    Title: string;
    'Body (HTML)': string;
    Vendor: string;
    Type: string;
    Tags: string;
    Published: string;
    'Option1 Name': string;
    'Option1 Value': string;
    'Option2 Name': string;
    'Option2 Value': string;
    'Option3 Name': string;
    'Option3 Value': string;
    'Variant SKU': string;
    'Variant Grams': string;
    'Variant Inventory Qty': string;
    'Variant Price': string;
    'Image Src': string;
    'Image Position': string;
    'Image Alt Text': string;
}

// Flexible interface for Medusa Product to support dynamic columns
export interface MedusaProduct {
    [key: string]: string | number | boolean | undefined;
    'Product Handle': string;
    'Product Title': string;
    'Product Description': string;
    'Product Status': string;
    'Product Thumbnail': string;
    'Product Weight': string;
    'Product Type Id': string; // Using Type Id as per template, though Type is also common
    'Product Tag 1'?: string;
    'Product Tag 2'?: string;
    'Product Discountable': string;
    'Variant Title': string;
    'Variant SKU': string;
    'Variant Barcode': string;
    'Variant Allow Backorder': string;
    'Variant Manage Inventory': string;
    'Variant Weight': string;
    'Variant Option 1 Name'?: string;
    'Variant Option 1 Value'?: string;
    'Variant Option 2 Name'?: string;
    'Variant Option 2 Value'?: string;
    'Variant Option 3 Name'?: string;
    'Variant Option 3 Value'?: string;
    // Dynamic price columns like 'Variant Price EUR' will be added
    // Dynamic image columns like 'Product Image 1 Url' will be added
}

export const parseShopifyCSV = (file: File): Promise<ShopifyProduct[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data as ShopifyProduct[]);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
};

import TurndownService from 'turndown';

// ... (interfaces remain the same)

export interface ConverterOptions {
    currencyCode: string;
    convertDescriptionToMarkdown: boolean;
}

export const convertToMedusaCSV = (shopifyProducts: ShopifyProduct[], options: ConverterOptions): MedusaProduct[] => {
    const medusaProducts: MedusaProduct[] = [];
    const currencyCol = `Variant Price ${options.currencyCode.toUpperCase()}`;
    const turndownService = new TurndownService();

    // Group by handle to process products and their variants/images
    const productsByHandle = new Map<string, ShopifyProduct[]>();

    shopifyProducts.forEach(p => {
        if (!p.Handle) return;
        const existing = productsByHandle.get(p.Handle) || [];
        existing.push(p);
        productsByHandle.set(p.Handle, existing);
    });

    productsByHandle.forEach((products, handle) => {
        // The first row usually contains the main product info
        const mainProduct = products[0];

        // Collect all images for this product
        const images = products
            .map(p => p['Image Src'])
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i); // Unique images

        products.forEach((variant, index) => {
            const isFirstVariant = index === 0;

            let description = '';
            if (isFirstVariant) {
                description = mainProduct['Body (HTML)'];
                if (options.convertDescriptionToMarkdown && description) {
                    description = turndownService.turndown(description);
                }
            }

            const medusaVariant: MedusaProduct = {
                'Product Id': '', // MedusaJS auto-generates IDs during import
                'Product Handle': handle,
                'Product Title': isFirstVariant ? mainProduct.Title : '',
                'Product Subtitle': '',
                'Product Description': description,
                'Product Status': isFirstVariant ? (mainProduct.Published === 'TRUE' ? 'published' : 'draft') : '',
                'Product Thumbnail': isFirstVariant ? (images[0] || '') : '',
                'Product Weight': isFirstVariant ? mainProduct['Variant Grams'] : '',
                'Product Length': '',
                'Product Width': '',
                'Product Height': '',
                'Product HS Code': '',
                'Product Origin Country': '',
                'Product MID Code': '',
                'Product Material': '',
                'Shipping Profile Id': '',
                'Product Sales Channel 1': '',
                'Product Collection Id': '',
                'Product Type Id': isFirstVariant ? mainProduct.Type : '',
                'Product Discountable': isFirstVariant ? 'TRUE' : '',
                'Product External Id': '',

                // Variant Details
                'Variant Id': '', // MedusaJS auto-generates IDs during import
                'Variant Title': variant['Option1 Value'] || 'Default Variant', // Fallback
                'Variant SKU': variant['Variant SKU'],
                'Variant Barcode': '',
                'Variant Allow Backorder': 'FALSE',
                'Variant Manage Inventory': 'TRUE',
                'Variant Weight': variant['Variant Grams'],
                'Variant Length': '',
                'Variant Width': '',
                'Variant Height': '',
                'Variant HS Code': '',
                'Variant Origin Country': '',
                'Variant MID Code': '',
                'Variant Material': '',

                // Options
                'Variant Option 1 Name': variant['Option1 Name'],
                'Variant Option 1 Value': variant['Option1 Value'],
                'Variant Option 2 Name': variant['Option2 Name'],
                'Variant Option 2 Value': variant['Option2 Value'],
                'Variant Option 3 Name': variant['Option3 Name'],
                'Variant Option 3 Value': variant['Option3 Value'],

                // Price
                [currencyCol]: variant['Variant Price'],
            };

            // Tags (Split by comma and add as Product Tag 1, Product Tag 2, etc.)
            if (isFirstVariant && mainProduct.Tags) {
                const tags = mainProduct.Tags.split(',').map(t => t.trim());
                tags.forEach((tag, i) => {
                    medusaVariant[`Product Tag ${i + 1}`] = tag;
                });
            }

            // Images (Add as Product Image 1 Url, Product Image 2 Url, etc.)
            if (isFirstVariant) {
                images.forEach((img, i) => {
                    medusaVariant[`Product Image ${i + 1} Url`] = img;
                });
            }

            medusaProducts.push(medusaVariant);
        });
    });

    return medusaProducts;
};

export const generateMedusaCSV = (medusaProducts: MedusaProduct[]): string => {
    return Papa.unparse(medusaProducts, {
        quotes: true, // Force quotes to avoid issues with commas in descriptions
    });
};
