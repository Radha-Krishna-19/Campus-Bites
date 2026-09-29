import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Utensils, Sparkles, TrendingUp, Clock, Shield, Smartphone,
  ChefHat, Timer, Users, ArrowRight, MapPin, Github, QrCode, Wallet, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MagneticButton from "@/components/MagneticButton";
import TiltCard from "@/components/TiltCard";
import CountUp from "@/components/CountUp";
import { CANTEENS, MENU_ITEMS } from "@/utils/demoData";

const NAV_LINKS = [
  { label: "Canteens", href: "#canteens" },
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#how-it-works" },
  { label: "Menu", href: "#menu" },
];

const CANTEEN_HIGHLIGHTS = {
  sopanam: ["Masala Dosa", "Idli", "Filter Coffee"],
  mba: ["Chicken Biryani", "Paneer Butter Masala", "Butter Naan"],
  samudra: ["Banana-leaf Meals", "Sambar Rice", "Fruit Salad"],
};

const FEATURES = [
  {
    icon: <Sparkles className="w-7 h-7" />,
    title: "AI-Powered Recommendations",
    description: "Get personalized meal suggestions based on your health goals and order history.",
  },
  {
    icon: <Clock className="w-7 h-7" />,
    title: "Skip the Queue",
    description: "Order ahead and pick up your food with a unique token number — no waiting in line.",
  },
  {
    icon: <TrendingUp className="w-7 h-7" />,
    title: "Track Your Spending",
    description: "Monitor your daily, weekly, and monthly food expenses with smart analytics.",
  },
  {
    icon: <Shield className="w-7 h-7" />,
    title: "Secure Payments",
    description: "Pay safely with Razorpay — UPI, Cards, and Net Banking all supported.",
  },
  {
    icon: <Smartphone className="w-7 h-7" />,
    title: "Mobile-First Design",
    description: "A seamless experience on every device, with a beautiful, modern interface.",
  },
  {
    icon: <Utensils className="w-7 h-7" />,
    title: "3 Campus Canteens",
    description: "Access Sopanam, MBA, and Samudra canteens all from one single app.",
  },
];

const STEPS = [
  { icon: <QrCode className="w-6 h-6" />, title: "Browse & Choose", description: "Explore live menus from all three canteens and pick your favorites." },
  { icon: <Wallet className="w-6 h-6" />, title: "Pay Instantly", description: "Checkout securely in seconds with UPI, card, or net banking." },
  { icon: <Timer className="w-6 h-6" />, title: "Get Your Token", description: "Receive a unique pickup token and track your order in real time." },
  { icon: <CheckCircle2 className="w-6 h-6" />, title: "Skip & Savor", description: "Walk straight to the counter, skip the queue, and enjoy your meal." },
];

const GALLERY_IDS = ["item_samudra_001", "item_sopanam_002", "item_mba_001", "item_sopanam_003", "item_mba_004", "item_samudra_007"];
const GALLERY = GALLERY_IDS.map((id) => MENU_ITEMS.find((m) => m.item_id === id)).map((m) => ({
  img: m.image_url.replace("w=600", "w=800"),
  title: m.name,
  price: m.price,
  tag: CANTEENS.find((c) => c.canteen_id === m.canteen_id).name,
}));

const USE_CASES = [
  { icon: <Timer className="w-6 h-6" />, title: "The 10-minute break", text: "Order from your seat when the lecture ends. By the time you reach Sopanam, your dosa has a token number and is on the pass." },
  { icon: <Wallet className="w-6 h-6" />, title: "The month-end budget", text: "Every bill lands in your spending dashboard, split by day, week and month, so you always know where your food money went." },
  { icon: <Sparkles className="w-6 h-6" />, title: "The exam-week slump", text: "Tell the nutrition assistant you're stressed or tired and it picks dishes from all three canteens that actually help." },
];

const MARQUEE_ITEMS = ["Sopanam Canteen", "MBA Canteen", "Samudra Canteen", "AI Recommendations", "Live Order Tracking", "Instant UPI Payments", "Zero Queue Pickup"];

