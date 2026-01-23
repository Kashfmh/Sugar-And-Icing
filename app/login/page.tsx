'use client';

import { useState } from 'react';
import './auth.css';
import SignInForm from './_components/SignInForm';
import SignUpForm from './_components/SignUpForm';
import AuthOverlay from './_components/AuthOverlay';
import AuthSuccess from './_components/AuthSuccess';

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
        setIsSignUp(false); // Switch to sign in form
    };

    return (
        <div className="auth-page">
            {signupSuccess && (
                <AuthSuccess email={signupEmail} onClose={handleSuccessClose} />
            )}

            <div className={`auth-container ${isSignUp ? 'right-panel-active' : ''}`}>
                <SignUpForm
                    setIsSignUp={setIsSignUp}
                    setErrors={setErrors}
                    errors={errors}
                    onSuccess={handleSignupSuccess}
                />

                <SignInForm
                    setIsSignUp={setIsSignUp}
                    setErrors={setErrors}
                    errors={errors}
                />

                <AuthOverlay
                    setIsSignUp={setIsSignUp}
                    setErrors={setErrors}
                />
            </div>
        </div>
    );
}
