'use client';

import { Plug, Zap } from 'lucide-react';

export default function PluginsPage() {
  const upcomingPlugins = [
    {
      name: 'Solana Plugin',
      description: 'Accept USDC, SOL, and other SPL tokens on Solana blockchain',
      status: 'Coming Soon',
      icon: '⚡',
    },
    {
      name: 'Bitcoin Plugin',
      description: 'Accept Bitcoin payments with Lightning Network support',
      status: 'Planned',
      icon: '₿',
    },
    {
      name: 'Ethereum Plugin',
      description: 'Accept ETH, USDC, USDT on Ethereum and Layer 2s',
      status: 'Planned',
      icon: 'Ξ',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Plugins</h1>
        <p className="text-gray-600">Extend SUZAA with blockchain payment plugins</p>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Plug className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">How Plugins Work</h3>
            <p className="text-sm text-blue-800">
              Plugins run as separate microservices and monitor blockchains for payments. 
              When a payment is detected, they automatically update the order status in SUZAA Core.
            </p>
          </div>
        </div>
      </div>

      {/* Plugins Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingPlugins.map((plugin) => (
          <div key={plugin.name} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mb-4">
              {plugin.icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{plugin.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{plugin.description}</p>
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
              {plugin.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
