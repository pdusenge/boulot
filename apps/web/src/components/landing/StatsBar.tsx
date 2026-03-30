import { motion } from 'framer-motion';

export function StatsBar() {
  const stats = [
    { label: 'System Uptime', value: '99.9%', desc: 'A stable, high-performance platform.' },
    { label: 'Candidates Matched', value: '40,000+', desc: 'Top-tier talent connected with roles.' },
    { label: 'Faster Hiring', value: '85%', desc: 'AI screening workflows cut your time.' },
    { label: 'Teams Hiring', value: '3,500+', desc: 'From startups to global enterprises.' },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <section className="bg-black py-20 px-6 rotate-1">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 -rotate-1">
        {stats.map((stat, i) => (
          <motion.div 
            {...fadeUp}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="text-white border-l border-white/20 pl-6"
          >
            <h4 className="text-4xl font-bold mb-2">{stat.value}</h4>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{stat.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
