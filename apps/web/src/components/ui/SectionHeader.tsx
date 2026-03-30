import { motion } from 'framer-motion';

interface SectionHeaderProps {
  title: string;
  description?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ title, description, centered = false, className = '' }: SectionHeaderProps) {
  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  };

  return (
    <motion.div 
      {...fadeUp} 
      className={`mb-20 ${centered ? 'text-center' : ''} ${className}`}
    >
      <h2 className="text-5xl font-bold tracking-tight mb-4">{title}</h2>
      {description && (
        <p className={`text-lg text-gray-500 max-w-2xl ${centered ? 'mx-auto' : ''}`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}
