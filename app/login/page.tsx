'use client';

import { useState } from 'react';
import './auth.css';
import SignInForm from './_components/SignInForm';
import SignUpForm from './_components/SignUpForm';
import AuthSuccess from './_components/AuthSuccess';
import { motion, AnimatePresence } from 'framer-motion';

import Image from 'next/image';

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [signupEmail, setSignupEmail] = useState('');

    const handleSignupSuccess = (email: string) => {
        setSignupEmail(email);
        setSignupSuccess(true);
    };

    const handleSuccessClose = () => {
        setSignupSuccess(false);
        setIsSignUp(false);
    };

    return (
        <div className={`auth-page min-h-screen bg-white flex flex-col ${isSignUp ? 'md:flex-row-reverse' : 'md:flex-row'} md:h-screen md:overflow-hidden pb-24 lg:pb-0`}>
            {signupSuccess && (
                <AuthSuccess email={signupEmail} onClose={handleSuccessClose} />
            )}

            {/* Left Side: Forms */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="w-full md:w-1/2 flex items-center md:items-start justify-center p-6 sm:p-12 lg:p-24 md:pt-32 bg-white relative overflow-y-auto z-10"
            >
                <div className="w-full max-w-md relative">
                    <AnimatePresence mode="wait">
                        {isSignUp ? (
                            <motion.div
                                key="signup"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <SignUpForm
                                    setIsSignUp={setIsSignUp}
                                    setErrors={setErrors}
                                    errors={errors}
                                    onSuccess={handleSignupSuccess}
                                />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signin"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="w-full"
                            >
                                <SignInForm
                                    setIsSignUp={setIsSignUp}
                                    setErrors={setErrors}
                                    errors={errors}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Right Side: Hero Image (Hidden on Mobile) */}
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="hidden md:flex w-1/2 relative bg-sai-charcoal items-center justify-center p-12 overflow-hidden z-0"
            >
                <Image
                    src="/images/hero/baking.png"
                    alt="Sugar And Icing Bakery"
                    fill
                    className="object-cover opacity-90"
                    priority
                />

                {/* Optional Hero Text matching reference image styling */}
                <div className="relative z-10 max-w-md w-full bg-black/40 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl">
                    <h2 className="text-3xl font-serif text-white mb-4">
                        Beautiful custom cakes, baked fresh for every occasion.
                    </h2>
                    <p className="text-gray-300">
                        Join Sugar And Icing today to track your orders, save your delivery addresses, and never miss out on our seasonal treats.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
