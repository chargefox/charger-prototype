import React from 'react';
import { ChevronDown, CheckCircle2, Circle, Lock } from 'lucide-react';

const Accordion = ({ 
  title, 
  description, 
  children, 
  isCompleted, 
  isDependent, 
  isDisabled, 
  statusIcon,
  onToggle, 
  isOpen 
}) => {
  const IconComponent = statusIcon || Circle;

  return (
    <div className={`mb-4 rounded-lg shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isDisabled ? 'bg-gray-100 text-gray-400' : 'bg-white'}`}>
      <button
        className={`flex justify-between items-center w-full p-6 text-lg font-semibold text-left ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} ${isOpen ? 'border-b border-gray-200' : ''}`}
        onClick={onToggle}
        disabled={isDisabled}
      >
        <div className="flex items-center">
          <span className={`mr-4 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`}>
            <IconComponent size={24} className={isDisabled ? 'text-gray-400' : ''} />
          </span>
          <div>
            {title}
            <p className="text-sm font-normal text-gray-500 mt-1">{description}</p>
          </div>
        </div>
        <ChevronDown className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} size={20} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-6 pt-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accordion; 