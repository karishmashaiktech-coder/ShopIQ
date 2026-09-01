import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Database, Copy, Check, X, ShieldCheck, Terminal, ExternalLink } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../../data/supabaseSchema';

interface SqlSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqlSchemaModal: React.FC<SqlSchemaModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-3xl bg-[#12141F] border border-purple-500/20 rounded-2xl p-6 shadow-2xl z-10 max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Supabase & PostgreSQL Schema
                  <span className="text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> RLS Enabled
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Production table definitions, relationships & shop isolation policies.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Info bar */}
          <div className="grid grid-cols-3 gap-3 my-4">
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-400 block">Tables Included</span>
              <span className="text-sm font-semibold text-white font-mono">8 Core Tables</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-400 block">Security Model</span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">Row Level Security</span>
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
              <span className="text-xs text-slate-400 block">Data Isolation</span>
              <span className="text-sm font-semibold text-purple-400 font-mono">Multi-Tenant (Shop ID)</span>
            </div>
          </div>

          {/* SQL Code Block */}
          <div className="relative flex-1 min-h-[320px] bg-[#090A0F] border border-white/10 rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-purple-400" /> schema.sql
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-medium text-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy SQL Script'}
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre selection:bg-purple-500/40">
              {SUPABASE_SQL_SCHEMA}
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10 text-xs text-slate-400">
            <span>Run this script inside your Supabase project's SQL Editor.</span>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
              >
                Close
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied to Clipboard' : 'Copy Full Schema'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
