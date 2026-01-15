"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { SocialLinks } from "@/components/social-links";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Scissors, Clock, Star, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { ParticleBackground } from "@/components/particle-background";

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen bg-black text-white relative overflow-hidden">
        <ParticleBackground />
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <Navbar />
        {/* Hero Section */}
        <section className="relative overflow-hidden px-4 py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-b from-gold-500/10 via-transparent to-transparent" />
          <div className="container mx-auto max-w-6xl relative z-10">
            <motion.div
              className="text-center space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-gold-500/30 text-gold-500 text-sm font-medium glow-gold-hover"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                Premium Barber Experience
              </motion.div>
              <motion.h1
                className="text-5xl md:text-7xl font-bold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="bg-gradient-to-r from-white via-gold-500 to-white bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Razornate
                </span>
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                Book your premium barber appointment. Experience luxury grooming
                with seamless booking.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Link href="/book">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="lg"
                      className="w-full sm:w-auto glow-gold-hover relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Book Appointment
                      </span>
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400"
                        initial={{ x: "-100%" }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </Button>
                  </motion.div>
                </Link>
                <Link href="/auth/signin">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full sm:w-auto border-gold-500/50 hover:border-gold-500 hover:bg-gold-500/10 transition-all"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-20 border-t border-gray-800">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Why Choose Razornate?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Easy Booking",
                  description:
                    "Book your appointment in seconds with real-time availability.",
                },
                {
                  icon: Star,
                  title: "Premium Service",
                  description:
                    "Experience luxury grooming with attention to detail.",
                },
                {
                  icon: Shield,
                  title: "Secure & Reliable",
                  description:
                    "Your data is safe with enterprise-grade security.",
                },
                {
                  icon: Scissors,
                  title: "Expert Barber",
                  description: "Professional barber with years of experience.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl glass border border-gray-800/50 hover:border-gold-500/50 transition-all duration-300 group cursor-pointer"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-10 h-10 text-gold-500 mb-4 group-hover:text-gold-400 transition-colors" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-gold-500 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-20 border-t border-gray-800">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience Premium Grooming?
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              Join Razornate and book your appointment today.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/book">
                <Button
                  size="lg"
                  className="glow-gold-hover relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Get Started
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gold-600 to-gold-400"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-4 py-12 border-t border-gray-800">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-gold-500" />
                  Razornate
                </h3>
                <p className="text-gray-400 text-sm">
                  Premium barber booking experience. Book your appointment with
                  ease.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/book"
                    className="block text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    Book Appointment
                  </Link>
                  <Link
                    href="/portfolio"
                    className="block text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    Portfolio
                  </Link>
                  <Link
                    href="/qr"
                    className="block text-gray-400 hover:text-gold-500 transition-colors"
                  >
                    QR Code Booking
                  </Link>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-4 text-white">Connect</h4>
                <SocialLinks />
              </div>
            </div>
            <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
              <p>
                &copy; {new Date().getFullYear()} Razornate. All rights
                reserved.
              </p>
            </div>
          </div>
        </footer>
        <WhatsAppButton phoneNumber="+5978814672" />
      </div>
    </>
  );
}
