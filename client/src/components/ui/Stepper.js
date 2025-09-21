import React from 'react';

const Stepper = ({ steps = [], current = 0 }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto py-2" aria-label="Progress">
      {steps.map((label, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div className={`flex items-center gap-2`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{idx + 1}</div>
              <div className={`text-sm ${active ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>{label}</div>
            </div>
            {idx < steps.length - 1 && <div className={`w-10 h-0.5 ${done ? 'bg-green-500' : 'bg-gray-300'}`} />}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;


