'use client';
import Link from 'next/link';
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    // Don't show footer on homepage
    if (pathname === '/') {
        return null;
    }

    return (
        <footer className="bg-sai-charcoal text-sai-white">
            {/* Mobile Mini Footer - Only essentials */}
            <div className="md:hidden py-4 px-6 mb-16">
                <div className="max-w-md mx-auto">
                    {/* Quick Contact */}
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <a
                            href="https://wa.me/60108091351"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-gray-300 hover:text-sai-pink transition-colors text-sm"
                        >
                            <MessageCircle className="w-4 h-4" style={{ color: 'var(--color-sai-pink)' }} />
                            <span>WhatsApp Us</span>
                        </a>
                        <span className="text-gray-600">|</span>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-300 hover:text-sai-pink transition-colors"
                            aria-label="Instagram"
                        >
                            <Instagram className="w-4 h-4" />
                        </a>
                    </div>
                    {/* Copyright */}
                    <p className="text-xs text-gray-400 text-center">
                        © {currentYear} Sugar And Icing. Made with 💕 in KL.
                    </p>
                </div>
            </div>

            {/* Desktop Full Footer */}
            <div className="hidden md:block py-12">
                <div className="max-w-6xl mx-auto px-6">
                    {/* Main Footer Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        {/* About Section */}
                        <div>
                            <h3 className="font-serif text-xl mb-4" style={{ color: 'var(--color-sai-pink)' }}>
                                Sugar And Icing
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                Homemade cakes and treats baked fresh with love in Brickfields, KL.
                                Specializing in custom celebration cakes for all your special moments.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <Link href="/" className="text-gray-300 hover:text-sai-pink transition-colors">
                                        Home
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/custom-cakes" className="text-gray-300 hover:text-sai-pink transition-colors">
                                        Custom Cakes
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/other-treats" className="text-gray-300 hover:text-sai-pink transition-colors">
                                        Other Treats
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/contact" className="text-gray-300 hover:text-sai-pink transition-colors">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="font-semibold mb-4">Get In Touch</h4>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: 'var(--color-sai-pink)' }} />
                                    <span className="text-gray-300">Brickfields, KL Sentral<br />Kuala Lumpur, Malaysia</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-sai-pink)' }} />
                                    <a href="tel:+60108091351" className="text-gray-300 hover:text-sai-pink transition-colors">
                                        +60 10 809 1351
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-sai-pink)' }} />
                                    <a
                                        href="https://wa.me/60108091351"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-300 hover:text-sai-pink transition-colors"
                                    >
                                        WhatsApp Us
                                    </a>
                                </li>
                            </ul>

                            {/* Social Media */}
                            <div className="flex gap-4 mt-4">
                                <a
                                    href="https://instagram.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-sai-pink transition-colors"
                                    aria-label="Instagram"
                                >
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://facebook.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-gray-300 hover:text-sai-pink transition-colors"
                                    aria-label="Facebook"
                                >
                                    <Facebook className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-700 pt-6 text-center">
                        <p className="text-sm text-gray-400">
                            © {currentYear} Sugar And Icing. All rights reserved. Made with 💕 in KL.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
