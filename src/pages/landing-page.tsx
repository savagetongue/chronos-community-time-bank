import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Users, Shield, Globe, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
export function LandingPage() {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-chronos-teal/20 via-background to-background" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="initial"
            animate="animate"
            variants={staggerChildren}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="flex justify-center mb-6">
              <div className="inline-flex items-center rounded-full border border-chronos-teal/20 bg-chronos-teal/10 px-3 py-1 text-sm font-medium text-chronos-teal">
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Community-Powered Economy
              </div>
            </motion.div>
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-display font-bold tracking-tight text-foreground mb-8 text-balance">
              Exchange <span className="text-chronos-teal">Time</span>,<br />
              Share <span className="text-chronos-amber">Skills</span>.
            </motion.h1>
            <motion.p variants={fadeIn} className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto text-pretty">
              Chronos is a fair marketplace where your time equals credit. 
              Help others, earn credits, and get the help you need—without spending a dime.
            </motion.p>
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register">
                <Button size="lg" className="h-12 px-8 text-lg bg-chronos-teal hover:bg-chronos-teal/90 text-white">
                  Start Trading Time
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/explore">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                  Explore Tasks
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Value Props */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-background/50 border-none shadow-soft hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                    <Globe className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Universal Currency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    1 Hour = 1 Credit. Everyone's time is valued equally, creating a truly fair economy for all skills.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-background/50 border-none shadow-soft hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-4">
                    <Shield className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Secure Escrow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Credits are locked when you accept a task and released only upon satisfaction. No scams, no worries.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-background/50 border-none shadow-soft hover:shadow-lg transition-all duration-300 h-full">
                <CardHeader>
                  <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">Community First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build reputation, earn badges, and connect with verified members in your local area or globally.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How Chronos Works</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join the revolution in three simple steps.
            </p>
          </div>
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border hidden md:block -translate-y-1/2 z-0" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <div className="flex flex-col items-center text-center bg-background p-4">
                <div className="w-16 h-16 rounded-full bg-chronos-teal text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-background shadow-lg">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Post or Find</h3>
                <p className="text-muted-foreground">
                  Post a request for help or browse offers from skilled community members.
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-background p-4">
                <div className="w-16 h-16 rounded-full bg-chronos-amber text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-background shadow-lg">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Connect & Do</h3>
                <p className="text-muted-foreground">
                  Agree on terms, lock credits in escrow, and complete the task online or in-person.
                </p>
              </div>
              <div className="flex flex-col items-center text-center bg-background p-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold mb-6 border-4 border-background shadow-lg">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Earn & Review</h3>
                <p className="text-muted-foreground">
                  Credits are released to your wallet. Leave a review to build trust.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}