import Link from 'next/link';
import Image from 'next/image';
import { motion, MotionValue } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';

interface HeroProps {
  heroY: MotionValue<number>;
  heroOpacity: MotionValue<number>;
}

export function Hero({ heroY, heroOpacity }: HeroProps) {
  return (
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
          <Link href="/projects">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-black text-white px-10 py-5 rounded-full text-lg font-bold flex items-center gap-4 hover:shadow-2xl transition-all"
            >
              Browse Projects
              <ArrowRight />
            </motion.button>
          </Link>
        </motion.div>

        <div className="relative h-[600px] lg:h-[800px] w-full mt-10 lg:mt-0">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="duotone rounded-[40px] w-full h-full relative"
          >
             {/* Note: I'm leaving the Image as /hero_talent.png as it existed in current code */}
            <Image 
              src="/hero_talent.png" 
              alt="Boulot Talent" 
              fill 
              className="object-cover grayscale"
              priority
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass p-8 rounded-3xl shadow-2xl z-20"
          >
            <h3 className="text-2xl font-bold mb-6">Find Projects Here:</h3>
            <div className="relative mb-8">
              <input 
                type="text" 
                placeholder="Search for any service" 
                className="w-full bg-gray-100 border-none rounded-full py-4 px-6 focus:ring-2 ring-black transition-all"
              />
              <Link href="/projects">
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white p-3 rounded-full">
                  <Search size={20} />
                </button>
              </Link>
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
  );
}
