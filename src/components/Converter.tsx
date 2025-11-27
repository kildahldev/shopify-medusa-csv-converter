
import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { parseShopifyCSV, convertToMedusaCSV, generateMedusaCSV } from '../utils/csv';
import { Download, RefreshCw, AlertCircle, CheckCircle2, ArrowRight, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';

export const Converter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [currencyCode, setCurrencyCode] = useState('');
    const [isConverting, setIsConverting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [stats, setStats] = useState<{ products: number; variants: number } | null>(null);
    const [convertMarkdown, setConvertMarkdown] = useState(false);
    const [useSalesChannel, setUseSalesChannel] = useState(false);
    const [salesChannelValue, setSalesChannelValue] = useState('default');

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError(null);
        setDownloadUrl(null);
        setStats(null);
    };

    const handleConvert = async () => {
        if (!file) return;

        setIsConverting(true);
        setError(null);

        try {
            // Simulate a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 600));

            const shopifyProducts = await parseShopifyCSV(file);

            if (shopifyProducts.length === 0) {
                throw new Error('No products found in CSV');
            }

            const medusaProducts = convertToMedusaCSV(shopifyProducts, {
                currencyCode,
                convertDescriptionToMarkdown: convertMarkdown,
                salesChannel: useSalesChannel ? salesChannelValue : undefined
            });
            const csvString = generateMedusaCSV(medusaProducts);

            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            setDownloadUrl(url);

            // Calculate simple stats
            const uniqueHandles = new Set(medusaProducts.map(p => p['Product Handle'])).size;
            setStats({
                products: uniqueHandles,
                variants: medusaProducts.length
            });

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to convert CSV');
        } finally {
            setIsConverting(false);
        }
    };

    const reset = () => {
        setFile(null);
        setDownloadUrl(null);
        setError(null);
        setStats(null);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
                {!file ? (
                    <FileUpload key="upload" onFileSelect={handleFileSelect} />
                ) : (
                    <motion.div
                        key="converter"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-white border-b border-slate-100 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 p-2 rounded-lg">
                                    <FileText className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-slate-900">{file.name}</h3>
                                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={reset}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-md transition-colors"
                                title="Reset"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-6">
                            {!downloadUrl ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="currency" className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
                                                Target Currency
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    id="currency"
                                                    value={currencyCode}
                                                    onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())}
                                                    className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2.5 border transition-all"
                                                    placeholder="EUR"
                                                    maxLength={3}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
                                                Product Description Format
                                            </label>
                                            <div className="flex items-center h-[42px]">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={convertMarkdown}
                                                        onChange={(e) => setConvertMarkdown(e.target.checked)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-slate-600">Convert HTML to Markdown</span>
                                                </label>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1.5 uppercase tracking-wide">
                                                Sales Channel
                                            </label>
                                            <div className="space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={useSalesChannel}
                                                        onChange={(e) => setUseSalesChannel(e.target.checked)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-slate-600">Add to sales channel</span>
                                                </label>
                                                {useSalesChannel && (
                                                    <input
                                                        type="text"
                                                        value={salesChannelValue}
                                                        onChange={(e) => setSalesChannelValue(e.target.value)}
                                                        placeholder="default"
                                                        className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-slate-500 focus:ring-slate-500 text-sm p-2 border transition-all"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="bg-red-50 border border-red-100 rounded-lg p-3 flex items-start gap-2"
                                        >
                                            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                                            <p className="text-sm text-red-600">{error}</p>
                                        </motion.div>
                                    )}

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                                        <p className="text-xs text-blue-800">
                                            <span className="font-semibold">Note:</span> Shopify doesn't export collection data. You'll need to add products to collections manually in MedusaJS after import.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleConvert}
                                        disabled={isConverting || !currencyCode}
                                        className={clsx(
                                            "w-full flex items-center justify-center gap-2 text-white font-medium py-2.5 px-4 rounded-lg transition-all duration-200",
                                            isConverting || !currencyCode
                                                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                                : "bg-slate-900 hover:bg-slate-800 active:scale-[0.99]"
                                        )}
                                    >
                                        {isConverting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Converting...
                                            </>
                                        ) : (
                                            <>
                                                Convert File
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-6 text-center">
                                        <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-slate-100 shadow-sm">
                                            <CheckCircle2 className="w-6 h-6 text-slate-900" />
                                        </div>
                                        <h4 className="text-base font-medium text-slate-900 mb-1">Conversion Complete</h4>
                                        <p className="text-sm text-slate-500">
                                            Successfully processed <span className="font-medium text-slate-900">{stats?.products}</span> products and <span className="font-medium text-slate-900">{stats?.variants}</span> variants.
                                        </p>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <p className="text-xs text-blue-800">
                                            <span className="font-semibold">Note:</span> Shopify doesn't export collection data. You'll need to add products to collections manually in MedusaJS after import.
                                        </p>
                                    </div>

                                    <div className="grid gap-3">
                                        <a
                                            href={downloadUrl}
                                            download="medusa-import.csv"
                                            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-4 rounded-lg transition-all active:scale-[0.99]"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download CSV
                                        </a>

                                        <button
                                            onClick={reset}
                                            className="w-full text-slate-500 hover:text-slate-700 text-sm font-medium py-2 transition-colors"
                                        >
                                            Convert another file
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

