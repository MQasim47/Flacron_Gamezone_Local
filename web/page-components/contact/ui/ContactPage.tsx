'use client';

import { useState, useEffect, useMemo } from 'react';
import {
   Mail,
   Clock,
   MessageCircle,
   User,
   Send,
   AlertCircle,
   CheckCircle2,
   MapPin,
   Phone,
   Headphones,
} from 'lucide-react';

type FormErrors = {
   name?: string;
   email?: string;
   subject?: string;
   message?: string;
   general?: string;
};

export default function ContactPage() {
   const [formData, setFormData] = useState({
      name: '',
      email: '',
      subject: '',
      message: '',
   });
   const [error, setError] = useState<FormErrors>({});
   const [loading, setLoading] = useState<boolean>(false);
   const [success, setSuccess] = useState<boolean>(false);
   const [mounted, setMounted] = useState(false);

   const particleStyles = useMemo(
      () =>
         Array.from({ length: 15 }, () => ({
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            '--float-duration': `${5 + Math.random() * 10}s`,
            '--float-delay': `${Math.random() * 5}s`,
         })),
      []
   );

   useEffect(() => {
      setMounted(true);
   }, []);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (error[name as keyof FormErrors]) {
         setError((prev) => ({ ...prev, [name]: undefined }));
      }
   };

   const validate = (): FormErrors => {
      const errs: FormErrors = {};
      if (!formData.name || formData.name.trim().length < 2)
         errs.name = 'Name must be at least 2 characters.';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email))
         errs.email = 'Please enter a valid email address.';
      if (!formData.subject || formData.subject.trim().length < 3)
         errs.subject = 'Subject must be at least 3 characters.';
      if (!formData.message || formData.message.trim().length < 10)
         errs.message = 'Message must be at least 10 characters.';
      return errs;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError({});
      setSuccess(false);
      const errs = validate();
      if (Object.keys(errs).length > 0) {
         setError(errs);
         return;
      }

      try {
         setLoading(true);
         const apiBase = process.env.NEXT_PUBLIC_API_BASE;
         if (!apiBase) {
            throw new Error('Contact service is not configured.');
         }
         const res = await fetch(`${apiBase}/api/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
         });
         const data = await res.json();
         if (!res.ok) throw new Error(data.error || 'Failed to send');
         setSuccess(true);
         setFormData({ name: '', email: '', subject: '', message: '' });
      } catch (err: any) {
         setError({ general: err.message || 'Failed to send message.' });
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
         <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
               className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '4s' }}
            />
            <div
               className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '6s', animationDelay: '1s' }}
            />
            <div
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"
               style={{ animationDuration: '8s', animationDelay: '2s' }}
            />
         </div>
         <div className="absolute inset-0 pointer-events-none">
            {mounted &&
               particleStyles.map((style, i) => (
                  <div
                     key={i}
                     className="absolute w-1 h-1 bg-blue-400/20 rounded-full particle-float"
                     style={style as React.CSSProperties}
                  />
               ))}
         </div>
         <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
            <div
               className={`text-center mb-12 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 mb-6 shadow-lg shadow-blue-500/50 relative group">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                  <Mail className="w-10 h-10 text-white relative z-10" />
               </div>
               <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                  Get in Touch
               </h1>
               <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                  Need help with Flacrom Gamezone? Our support team is here to
                  assist you with any questions or issues.
               </p>
            </div>

            <div
               className={`grid md:grid-cols-4 gap-6 mb-12 transition-all duration-1000 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
               {[
                  {
                     icon: Mail,
                     label: 'Email Support',
                     detail: 'support@flacromgamezone.com',
                     sub: 'General inquiries',
                     color: 'blue',
                  },
                  {
                     icon: Phone,
                     label: 'Phone',
                     detail: '929-444-1275',
                     sub: 'Mon-Fri, 9AM-6PM EST',
                     color: 'purple',
                  },
                  {
                     icon: Clock,
                     label: 'Response Time',
                     detail: 'Within 24 hours',
                     sub: 'Premium: <12 hours',
                     color: 'green',
                  },
                  {
                     icon: Headphones,
                     label: 'Premium Support',
                     detail: '24/7 Priority',
                     sub: 'For premium members',
                     color: 'cyan',
                  },
               ].map(({ icon: Icon, label, detail, sub, color }) => (
                  <div key={label} className="relative group">
                     <div
                        className={`absolute -inset-0.5 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}
                     />
                     <div
                        className={`relative bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6 text-center hover:border-${color}-500/50 transition-all duration-300 hover:-translate-y-2`}
                     >
                        <div
                           className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${color}-500 to-${color}-600 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                        >
                           <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-white mb-2">
                           {label}
                        </h3>
                        <p className="text-sm text-slate-400 mb-1">{detail}</p>
                        <p className="text-xs text-slate-500">{sub}</p>
                     </div>
                  </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
               <div
                  className={`lg:col-span-2 transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               >
                  <div className="relative group">
                     <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
                     <div className="relative bg-gradient-to-b from-slate-800/95 to-slate-900/95 backdrop-blur-2xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                           <MessageCircle className="w-6 h-6 text-blue-400" />
                           Send us a Message
                        </h2>
                        {success && (
                           <div
                              className="mb-6 bg-green-500/10 border border-green-500/50 text-green-400 p-4 rounded-xl backdrop-blur-sm animate-slideIn"
                              role="alert"
                           >
                              <div className="flex items-center gap-2">
                                 <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                 <span>
                                    Message sent successfully! We'll get back to
                                    you within 24 hours.
                                 </span>
                              </div>
                           </div>
                        )}
                        {error.general && (
                           <div
                              className="mb-6 bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl backdrop-blur-sm animate-shake"
                              role="alert"
                           >
                              <div className="flex items-center gap-2">
                                 <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                 <span>{error.general}</span>
                              </div>
                           </div>
                        )}
                        <form
                           onSubmit={handleSubmit}
                           className="space-y-5"
                           noValidate
                        >
                           <div className="grid md:grid-cols-2 gap-5">
                              {[
                                 {
                                    id: 'name',
                                    label: 'Your Name',
                                    placeholder: 'John Doe',
                                    type: 'text',
                                    icon: User,
                                 },
                                 {
                                    id: 'email',
                                    label: 'Email Address',
                                    placeholder: 'you@example.com',
                                    type: 'email',
                                    icon: Mail,
                                 },
                              ].map(
                                 ({
                                    id,
                                    label,
                                    placeholder,
                                    type,
                                    icon: Icon,
                                 }) => (
                                    <div key={id} className="space-y-2">
                                       <label
                                          htmlFor={id}
                                          className="block text-sm font-medium text-slate-300"
                                       >
                                          {label}
                                       </label>
                                       <div className="relative group/input">
                                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                             <Icon className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                          </div>
                                          <input
                                             id={id}
                                             name={id}
                                             type={type}
                                             placeholder={placeholder}
                                             value={
                                                formData[
                                                   id as keyof typeof formData
                                                ]
                                             }
                                             onChange={handleChange}
                                             required
                                             aria-invalid={Boolean(
                                                error[id as keyof FormErrors]
                                             )}
                                             className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                          />
                                       </div>
                                       {error[id as keyof FormErrors] && (
                                          <p
                                             className="text-sm text-red-400 flex items-center gap-1 animate-slideIn"
                                             role="alert"
                                          >
                                             <AlertCircle className="w-4 h-4" />
                                             {error[id as keyof FormErrors]}
                                          </p>
                                       )}
                                    </div>
                                 )
                              )}
                           </div>
                           <div className="space-y-2">
                              <label
                                 htmlFor="subject"
                                 className="block text-sm font-medium text-slate-300"
                              >
                                 Subject
                              </label>
                              <div className="relative group/input">
                                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MessageCircle className="w-5 h-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                                 </div>
                                 <input
                                    id="subject"
                                    name="subject"
                                    type="text"
                                    placeholder="What is this about?"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                                 />
                              </div>
                              {error.subject && (
                                 <p
                                    className="text-sm text-red-400 flex items-center gap-1"
                                    role="alert"
                                 >
                                    <AlertCircle className="w-4 h-4" />
                                    {error.subject}
                                 </p>
                              )}
                           </div>
                           <div className="space-y-2">
                              <label
                                 htmlFor="message"
                                 className="block text-sm font-medium text-slate-300"
                              >
                                 Message
                              </label>
                              <textarea
                                 id="message"
                                 name="message"
                                 placeholder="Tell us about your inquiry..."
                                 value={formData.message}
                                 onChange={handleChange}
                                 required
                                 rows={6}
                                 className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 resize-none"
                              />
                              {error.message && (
                                 <p
                                    className="text-sm text-red-400 flex items-center gap-1"
                                    role="alert"
                                 >
                                    <AlertCircle className="w-4 h-4" />
                                    {error.message}
                                 </p>
                              )}
                           </div>
                           <button
                              type="submit"
                              disabled={loading}
                              className="relative w-full group/btn overflow-hidden"
                           >
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl transition-transform duration-300 group-hover/btn:scale-105" />
                              <div className="relative flex items-center justify-center gap-2 py-3 text-white font-semibold">
                                 {loading ? (
                                    <>
                                       <svg
                                          className="animate-spin h-5 w-5"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                       >
                                          <circle
                                             className="opacity-25"
                                             cx="12"
                                             cy="12"
                                             r="10"
                                             stroke="currentColor"
                                             strokeWidth="4"
                                          />
                                          <path
                                             className="opacity-75"
                                             fill="currentColor"
                                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                          />
                                       </svg>
                                       <span>Sending...</span>
                                    </>
                                 ) : (
                                    <>
                                       <span>Send Message</span>
                                       <Send className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                    </>
                                 )}
                              </div>
                           </button>
                        </form>
                     </div>
                  </div>
               </div>

               <div
                  className={`space-y-6 transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
               >
                  <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                     <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Support Hours
                     </h3>
                     <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-slate-300">
                           <span>Monday - Friday</span>
                           <span className="text-green-400">9AM - 6PM EST</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                           <span>Saturday</span>
                           <span className="text-blue-400">10AM - 4PM EST</span>
                        </div>
                        <div className="flex justify-between text-slate-300">
                           <span>Sunday</span>
                           <span className="text-slate-500">Closed</span>
                        </div>
                        <div className="pt-3 border-t border-slate-700/50">
                           <p className="text-xs text-slate-400">
                              Premium members get 24/7 priority support
                           </p>
                        </div>
                     </div>
                  </div>
                  <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                     <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-400" />
                        Headquarters
                     </h3>
                     <p className="text-sm text-slate-400 leading-relaxed">
                        Flacrom Gamezone Inc.
                        <br />
                        123 Gaming Boulevard
                        <br />
                        Suite 456
                        <br />
                        San Francisco, CA 94102
                        <br />
                        United States
                     </p>
                  </div>
                  <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-xl p-6">
                     <h3 className="font-semibold text-white mb-4">
                        Quick Links
                     </h3>
                     <div className="space-y-2">
                        {[
                           {
                              href: '/pricing?scroll=faq',
                              label: 'FAQ & Help Center',
                           },
                           { href: '/terms', label: 'Terms & Conditions' },
                           { href: '/privacy', label: 'Privacy Policy' },
                           { href: '/pricing', label: 'Pricing Plans' },
                        ].map(({ href, label }) => (
                           <a
                              key={href}
                              href={href}
                              className="block text-sm text-slate-400 hover:text-blue-400 transition-colors"
                           >
                              → {label}
                           </a>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <style jsx>{`
            .particle-float {
               animation: float var(--float-duration, 8s) ease-in-out infinite;
               animation-delay: var(--float-delay, 0s);
            }
            @keyframes float {
               0%,
               100% {
                  transform: translateY(0px) translateX(0px);
               }
               50% {
                  transform: translateY(-20px) translateX(10px);
               }
            }
            @keyframes shake {
               0%,
               100% {
                  transform: translateX(0);
               }
               25% {
                  transform: translateX(-5px);
               }
               75% {
                  transform: translateX(5px);
               }
            }
            @keyframes slideIn {
               from {
                  opacity: 0;
                  transform: translateY(-10px);
               }
               to {
                  opacity: 1;
                  transform: translateY(0);
               }
            }
            @keyframes gradient {
               0%,
               100% {
                  background-position: 0% 50%;
               }
               50% {
                  background-position: 100% 50%;
               }
            }
            .animate-shake {
               animation: shake 0.4s ease-in-out;
            }
            .animate-slideIn {
               animation: slideIn 0.3s ease-out;
            }
            .animate-gradient {
               background-size: 200% auto;
               animation: gradient 3s ease infinite;
            }
         `}</style>
      </div>
   );
}
