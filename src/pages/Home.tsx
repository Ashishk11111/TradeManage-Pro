
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
      }
      setChecking(false);
    };
    checkAuth();
  }, []);

  if (checking) return <p className="text-center mt-10 text-gray-600">Loading...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-blue-50 text-gray-800 font-inter">
      {/* Header */}
      <header className="sticky top-0 bg-white bg-opacity-90 backdrop-blur shadow-md z-50 px-6 py-4 flex justify-between items-center animate-fadeInDown">
        <h1 className="text-3xl font-extrabold text-blue-700 tracking-wide hover:text-blue-800 transition">
          Client Inventory Hub
        </h1>
        <nav className="space-x-4 hidden sm:block text-lg">
          {!user ? (
            <>
              <Link to="/login" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Login
              </Link>
              <Link to="/register" className="text-gray-600 hover:text-blue-600 transition font-medium">
                Register
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 font-medium">
              Dashboard
            </Link>
          )}
        </nav>
      </header>

      {/* Hero */}
      <motion.section
        className="px-6 py-20 text-center bg-gradient-to-br from-blue-100 to-blue-50"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4 text-gray-800">
          Empower Your Business with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
            Effortless Inventory Management
          </span>
        </h2>
        <p className="max-w-xl mx-auto text-gray-700 text-lg mb-8">
          Manage your clients, inventory, and team in one centralized platform.
          Simple, fast, and secure — built for modern businesses.
        </p>
        {!user ? (
          <div className="flex justify-center space-x-4">
            <Link
              to="/register"
              className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-lg text-lg shadow hover:scale-105 transform transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-lg shadow hover:bg-blue-50 transition hover:scale-105"
            >
              Login
            </Link>
          </div>
        ) : (
          <Link
            to="/dashboard"
            className="bg-gradient-to-r from-green-500 to-green-700 text-white px-8 py-3 rounded-lg text-lg shadow hover:scale-105 transform transition"
          >
            Explore Dashboard
          </Link>
        )}
      </motion.section>

      {/* Banner Image */}
      <motion.section
        className="relative text-center py-20"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="relative max-w-5xl mx-auto px-4">
          <img
            src="/business.jpg"
            alt="Business dashboard"
            className="w-full h-auto rounded-2xl shadow-xl object-cover brightness-90 hover:brightness-100 transition"
          />
          <div className="absolute inset-0 bg-blue-600 bg-opacity-30 rounded-2xl backdrop-blur-sm"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 drop-shadow">
              Smart, Simple, Scalable.
            </h1>
            <p className="text-lg sm:text-xl text-white mb-6 max-w-lg">
              Run your business operations more efficiently than ever before.
            </p>
            <Link
              to="/register"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg text-lg shadow hover:bg-blue-100 transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Demo Video */}
      <motion.section
        className="px-6 py-20 text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold mb-6 text-blue-700">Watch How It Works</h3>
        <div className="max-w-3xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            width="100%"
            height="100%"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="px-6 py-20 bg-gradient-to-r from-gray-100 to-blue-50"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800">Why Choose Us?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              title: 'Real-time Inventory Tracking',
              desc: 'Monitor stock levels, receive low stock alerts, and make informed decisions.',
            },
            {
              title: 'Client Management',
              desc: 'Store client information securely and access it anytime, anywhere.',
            },
            {
              title: 'Secure and Scalable',
              desc: 'Your data is safe with industry-grade security and cloud scalability.',
            },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transition duration-300"
              whileHover={{ scale: 1.03 }}
            >
              <h4 className="text-xl font-semibold mb-2 text-blue-700">{feature.title}</h4>
              <p className="text-gray-700">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Testimonials */}
      <motion.section
        className="px-6 py-20 text-center bg-white"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold mb-12 text-gray-800">What Our Clients Say</h3>
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {[
            {
              name: 'Aman Sharma',
              company: 'Sharma Textiles',
              feedback: 'This tool helped us manage clients and track orders like never before. Highly recommended!',
            },
            {
              name: 'Neha Verma',
              company: 'FinMart Solutions',
              feedback: 'A user-friendly platform with powerful features. The onboarding was smooth and simple.',
            },
            {
              name: 'Rahul Mehta',
              company: 'TechNova Pvt Ltd',
              feedback: 'We saved hours each week thanks to automated inventory alerts and analytics.',
            },
          ].map((client, idx) => (
            <motion.div
              key={idx}
              className="bg-blue-50 p-6 rounded-lg shadow hover:shadow-xl transition"
              whileHover={{ scale: 1.03 }}
            >
              <p className="text-gray-700 italic mb-4">"{client.feedback}"</p>
              <h5 className="text-blue-700 font-semibold">{client.name}</h5>
              <p className="text-sm text-gray-600">{client.company}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Newsletter */}
      <motion.section
        className="px-6 py-20 bg-gradient-to-br from-blue-100 to-white text-center"
        variants={fadeIn}
        initial="hidden"
        whileInView="visible"
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <h3 className="text-3xl font-bold mb-4 text-blue-700">Stay Updated</h3>
        <p className="text-gray-700 mb-6">Join our newsletter to get the latest product updates and business tips.</p>
        <form className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full sm:w-auto flex-1 px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-blue-600 to-green-500 text-white px-6 py-3 rounded-md shadow hover:scale-105 transition"
          >
            Subscribe
          </button>
        </form>
      </motion.section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500 border-t bg-white">
        © {new Date().getFullYear()} Client Inventory Hub · Made with ❤️ for modern businesses
      </footer>
    </div>
  );
};

export default Home;
