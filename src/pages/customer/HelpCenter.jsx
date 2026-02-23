import React, { useState } from 'react';
import { Search, Book, Shield, MessageSquare, ExternalLink, ArrowLeft, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HelpCenter = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null);

    const topics = [
        {
            id: 'buying',
            title: 'Buying Protocol',
            icon: Book,
            desc: 'Learn about order placement, secure payments via Stripe, and shipment tracking mechanisms.',
            details: (
                <div className="space-y-10">
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">01. Secure Acquisition</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Every transaction on FirstWeb is executed through a 256-bit encrypted SSL pipeline. We utilize Stripe for payment processing, ensuring your financial footprint is never stored on our local nodes.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">02. Order Maturation</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Once acquisition is confirmed, the order enters 'Processing'. Merchants are notified instantly via the Global Grid. Quality audits are performed before the logistics dispatch.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">03. Shielded Logistics</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Real-time tracking is provided for every transit. If a delivery does not meet our standard TTL (Time To Live) or quality audit, the 'Returns Protocol' can be initiated within 7 days.
                        </p>
                    </section>
                </div>
            )
        },
        {
            id: 'safety',
            title: 'Merchant Safety',
            icon: Shield,
            desc: 'Explore our growth protocols, verification systems, and fraud prevention frameworks.',
            details: (
                <div className="space-y-10">
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">01. Identity Verification</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            All partners undergo a multi-layered verification process. This includes business identity audits and financial history checks to maintain our 'Boutique-Grade' marketplace integrity.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">02. Escrow Infrastructure</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Payments are held in a secure escrow buffer. Funds are only cleared for withdrawal after a 48-hour delivery verification window, preventing fraudulent chargebacks and ensuring buyer satisfaction.
                        </p>
                    </section>
                    <section className="space-y-4">
                        <h4 className="text-lg font-bold text-gray-900">03. Fraud Resistance</h4>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Our 'Growth Board' monitors transaction anomalies in real-time. Any account showing non-standard patterns is set to 'Restricted' status pending an executive audit.
                        </p>
                    </section>
                </div>
            )
        }
    ];

    const filteredTopics = topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.desc.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectTopic = (id) => {
        setSelectedTopic(id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (selectedTopic) {
        const topic = topics.find(t => t.id === selectedTopic);
        return (
            <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24 animate-in fade-in duration-500">
                <div className="max-w-3xl mx-auto px-4">
                    <button
                        onClick={() => {
                            setSelectedTopic(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-primary transition-colors mb-8"
                    >
                        <ArrowLeft size={14} /> Back to Hub
                    </button>
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
                        <div className="p-10 md:p-16 space-y-12">
                            <div className="space-y-4">
                                <div className="w-16 h-16 bg-primary/5 text-primary rounded-2xl flex items-center justify-center">
                                    <topic.icon size={32} />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{topic.title}</h1>
                                <p className="text-base text-gray-400 font-medium leading-relaxed">{topic.desc}</p>
                            </div>
                            <div className="border-t border-gray-50 pt-12">
                                {topic.details}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-5xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Knowledge Base</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Help Center</h1>
                    <div className="max-w-2xl mx-auto mt-8 relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            className="w-full pl-14 pr-8 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-sm"
                            placeholder="Search documentation, protocols, or infrastructure..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {filteredTopics.length > 0 ? filteredTopics.map(topic => (
                        <div
                            key={topic.id}
                            className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 hover:border-accent group hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 cursor-pointer"
                            onClick={() => handleSelectTopic(topic.id)}
                        >
                            <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-accent group-hover:text-white transition-all">
                                <topic.icon size={24} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-gray-900">{topic.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">{topic.desc}</p>
                            </div>
                            <button className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2 group-hover:gap-3 transition-all">
                                Read Detailed View <ChevronRight size={14} />
                            </button>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center space-y-4">
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No matching protocols found</p>
                            <button onClick={() => setSearchQuery('')} className="text-accent text-[10px] font-black uppercase tracking-widest hover:underline">Clear Search</button>
                        </div>
                    )}
                </div>

                <div className="bg-primary rounded-[2.5rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-white">Need Executive Support?</h2>
                        <p className="text-sm text-white/50 max-w-md">Our dedicated board is available 24/7 for urgent marketplace inquiries and security matters.</p>
                    </div>
                    <Link to="/contact" className="px-10 py-5 bg-accent text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-accent/20 hover:bg-[#9D795B] transition-all flex items-center gap-3">
                        <MessageSquare size={18} /> Open Direct Line
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default HelpCenter;

