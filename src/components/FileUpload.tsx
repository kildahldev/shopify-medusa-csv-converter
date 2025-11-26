import React, { useCallback, useState } from 'react';
import { Upload, FileType } from 'lucide-react';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
    const [isDragActive, setIsDragActive] = useState(false);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                onFileSelect(e.dataTransfer.files[0]);
            }
        },
        [onFileSelect]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                onFileSelect(e.target.files[0]);
            }
        },
        [onFileSelect]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={clsx(
                    "relative group cursor-pointer rounded-xl border border-dashed transition-all duration-200 ease-in-out",
                    isDragActive
                        ? "border-slate-400 bg-slate-50"
                        : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/50"
                )}
            >
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                />
                <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-12 px-4 cursor-pointer w-full h-full">
                    <div className={clsx(
                        "mb-4 rounded-full p-3 transition-colors duration-200",
                        isDragActive ? "bg-slate-200 text-slate-700" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                    )}>
                        <Upload className="w-6 h-6" strokeWidth={2} />
                    </div>

                    <h3 className="text-sm font-medium text-slate-900 mb-1">
                        Upload Shopify Export
                    </h3>
                    <p className="text-xs text-slate-500 mb-4 text-center">
                        Drag and drop or click to browse
                    </p>

                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-[10px] font-medium text-slate-500 border border-slate-200">
                        <FileType className="w-3 h-3" />
                        <span>CSV ONLY</span>
                    </div>
                </label>
            </div>
        </motion.div>
    );
};
