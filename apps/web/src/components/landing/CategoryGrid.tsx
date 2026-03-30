import { motion } from 'framer-motion';
import { Layout, Code, Palette, Video, TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';

export function CategoryGrid() {
  const categories = [
    { title: 'UI/UX Design', icon: <Layout className="w-6 h-6" />, desc: 'User-centric interfaces that drive engagement.' },
    { title: 'Front-End Dev', icon: <Code className="w-6 h-6" />, desc: 'Modern, responsive, and high-performance code.' },
    { title: 'Brand Design', icon: <Palette className="w-6 h-6" />, desc: 'Logos, colors, and visual systems that define a brand.' },
    { title: 'Content Creator', icon: <Video className="w-6 h-6" />, desc: 'High-quality writing, social media, and storytelling.' },
    { title: 'Marketing Strategy', icon: <TrendingUp className="w-6 h-6" />, desc: 'Data-driven plans that boost product growth.' },
    { title: 'AI Engineering', icon: <Zap className="w-6 h-6" />, desc: 'Cutting-edge AI integration and LLM solutions.' },
  ];

  const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  };

  return (
    <section className="py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <SectionHeader 
          title="Most Requested by Hiring Teams"
          description="See what companies are hiring for right now. Based on hiring manager data from thousands of successful projects."
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((cat, i) => (
            <motion.div 
              {...fadeUp}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="group p-8 border border-gray-100 rounded-[32px] hover:border-black transition-all hover:shadow-xl cursor-pointer"
            >
              <div className="w-14 h-14 bg-gray-50 flex items-center justify-center rounded-2xl mb-6 group-hover:bg-black group-hover:text-white transition-colors">
                {cat.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{cat.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{cat.desc}</p>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
