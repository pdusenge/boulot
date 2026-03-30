'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Search,
  ArrowRight,
  Code,
  Layout,
  Palette,
  Video,
  TrendingUp,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { useRef } from 'react';

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

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
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  };

  return (
    <div className="relative overflow-hidden" ref={containerRef}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 px-6">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            style={{ y: heroY, opacity: heroOpacity }}
          >
            <motion.h1 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-6xl md:text-8xl font-bold leading-[1.1] tracking-tighter mb-8"
            >
              Hire Great <br /> 
              <span className="text-gray-400">People.</span> Faster. <br />
              Smarter.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg text-gray-500 max-w-lg mb-12 leading-relaxed"
            >
              Find, vet, and onboard top student talent in one seamless platform built for speed and scale. AI matches your job instantly with the most suitable candidates.
            </motion.p>
            <Link href="/explore">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-black text-white px-10 py-5 rounded-full text-lg font-bold flex items-center gap-4 hover:shadow-2xl transition-all"
              >
                Browse Candidates
                <ArrowRight />
              </motion.button>
            </Link>
          </motion.div>

          <div className="relative h-[600px] lg:h-[800px] w-full mt-10 lg:mt-0">
            {/* Duotone Image Layer */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="duotone rounded-[40px] w-full h-full relative"
            >
              <Image 
                src="/hero_talent.png" 
                alt="Boulot Talent" 
                fill 
                className="object-cover grayscale"
                priority
              />
            </motion.div>

            {/* Floating Search Card */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-8 rounded-3xl shadow-2xl z-20"
            >
              <h3 className="text-2xl font-bold mb-6">Find Talent Here:</h3>
              <div className="relative mb-8">
                <input 
                  type="text" 
                  placeholder="Search for any service" 
                  className="w-full bg-gray-100 border-none rounded-full py-4 px-6 focus:ring-2 ring-black transition-all"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-full">
                  <Search size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Creative', 'Developers', 'Growth', 'Product Teams', 'Data Science'].map(tag => (
                  <span key={tag} className="px-3 py-1.5 bg-white border border-gray-100 rounded-full text-xs font-semibold hover:bg-black hover:text-white transition-colors cursor-pointer capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-black py-20 px-6 rotate-1">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 -rotate-1">
          {[
            { label: 'System Uptime', value: '99.9%', desc: 'A stable, high-performance platform.' },
            { label: 'Candidates Matched', value: '40,000+', desc: 'Top-tier talent connected with roles.' },
            { label: 'Faster Hiring', value: '85%', desc: 'AI screening workflows cut your time.' },
            { label: 'Teams Hiring', value: '3,500+', desc: 'From startups to global enterprises.' },
          ].map((stat, i) => (
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

      {/* Categories Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="mb-20">
            <h2 className="text-5xl font-bold tracking-tight mb-4">Most Requested by Hiring Teams</h2>
            <p className="text-lg text-gray-500 max-w-2xl">See what companies are hiring for right now. Based on hiring manager data from thousands of successful projects.</p>
          </motion.div>
          
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

      {/* Process Section */}
      <section className="py-32 px-6 bg-muted">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-20">
            <h2 className="text-5xl font-bold tracking-tight mb-4">A Better Way to Build Your Team</h2>
            <p className="text-lg text-gray-500">This is how we work – simplified for velocity.</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
            {[
              { step: '01', title: 'Post & Match', desc: 'AI matches your job instantly with the most suitable student candidates.' },
              { step: '02', title: 'Screen Effortlessly', desc: 'Auto-score resumes, assess skills, and get deeper insights in seconds.' },
              { step: '03', title: 'Hire & Onboard', desc: 'Send offers, sign documents, and onboard with a single click.' },
            ].map((step, i) => (
              <motion.div 
                {...fadeUp}
                transition={{ delay: i * 0.2 }}
                key={i} 
                className="bg-white p-12 rounded-[40px] shadow-sm relative overflow-hidden group"
              >
                <span className="text-8xl font-black text-gray-50 absolute -right-4 -bottom-4 transition-transform group-hover:scale-110">{step.step}</span>
                <p className="text-sm font-bold uppercase tracking-widest text-accent mb-6">Step {i+1}</p>
                <h3 className="text-2xl font-bold mb-4 relative z-10">{step.title}</h3>
                <p className="text-gray-500 leading-relaxed relative z-10">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Featured Testimonial/Talent */}
          <motion.div 
            {...fadeUp}
            className="glass p-12 rounded-[40px] flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto border-white"
          >
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <Image src="/hero_talent.png" alt="Talent" fill className="object-cover" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-xl font-medium mb-4 italic">"Boulot helped me find a high-impact project at a top startup while I was still in my second year. The automated matching was spot on."</p>
              <div>
                <h4 className="font-bold text-lg">Alexandre Dupont</h4>
                <p className="text-gray-500">Full-Stack Developer @ HEC Paris</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
          <div className="lg:w-1/2">
            <motion.h2 {...fadeUp} className="text-5xl font-bold tracking-tight mb-8">Tools That Save Time, Money, and Stress</motion.h2>
            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-xl text-gray-500 mb-12">We've built all the features you need to manage your entire hiring pipeline in one place.</motion.p>
            
            <div className="space-y-6">
              {[
                { title: 'AI Talent Matching', desc: 'Get a shortlist of perfect-fit candidates automatically.', icon: <CheckCircle2 className="text-accent" /> },
                { title: 'Smart Screening', desc: 'Built-in skill tests, personality reports, and automated scoring.', icon: <CheckCircle2 className="text-accent" /> },
                { title: 'Collaboration', desc: 'Share feedback, vote on candidates, and streamline decisions.', icon: <CheckCircle2 className="text-accent" /> },
                { title: 'All-in-One Onboarding', desc: 'Contracts, ID verification, and payroll sync – done beautifully.', icon: <CheckCircle2 className="text-accent" /> },
              ].map((feat, i) => (
                <motion.div 
                  {...fadeUp}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  key={i} 
                  className="flex items-start gap-4 p-4 hover:bg-muted rounded-2xl transition-colors"
                >
                  <div className="mt-1">{feat.icon}</div>
                  <div>
                    <h4 className="font-bold mb-1">{feat.title}</h4>
                    <p className="text-gray-500 text-sm">{feat.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 bg-black rounded-[40px] p-12 text-white relative flex flex-col justify-center items-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-20">
               <Image src="/footer_globe.png" alt="Globe" fill className="object-contain" />
            </div>
            <motion.div {...fadeUp} className="relative z-10">
              <h3 className="text-4xl font-bold mb-8">Find your next hire for a short task or long-term growth</h3>
              <Link href="/register">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-black px-10 py-5 rounded-full text-lg font-bold"
                >
                  Browse Candidates
                </motion.button>
              </Link>
            </motion.div>
            
            {/* Grid Decoration */}
            <div className="absolute bottom-0 left-0 right-0 h-32 grid-bg opacity-10" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-black flex items-center justify-center rounded-sm">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="text-lg font-bold tracking-tighter">BOULOT</span>
          </div>
          <div className="flex gap-8 text-sm text-gray-500 font-medium">
            <Link href="#" className="hover:text-black">Privacy Policy</Link>
            <Link href="#" className="hover:text-black">Terms of Service</Link>
            <Link href="#" className="hover:text-black">Cookies</Link>
          </div>
          <p className="text-sm text-gray-400">© 2026 Boulot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
