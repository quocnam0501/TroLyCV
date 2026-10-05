import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FileText, Upload, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/lib/AuthContext';
import { getMasterCV } from '@/utils/cvStorage';

export default function CVStart() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const [hasCV, setHasCV] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      setHasCV(Boolean(getMasterCV()));
    }
  }, [isAuthenticated, isLoadingAuth]);

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin" aria-label="Loading" /></div>;
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (hasCV) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-indigo-600 mb-2">CV onboarding</p>
          <h1 className="text-3xl font-bold text-slate-900">How do you want to start?</h1>
          <p className="text-slate-500 mt-2">Choose the quickest way to get your CV ready for analysis.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center mb-5"><FileText className="w-5 h-5 text-indigo-600" /></div>
            <h2 className="text-xl font-bold text-slate-900">Create a new CV</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 flex-1">Build your CV directly on trolyCV step by step.</p>
            <button onClick={() => navigate('/cv-builder?mode=create')} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white px-4 py-3 text-sm font-semibold hover:bg-indigo-700">Create CV <ArrowRight className="w-4 h-4" /></button>
          </section>
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center mb-5"><Upload className="w-5 h-5 text-violet-600" /></div>
            <h2 className="text-xl font-bold text-slate-900">Already have a CV?</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6 flex-1">Upload your existing CV and use it for CV-JD analysis.</p>
            <button onClick={() => navigate('/cv-builder?mode=upload')} className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 text-indigo-700 px-4 py-3 text-sm font-semibold hover:bg-indigo-50">Upload CV <ArrowRight className="w-4 h-4" /></button>
          </section>
        </div>
      </main>
    </div>
  );
}

export function CVStartLink() {
  return null;
}

CVStart.displayName = 'CVStart';
CVStart.propTypes = {};
CVStart.defaultProps = {};
CVStart.__doc = 'Choose whether to create a CV or upload an existing CV.';
