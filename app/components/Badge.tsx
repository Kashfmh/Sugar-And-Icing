interface BadgeProps {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
}

export default function Badge({ children, variant = 'primary' }: BadgeProps) {
    return (
        <span
            className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${variant === 'primary'
                    ? 'bg-sai-rose text-white'
                    : 'bg-sai-pink/20 text-sai-rose'
                }`}
        >
            {children}
        </span>
    );
}
