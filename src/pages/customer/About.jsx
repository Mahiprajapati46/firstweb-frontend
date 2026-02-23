import React from 'react';

const About = () => {
    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-4xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Our Identity</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">About FirstWeb</h1>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 md:p-16 space-y-10">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">The FirstWeb Ecosystem</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            FirstWeb is an executive-grade commerce infrastructure designed to bridge the gap between industrial manufacturers and the global marketplace. We provide a shielded environment where quality standards are enforced by automated audit logs and expert review boards.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-gray-900">Our Management Directive</h2>
                        <p className="text-sm text-gray-500 leading-relaxed font-medium">
                            Directed by a board of commerce veterans, our mission is to eliminate transaction friction. We empower verified merchants to scale through our proprietary 'Growth Protocol', while ensuring that every consumer engagement is backed by an audited escrow system and secure logistics grid.
                        </p>
                    </section>

                    <section className="space-y-4 pt-10 border-t border-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Platform Integrity</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">Every merchant on our platform undergoes a rigorous growth protocol review to ensure high standards of service and product quality.</p>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-2">Global Reach</h3>
                                <p className="text-xs text-gray-400 leading-relaxed">Integrated with international logistics and secure payment gateways like Stripe, we facilitate seamless commerce across borders.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default About;
