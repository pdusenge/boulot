import { motion } from 'framer-motion';
import { SectionHeader } from '../ui/SectionHeader';

export function ProcessTimeline() {
  const steps = [
    { step: '01', title: 'Post & Match', desc: 'AI matches your job instantly with the most suitable student candidates.' },
    { step: '02', title: 'Screen Effortlessly', desc: 'Auto-score resumes, assess skills, and get deeper insights in seconds.' },
    { step: '03', title: 'Hire & Onboard', desc: 'Send offers, sign documents, and onboard with a single click.' },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <section className="py-32 px-6 bg-muted">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="A Better Way to Build Your Team"
          description="This is how we work – simplified for velocity."
          centered
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {steps.map((step, i) => (
            <motion.div 
              {...fadeUp}
              transition={{ delay: i * 0.2 }}
              key={i} 
              className="bg-white p-12 rounded-[40px] shadow-sm relative overflow-hidden group"
            >
              <span className="text-8xl font-black text-gray-50 absolute -right-4 -bottom-4 transition-transform group-hover:scale-110">{step.step}</span>
              <p className="text-sm font-bold uppercase tracking-widest text-[#a3e635] mb-6">Step {i+1}</p>
              <h3 className="text-2xl font-bold mb-4 relative z-10">{step.title}</h3>
              <p className="text-gray-500 leading-relaxed relative z-10">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
