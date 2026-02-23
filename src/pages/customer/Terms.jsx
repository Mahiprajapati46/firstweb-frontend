import React from 'react';

const Terms = () => {
    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Usage Framework</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Terms & Conditions</h1>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 md:p-16 space-y-12">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">1. Global Gateway Participation</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            By accessing the FirstWeb Global Gateway, you agree to operate within our secure commerce framework. All transactions are subjects to real-time audit logs maintained for marketplace security and fiscal transparency.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">2. Multi-Vendor Logistics</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Our platform facilitates interactions between independent vendors and global consumers. Merchants are bound by the 'Premium Fulfillment Directive', ensuring 48-hour dispatch lead times and verified tracking integration.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">3. Verified Engagement</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Any attempt at automated grid scraping, session spoofing, or fraudulent order placement is detected by our 'Shield Core' and will result in permanent account status restriction and legal audit.
                        </p>
                    </section>

                    <div className="pt-10 border-t border-gray-50">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Revision: 14.02.26</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Terms;