function Marquee() {
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-orange-100 bg-white/70 py-4">
      <div className="flex w-max gap-10 animate-marquee">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-semibold text-gray-500 whitespace-nowrap">
            <Utensils className="w-4 h-4 text-orange-400" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-orange-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50">
        <div
          className={`absolute inset-0 backdrop-blur-md transition-all duration-300 ${
            scrolled ? "bg-white/90 shadow-md shadow-orange-900/5 border-b border-orange-100" : "bg-white/60 border-b border-transparent"
          }`}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 group" data-cursor="Home">
              <motion.div whileHover={{ rotate: -12, scale: 1.1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Utensils className="w-8 h-8 text-orange-600" />
              </motion.div>
              <span className="text-2xl font-bold gradient-text">Campus Bites</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className="relative text-sm font-medium text-gray-600 hover:text-orange-600 transition-colors group">
                  {link.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
            </nav>

            <div className="flex gap-3">
              <Button variant="outline" asChild className="rounded-full border-orange-200 hover:border-orange-400 hidden sm:inline-flex">
                <Link to="/crew/login" data-cursor="Crew">Crew Login</Link>
              </Button>
              <MagneticButton>
                <Button asChild className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg shadow-orange-500/20">
                  <Link to="/student/login" data-cursor="Go">Get Started</Link>
                </Button>
              </MagneticButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Smart Ordering</span>
            </motion.div>

            <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
              <span className="gradient-text">Skip the Queue,</span>
              <br />
              <span className="text-gray-900">Savor the Moment</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl leading-relaxed">
              Order from Sopanam, MBA, and Samudra canteens with AI recommendations, instant payments, and real-time tracking — right from your phone.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <MagneticButton>
                <Button size="lg" asChild className="rounded-full px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-2xl shadow-orange-500/30 btn-ripple" data-testid="hero-order-now-btn">
                  <Link to="/student/register" data-cursor="Order">Order Now <ArrowRight className="w-5 h-5 ml-1" /></Link>
                </Button>
              </MagneticButton>
              <MagneticButton>
                <Button size="lg" variant="outline" asChild className="rounded-full px-8 py-6 text-lg border-2 border-orange-300 hover:border-orange-500 hover:bg-orange-50" data-testid="hero-management-login-btn">
                  <Link to="/management/login">Management Login</Link>
                </Button>
              </MagneticButton>
            </div>

            <div className="flex items-center gap-4 mt-10">
              <div className="flex -space-x-3">
                {CANTEENS.map((c) => (
                  <img key={c.canteen_id} src={c.image_url.replace("w=800", "w=120")} alt={c.name} className="w-10 h-10 rounded-full border-2 border-white object-cover shadow" />
                ))}
              </div>
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-800">3 canteens, 1 cart.</span> Mix dishes from Sopanam, MBA and Samudra in a single checkout.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img
                src="https://images.pexels.com/photos/8818732/pexels-photo-8818732.jpeg?auto=compress&cs=tinysrgb&w=1200"
                alt="Delicious Indian thali meal"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute top-4 left-4 flex gap-1">
                <span className="steam" style={{ left: "10%", animationDelay: "0s" }} />
                <span className="steam" style={{ left: "40%", animationDelay: "0.8s" }} />
                <span className="steam" style={{ left: "70%", animationDelay: "1.6s" }} />
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-8 top-10 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-orange-100"
            >
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Order Ready!</p>
                <p className="text-xs text-gray-500">Token #A42</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -right-6 bottom-8 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-orange-100"
            >
              <ChefHat className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm font-bold text-gray-900">Freshly Made</p>
                <p className="text-xs text-gray-500">3 canteens live</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute top-20 left-10 w-24 h-24 bg-orange-300 rounded-full glow-blob float-slow" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-amber-300 rounded-full glow-blob float-slow" style={{ animationDelay: "1.5s" }} />
      </section>

      <Marquee />

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: CANTEENS.length, suffix: "", label: "Campus Canteens" },
            { value: MENU_ITEMS.length, suffix: "+", label: "Dishes on the Menu" },
            { value: 3, suffix: "", label: "Ways to Pay" },
            { value: 0, suffix: "", label: "Queues to Stand In" },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
              <CountUp value={stat.value} suffix={stat.suffix} className="text-4xl font-extrabold gradient-text block" />
              <p className="text-gray-500 mt-1 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Canteens */}
      <section id="canteens" className="py-20 bg-gradient-to-b from-white to-orange-50 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-4">One app · Three kitchens</span>
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Pick Your Canteen</span></h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Browse live menus from every campus canteen and order from any of them — or all three at once.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CANTEENS.map((canteen, i) => (
              <motion.div
                key={canteen.canteen_id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
              >
                <TiltCard className="group h-full rounded-3xl bg-white border border-orange-100 shadow-xl hover:shadow-2xl hover:shadow-orange-500/15 transition-shadow">
                  <Link to={`/student/canteen/${canteen.canteen_id}`} className="block h-full" data-cursor="Order" data-testid={`landing-canteen-${canteen.canteen_id}`}>
                    <div className="relative h-56 overflow-hidden">
                      <img src={canteen.image_url} alt={canteen.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-700 backdrop-blur">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> {canteen.operating_hours}
                      </span>
                      <h3 className="absolute bottom-4 left-5 text-2xl font-extrabold text-white">{canteen.name}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">{canteen.description}</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {CANTEEN_HIGHLIGHTS[canteen.canteen_id].map((dish) => (
                          <span key={dish} className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">{dish}</span>
                        ))}
                      </div>
                      <span className="inline-flex items-center gap-2 font-semibold text-orange-600">
                        View menu & order
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
                      </span>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-dot-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Why Choose Campus Bites?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the future of campus dining</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURES.map((feature, index) => (
              <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.08 }} viewport={{ once: true }}>
                <TiltCard className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-3xl border border-orange-100 shadow-lg hover:shadow-2xl h-full" data-testid={`feature-card-${index}`}>
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-5">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">How It Works</span></h2>
            <p className="text-xl text-gray-600">Four simple steps between class and your next meal</p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-10">
            <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-orange-200 via-amber-300 to-orange-200" />
            {STEPS.map((step, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.12 }} className="relative text-center">
                <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-5">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-orange-400">STEP {i + 1}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu gallery */}
      <section id="menu" className="py-20 bg-gradient-to-b from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">From Our Kitchens</span></h2>
            <p className="text-xl text-gray-600">A taste of what's cooking across campus, today</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {GALLERY.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-2xl overflow-hidden aspect-square shadow-lg"
                data-cursor="View"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-1 group-hover:translate-y-0 transition-transform">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-amber-300">{item.tag}</span>
                  <div className="flex items-end justify-between gap-2">
                    <h3 className="text-white font-bold text-base sm:text-lg leading-tight">{item.title}</h3>
                    <span className="shrink-0 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-orange-700">₹{item.price}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="why" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4"><span className="gradient-text">Made for Campus Life</span></h2>
            <p className="text-xl text-gray-600">The moments Campus Bites was built for</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USE_CASES.map((u, i) => (
              <motion.div key={u.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <TiltCard className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-3xl border border-orange-100 shadow-lg h-full flex flex-col">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 mb-5">
                    {u.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{u.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{u.text}</p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="relative py-24 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Friends sharing a meal together"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/90 via-orange-800/85 to-amber-800/85" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <Users className="w-10 h-10 text-amber-300 mx-auto mb-4" />
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5">Ready to skip the line today?</h2>
            <p className="text-lg text-orange-100 mb-8 max-w-xl mx-auto">Create an account in seconds and order from Sopanam, MBA and Samudra canteens before your next class.</p>
            <MagneticButton>
              <Button size="lg" asChild className="rounded-full px-10 py-6 text-lg bg-white text-orange-700 hover:bg-orange-50 shadow-2xl">
                <Link to="/student/register" data-cursor="Join">Create Free Account <ArrowRight className="w-5 h-5 ml-1" /></Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Utensils className="w-7 h-7 text-orange-500" />
                <span className="text-xl font-bold text-white">Campus Bites</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">AI-powered smart canteen ordering — skip the queue, savor the moment.</p>
              <a href="https://github.com/Radha-Krishna-19/Campus-Bites" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm text-gray-300 hover:bg-orange-600 hover:text-white transition-colors" data-cursor="Code">
                <Github className="w-4 h-4" /> View source on GitHub
              </a>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-300">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-orange-400 transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-orange-400 transition-colors">How it Works</a></li>
                <li><a href="#menu" className="hover:text-orange-400 transition-colors">Menu</a></li>
                <li><a href="#canteens" className="hover:text-orange-400 transition-colors">Canteens</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-300">Portals</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/student/login" className="hover:text-orange-400 transition-colors">Student Login</Link></li>
                <li><Link to="/crew/login" className="hover:text-orange-400 transition-colors">Crew Login</Link></li>
                <li><Link to="/management/login" className="hover:text-orange-400 transition-colors">Management Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4 text-sm uppercase tracking-wide text-gray-300">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> Amrita Vishwa Vidyapeetham</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-orange-500" /> Open daily, 7:00 AM – 10:00 PM</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} Campus Bites. All rights reserved.</p>
            <p className="text-gray-500 text-sm">Built for a hungrier, faster campus.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
