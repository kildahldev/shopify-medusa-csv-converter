import { Converter } from './components/Converter';
import { Github, Star } from 'lucide-react';
import { useState, useEffect } from 'react';

function App() {
    const [stars, setStars] = useState<number | null>(null);

    useEffect(() => {
        fetch('https://api.github.com/repos/kildahldev/shopify-medusa-csv-converter')
            .then(res => res.json())
            .then(data => setStars(data.stargazers_count))
            .catch(() => setStars(null));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* GitHub Link */}
                <div className="fixed top-4 right-4">
                    <a
                        href="https://github.com/kildahldev/shopify-medusa-csv-converter"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:shadow-md hover:border-slate-300 transition-all group"
                    >
                        <Github className="w-4 h-4 text-slate-700 group-hover:text-slate-900" />
                        {stars !== null && (
                            <div className="flex items-center gap-1 text-xs text-slate-600 group-hover:text-slate-900">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="font-medium">{stars}</span>
                            </div>
                        )}
                    </a>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">
                        Shopify to MedusaJS
                    </h1>
                    <p className="text-slate-500 max-w-lg mx-auto text-base">
                        A simple, helpful tool to convert your Shopify product exports for MedusaJS, running entirely client-side.
                    </p>
                </div>

                <Converter />
            </div>
        </div>
    );
}

export default App;
