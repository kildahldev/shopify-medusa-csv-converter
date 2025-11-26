import { Converter } from './components/Converter';

function App() {
    return (
        <div className="min-h-screen bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto">
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
