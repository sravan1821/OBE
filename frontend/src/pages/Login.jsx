import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User } from 'lucide-react';
import { useState } from 'react';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState('');

  const onSubmit = (data) => {
    const success = login(data.username, data.password);
    if (success) {
      navigate('/dashboard');
    } else {
      setErrorMsg('Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mic-navy to-slate-900 flex items-center justify-center relative overflow-hidden text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-8"
      >
        <div className="text-center mb-10">
          <h1 className="font-heading text-5xl font-extrabold tracking-tight mb-3">
            MIC <span className="text-mic-red">College</span>
          </h1>
          <p className="text-slate-300 font-medium tracking-widest uppercase text-sm">OBE Marks Portal</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-xl shadow-2xl overflow-hidden text-slate-800 border-t-4 border-mic-red"
        >
          <div className="p-8">
            <h2 className="text-2xl font-bold text-mic-navy mb-6">Portal Login</h2>
            
            {errorMsg && (
              <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} className="bg-red-50 text-mic-red p-3 rounded-md mb-5 text-sm border border-red-200">
                {errorMsg}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={18} />
                  </div>
                  <input 
                    {...register('username', { required: true })}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-mic-blue/50 focus:border-mic-blue transition-all"
                    placeholder="Enter your username"
                  />
                </div>
                {errors.username && <span className="text-mic-red text-xs mt-1 block">Username is required</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock size={18} />
                  </div>
                  <input 
                    type="password"
                    {...register('password', { required: true })}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-mic-blue/50 focus:border-mic-blue transition-all"
                    placeholder="Enter your password"
                  />
                </div>
                {errors.password && <span className="text-mic-red text-xs mt-1 block">Password is required</span>}
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-mic-red hover:bg-mic-red-dark text-white font-bold py-3 rounded-md transition-colors shadow-lg shadow-mic-red/30 mt-4"
              >
                Access Portal
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
