import React from 'react';
import { Mail, Phone, MapPin, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
    const [formData, setFormData] = React.useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = React.useState({});
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const validate = (data) => {
        const newErrors = {};
        const nameClean = data.name.trim();
        const emailClean = data.email.trim();
        const messageClean = data.message.trim();

        if (!nameClean) newErrors.name = 'Full name is required';
        else if (nameClean.length < 2) newErrors.name = 'Name must be at least 2 characters';
        else if (!/^[a-zA-Z\s]+$/.test(nameClean)) newErrors.name = 'Name must contain only letters';

        if (!emailClean) newErrors.email = 'Work email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailClean)) newErrors.email = 'Enter a valid email address';

        if (!messageClean) newErrors.message = 'Message is required';
        else if (messageClean.length < 15) newErrors.message = 'Message must be at least 15 characters';

        return newErrors;
    };

    const handleBlur = (field) => {
        const fieldErrors = validate(formData);
        if (fieldErrors[field]) {
            setErrors(prev => ({ ...prev, [field]: fieldErrors[field] }));
        } else {
            setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error as user types valid data
        if (errors[field]) {
            const updated = { ...formData, [field]: value };
            const fieldErrors = validate(updated);
            if (!fieldErrors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate(formData);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);
        // Simulate corporate transmission
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.success('Inquiry Dispatched to Executive Board');
    };

    if (isSubmitted) {
        return (
            <div className="bg-[#f8f9fa] min-h-screen flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 text-center shadow-xl border border-gray-100 space-y-6 animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-primary/5 text-primary rounded-full flex items-center justify-center mx-auto">
                        <Mail size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Transmission Complete</h2>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Your inquiry has been encrypted and dispatched to the FirstWeb Executive Board.
                            Expect a response via work email within 24 business hours.
                        </p>
                    </div>
                    <button
                        onClick={() => setIsSubmitted(false)}
                        className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-secondary transition-all"
                    >
                        Send Another Inquiry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8f9fa] min-h-screen pt-12 pb-24">
            <div className="max-w-5xl mx-auto px-4 md:px-6">
                <div className="space-y-4 mb-12 text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Direct Communication</p>
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Contact HQ</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 md:p-12 space-y-8">
                        <h2 className="text-xl font-bold text-gray-900">Send an Inquiry</h2>
                        <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        onBlur={() => handleBlur('name')}
                                        className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-sm ${errors.name ? 'border-rose-400 bg-rose-50' : 'border-gray-100'}`}
                                        placeholder="e.g. Rahul Gupta"
                                    />
                                    {errors.name && <p className="text-[11px] text-rose-500 font-semibold ml-1 mt-1">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Work Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        onBlur={() => handleBlur('email')}
                                        className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-sm ${errors.email ? 'border-rose-400 bg-rose-50' : 'border-gray-100'}`}
                                        placeholder="rahul@example.com"
                                    />
                                    {errors.email && <p className="text-[11px] text-rose-500 font-semibold ml-1 mt-1">{errors.email}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    value={formData.message}
                                    onChange={e => handleChange('message', e.target.value)}
                                    onBlur={() => handleBlur('message')}
                                    className={`w-full px-6 py-4 bg-gray-50 border rounded-2xl focus:ring-2 focus:ring-primary/5 focus:border-primary outline-none transition-all font-medium text-sm h-32 resize-none ${errors.message ? 'border-rose-400 bg-rose-50' : 'border-gray-100'}`}
                                    placeholder="How can we assist your operations today?"
                                ></textarea>
                                {errors.message && <p className="text-[11px] text-rose-500 font-semibold ml-1 mt-1">{errors.message}</p>}
                            </div>
                            <button
                                disabled={isSubmitting}
                                className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {isSubmitting ? 'Dispatching...' : 'Dispatch Message'}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email HQ</p>
                                    <p className="text-sm font-bold text-gray-900">operations@firstweb.com</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connect</p>
                                    <p className="text-sm font-bold text-gray-900">+91 000 000 0000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Headquarters</p>
                                    <p className="text-sm font-bold text-gray-900 leading-snug">Industrial Hub,<br />Ahmedabad, India</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-primary rounded-3xl text-white space-y-4">
                            <div className="flex items-center gap-3">
                                <Headphones size={20} className="text-accent" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Support Grid</span>
                            </div>
                            <p className="text-xs text-white/50 leading-relaxed font-medium">
                                Our executive support team is active 24/7 for order management and merchant grid inquiries.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
