import React from 'react';
import { ArrowRight, Shield, Zap, Globe, Package } from 'lucide-react';
import Button from '../components/ui/Button';

const Home = () => {
    return (
        <div className="animate-in fade-in duration-700">
            {/* Hero Section */}
            <section className="relative bg-white overflow-hidden py-24 lg:py-32 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <h1 className="text-5xl lg:text-6xl font-extrabold text-primary tracking-tight leading-[1.1]">
                            The Professional <br />
                            <span className="text-accent">Marketplace</span> Engine.
                        </h1>
                        <p className="mt-8 text-xl text-gray-500 leading-relaxed max-w-2xl">
                            Experience a multi-vendor platform built for scale. Corporate management,
                            AI-driven moderation, and a seamless commerce infrastructure for the modern enterprise.
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button to="/products" size="lg" className="flex items-center gap-2 shadow-lg shadow-primary/20">
                                Explore Marketplace <ArrowRight size={20} />
                            </Button>
                            <Button to="/merchant/apply" variant="outline" size="lg">
                                Join as Merchant
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Background purely decorative element */}
                <div className="absolute right-0 top-0 w-1/3 h-full bg-soft-accent bg-opacity-5 -skew-x-12 transform origin-top-right"></div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-background">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-primary">Built for Excellence</h2>
                        <p className="mt-4 text-gray-500">Every feature is designed with a focus on simplicity, security, and industrial-grade performance.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="card-premium p-8 h-full flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-accent bg-opacity-10 rounded-2xl flex items-center justify-center text-accent mb-6">
                                <Shield size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-3">Enterprise Security</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Role-based access, JWT authentication, and secure payment processing at the core.
                            </p>
                        </div>

                        <div className="card-premium p-8 h-full flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-soft-accent bg-opacity-20 rounded-2xl flex items-center justify-center text-accent mb-6">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-3">Modular Growth</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Scale your category tree and merchant network without compromising on speed.
                            </p>
                        </div>

                        <div className="card-premium p-8 h-full flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-primary bg-opacity-5 rounded-2xl flex items-center justify-center text-primary mb-6">
                                <Package size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-3">Smart Moderation</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Built-in product review pipelines to ensure catalog quality and merchant trust.
                            </p>
                        </div>

                        <div className="card-premium p-8 h-full flex flex-col items-center text-center">
                            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-600 mb-6">
                                <Globe size={28} />
                            </div>
                            <h3 className="text-lg font-bold text-primary mb-3">Cloud Ready</h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Optimized for cloud deployment with streamlined environment configurations.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
