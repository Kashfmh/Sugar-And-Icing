interface AuthOverlayProps {
    setIsSignUp: (isSignUp: boolean) => void;
    setErrors: (errors: { [key: string]: string }) => void;
}

export default function AuthOverlay({ setIsSignUp, setErrors }: AuthOverlayProps) {
    return (
        <div className="overlay-container">
            <div className="overlay">
                <div className="overlay-panel overlay-left">
                    <h1>Welcome Back!</h1>
                    <p>To keep connected with us please login with your personal info</p>
                    <button className="ghost" onClick={() => { setIsSignUp(false); setErrors({}); }}>
                        Sign In
                    </button>
                </div>
                <div className="overlay-panel overlay-right">
                    <h1>Hello, Friend!</h1>
                    <p>Enter your details and start your journey with delicious treats</p>
                    <button className="ghost" onClick={() => { setIsSignUp(true); setErrors({}); }}>
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}
