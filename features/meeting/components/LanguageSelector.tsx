
import React from 'react';
import { ChevronDown, Languages } from 'lucide-react';

interface LanguageSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const LANGUAGES = [
  'English', 'Spanish', 'Portuguese', 'French', 'German', 'Chinese', 'Japanese', 'Hindi'
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="relative group">
      <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all">
        <Languages size={18} className="text-blue-500" />
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Target Language</span>
          <span className="text-sm font-semibold">{value}</span>
        </div>
        <ChevronDown size={16} className="text-gray-600 group-hover:text-blue-500" />
      </div>
      
      <div className="absolute top-full mt-2 right-0 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
        {LANGUAGES.map(lang => (
          <button
            key={lang}
            onClick={() => onChange(lang)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-blue-600 transition-all ${value === lang ? 'text-blue-400 bg-blue-500/5' : 'text-gray-400'}`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};
