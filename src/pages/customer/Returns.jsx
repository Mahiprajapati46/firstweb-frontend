import React from 'react';
import { RotateCcw, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

const Returns = () => {
    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Service Protocol</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Returns & Refunds</h1>
                </div>

                <div className="space-y-8">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 md:p-16 space-y-10">
                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <RotateCcw size={20} className="text-accent" /> Standard 7-Day Audit
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                FirstWeb provides a strict 7-day return window for verified quality discrepancies or shipping errors. To maintain marketplace integrity, items must be returned with all original corporate sealing and security tags intact.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <ShieldCheck size={20} className="text-accent" /> Board Verification
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                Once a return is initiated, our Internal Audit Board reviews the merchant's dispatch log and your submission. The verification process is typically concluded within 48 business hours.
                            </p>
                        </section>

                        <section className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                                <Clock size={20} className="text-accent" /> Stripe & Wallet Credits
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                Approved refunds are processed immediately. Credits to your FirstWeb Wallet are instant, while Stripe-based reversals to your bank account may take 5-7 business days depending on global banking protocols.
                            </p>
                        </section>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { title: 'Initiate Request', desc: 'Via Order History portal' },
                            { title: 'Expert Quality Audit', desc: 'Secure verification' },
                            { title: 'Global Credit', desc: 'Automatic refund flow' },
                        ].map((step, i) => (
                            <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-2">
                                <div className="text-[10px] font-black text-accent mb-2">STEP 0{i + 1}</div>
                                <h4 className="text-sm font-bold text-gray-900">{step.title}</h4>
                                <p className="text-[10px] text-gray-400 font-medium">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Returns;
