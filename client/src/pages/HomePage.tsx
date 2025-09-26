
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const [activeSection, setActiveSection] = useState('home');

  // Sample blog posts from the existing content
  const featuredPosts = [
    {
      title: "The 20s Advantage: Building Power and Influence for a Lifetime",
      excerpt: "Discover the power of self-reflection and redefining success. Break free from societal norms, embrace your individuality, and pursue a purpose-driven life...",
      category: "Influence",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop&crop=face"
    },
    {
      title: "The Art of Influence: Power and Reality",
      excerpt: "Let's dispense with the euphemisms. Influence is power, pure and simple. It's the art of bending reality to your will, of crafting a world where your desires reign supreme...",
      category: "Mindset",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=250&fit=crop"
    },
    {
      title: "Transforming Through Perception and Prayer",
      excerpt: "Explore how perception, imagination, and prayer can transform your mindset and shape a resilient reality. Discover empowering strategies for personal growth.",
      category: "Spirituality",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=250&fit=crop"
    }
  ];

  const categories = [
    { name: 'Personal Development', count: 12, color: 'indigo' },
    { name: 'Mindset & Influence', count: 8, color: 'purple' },
    { name: 'Self-Reflection', count: 15, color: 'blue' },
    { name: 'Holistic Well-being', count: 6, color: 'emerald' },
    { name: 'Purpose & Authenticity', count: 9, color: 'amber' }
  ];

  const renderHomepage = () => (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-amber-300">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-96 h-96">
            <motion.div
              className="absolute inset-0 border-2 border-white/20 rounded-full"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-4 border border-white/30 rounded-full"
              animate={{
                scale: [1, 0.9, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute inset-8 border border-white/40 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
        </div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
        
        <div className="relative z-10 text-center text-white max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-7xl font-light mb-6 tracking-wide"
          >
            The Growth Halo
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl font-light mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto"
          >
            Unlock your full potential, cultivate resilience, and live a life filled with purpose.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg font-light mb-12 text-white/80 italic"
          >
            "Educating the mind without educating the heart is no education at all." — Aristotle
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              onClick={() => setActiveSection('blog')}
              className="px-8 py-4 bg-white/10 text-white font-light text-lg hover:bg-white/20 transition-all duration-300 rounded-full backdrop-blur-sm border border-white/30"
            >
              Explore Articles
            </Button>
            <Link href="/login">
              <Button className="px-8 py-4 border-2 border-white/40 text-white font-light text-lg hover:bg-white/10 hover:border-white/60 transition-all duration-300 rounded-full backdrop-blur-sm bg-transparent">
                Join the Community
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <div className="bg-white">
        {/* Philosophy Statement */}
        <section className="py-24 px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="text-2xl md:text-3xl leading-loose text-gray-800 font-light space-y-6">
              <p>Growth is not a straight line.</p>
              <p>It's a halo: <span className="text-indigo-600">expansion</span>, <span className="text-purple-600">contraction</span>, <span className="text-amber-600">renewal</span>.</p>
              <p className="text-lg text-gray-600 mt-8 max-w-2xl mx-auto">
                At The Growth Halo, we curate and create valuable content that delves into the realms of personal development, mindset shifts, and holistic well-being.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Featured Articles */}
        <section className="py-16 px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-light text-center mb-16 text-gray-800"
            >
              Featured Insights
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post, index) => (
                <motion.article
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="aspect-video bg-gradient-to-br from-indigo-100 to-purple-100 relative overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 text-indigo-600 text-sm font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-medium mb-3 text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.readTime}</span>
                      <span className="flex items-center text-indigo-600 font-medium group-hover:text-indigo-800">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>

        {/* Growth Categories */}
        <section className="py-20 px-8">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-4xl font-light text-center mb-16 text-gray-800"
            >
              Explore by Theme
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="group cursor-pointer"
                >
                  <div className={`bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 p-6 rounded-lg hover:from-${category.color}-100 hover:to-${category.color}-200 transition-all duration-300 text-center border border-${category.color}-200`}>
                    <h3 className={`text-lg font-medium mb-2 text-${category.color}-800`}>
                      {category.name}
                    </h3>
                    <p className={`text-${category.color}-600 text-sm`}>
                      {category.count} articles
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Community CTA */}
        <section className="py-20 px-8 bg-gradient-to-r from-indigo-50 to-purple-50">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-4xl font-light mb-8 text-gray-800">Join the Growth Community</h2>
            <p className="text-xl leading-relaxed text-gray-700 font-light mb-8">
              Join a thriving community of self-improvement enthusiasts already experiencing positive changes through The Growth Halo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button className="px-8 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors rounded-full">
                  Subscribe to Updates
                </Button>
              </Link>
              <Button
                variant="outline"
                onClick={() => setActiveSection('blog')}
                className="px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-600 hover:text-white transition-all duration-300 rounded-full"
              >
                Browse All Articles
              </Button>
            </div>
          </motion.div>
        </section>
      </div>
    </>
  );

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setActiveSection('home')}
              className="flex items-center space-x-3"
            >
              <motion.div
                className="w-8 h-8 border-2 border-indigo-600 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.1, rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
              </motion.div>
              <span className="text-xl font-light text-gray-800">The Growth Halo</span>
            </button>
            
            <div className="flex items-center space-x-8">
              <button 
                onClick={() => setActiveSection('home')}
                className={`font-light transition-colors ${activeSection === 'home' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveSection('blog')}
                className={`font-light transition-colors ${activeSection === 'blog' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Articles
              </button>
              <button 
                onClick={() => setActiveSection('about')}
                className={`font-light transition-colors ${activeSection === 'about' ? 'text-indigo-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                About
              </button>
              <Link href="/login">
                <Button className="px-6 py-2 bg-indigo-600 text-white font-light rounded-full hover:bg-indigo-700 transition-colors">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      {renderHomepage()}

      {/* Footer */}
      <footer className="py-12 px-8 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="w-8 h-8 border-2 border-white/30 rounded-full mr-4 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white/30" />
              </div>
              <span className="text-white/70 font-light">© The Growth Halo 2024. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-white/70 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-white/60 text-sm text-center">
              This site contains affiliate links. Thank you for supporting The Growth Halo.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
