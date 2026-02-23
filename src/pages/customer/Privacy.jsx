import React from 'react';

const Privacy = () => {
    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Legal Protocol</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Privacy Policy</h1>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 md:p-16 space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">1. Data Architecture</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            FirstWeb operates a secure Data Hub that minimizes external exposure. We collect primary identity markers (Full Name, Contact), financial routing metadata, and operational logs to ensure a secure multi-vendor escrow environment.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">2. Financial Shield</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            We do not store raw credit card or bank credentials on our local nodes. All payment processing is offloaded to Stripe, utilizing 256-bit SSL encryption and tokenization protocols to ensure your financial footprint remains classified.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">3. Governance & Audit</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Internal data access is restricted to the FirstWeb Executive Board and automated system tracers. Data is never distributed to third-party marketing entities. Information is retained only as long as required by global commerce audit standards.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Effective: February 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
