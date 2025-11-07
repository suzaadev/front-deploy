'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen gradient-mesh">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto">
              <span className="text-4xl">⚡</span>
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Accept Payments,
            <br />
            <span className="bg-gradient-to-r from-primary to-teal bg-clip-text text-transparent">
              Simplified
            </span>
          </h1>
          <p className="text-xl text-muted mb-8 max-w-2xl mx-auto">
            Open-source payment gateway with modular blockchain plugins.
            Start with cash, scale with crypto.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/demo')}
              className="btn-primary text-lg px-8 py-4 flex items-center gap-2"
            >
              Try Demo
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.open('https://github.com/suzaaglobal/first', '_blank')}
              className="btn-secondary text-lg px-8 py-4"
            >
              View on GitHub
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg mb-2">Secure by Design</h3>
            <p className="text-muted text-sm">
              Open-source core with auditable security and passwordless authentication
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-teal/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-teal" />
            </div>
            <h3 className="font-bold text-lg mb-2">Start Instantly</h3>
            <p className="text-muted text-sm">
              Works with cash payments immediately. Add crypto plugins when ready
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-bold text-lg mb-2">Platform Agnostic</h3>
            <p className="text-muted text-sm">
              Colocated microservices. Deploy anywhere, scale independently
            </p>
          </div>
        </div>

        {/* Demo Merchant */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted mb-4">Try a demo payment:</p>
          <button
            onClick={() => router.push('/jumasm')}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <span className="font-mono">jumasm</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
