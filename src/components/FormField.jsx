// import React from 'react';
// import { HelpCircle } from 'lucide-react';

// const FormField = ({ label, type, placeholder, required, value, onChange, options = [], className = '', helpText, maxLength, checked, disabled, optionText }) => {
//   const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
//   const labelClasses = "block text-sm font-medium text-gray-700";

//   return (
//     <div className={`mb-4 ${className}`}>
//       {type !== 'checkbox' && (
//         <label className={labelClasses}>
//           {label} {required && <span className="text-red-500">*</span>}
//           {helpText && (
//             <span className="ml-1 text-gray-400 cursor-help" title={helpText}>
//               <HelpCircle size={16} className="inline-block align-text-bottom" />
//             </span>
//           )}
//         </label>
//       )}
//       {type === 'select' ? (
//         <select value={value} onChange={onChange} className={inputClasses} disabled={disabled}>
//           <option value="">{placeholder}</option>
//           {options.map((option) => (
//             <option key={option.value} value={option.value}>
//               {option.label}
//             </option>
//           ))}
//         </select>
//       ) : type === 'radio' ? (
//         <div className="mt-2 space-y-2">
//           {options.map((option) => (
//             <div key={option.value} className="flex items-center">
//               <input
//                 id={option.value}
//                 name={label}
//                 type="radio"
//                 value={option.value}
//                 checked={value === option.value}
//                 onChange={onChange}
//                 className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
//                 disabled={disabled}
//               />
//               <label htmlFor={option.value} className="ml-2 block text-sm text-gray-900">
//                 {option.label}
//               </label>
//             </div>
//           ))}
//         </div>
//       ) : type === 'textarea' ? (
//         <textarea
//           placeholder={placeholder}
//           value={value}
//           onChange={onChange}
//           className={`${inputClasses} h-24 resize-y`}
//           required={required}
//           maxLength={maxLength}
//           disabled={disabled}
//         ></textarea>
//       ) : type === 'checkbox' ? (
//         <div className="flex items-center mt-2">
//           <input
//             id={label.replace(/\s/g, '_').toLowerCase()}
//             type="checkbox"
//             checked={checked}
//             onChange={onChange}
//             className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
//             disabled={disabled}
//           />
//           <label htmlFor={label.replace(/\s/g, '_').toLowerCase()} className="ml-2 block text-sm text-gray-900">
//             {optionText || label}
//           </label>
//         </div>
//       ) : (
//         <input
//           type={type}
//           placeholder={placeholder}
//           value={value}
//           onChange={onChange}
//           className={inputClasses}
//           required={required}
//           maxLength={maxLength}
//           disabled={disabled}
//         />
//       )}
//       {maxLength && type === 'textarea' && (
//         <p className="text-right text-xs text-gray-500 mt-1">
//           {value ? value.length : 0}/{maxLength}
//         </p>
//       )}
//     </div>
//   );
// };

// export default FormField; 

import React from 'react';
import { HelpCircle } from 'lucide-react'; // Keep if you still want to use it elsewhere or for future features

const FormField = ({ label, type, placeholder, required, value, onChange, options = [], className = '', helpText, maxLength, checked, disabled, optionText }) => {
  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const helpTextClasses = "mt-2 text-xs text-gray-500"; // New class for help text

  return (
    <div className={`mb-4 ${className}`}>
      {type !== 'checkbox' && (
        <label className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Render input field based on type */}
      {type === 'select' ? (
        <select value={value} onChange={onChange} className={inputClasses} disabled={disabled}>
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'radio' ? (
        <div className="mt-2 space-y-2">
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <input
                id={option.value}
                name={label}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                disabled={disabled}
              />
              <label htmlFor={option.value} className="ml-2 block text-sm text-gray-900">
                {option.label}
              </label>
            </div>
          ))}
        </div>
      ) : type === 'textarea' ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={`${inputClasses} h-24 resize-y`}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
        ></textarea>
      ) : type === 'checkbox' ? (
        <div className="flex items-center mt-2">
          <input
            id={label.replace(/\s/g, '_').toLowerCase()}
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            disabled={disabled}
          />
          <label htmlFor={label.replace(/\s/g, '_').toLowerCase()} className="ml-2 block text-sm text-gray-900">
            {optionText || label}
          </label>
        </div>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={inputClasses}
          required={required}
          maxLength={maxLength}
          disabled={disabled}
        />
      )}

      {/* Display help text below the field if provided */}
      {helpText && (
        <p className={helpTextClasses}>
          {helpText}
        </p>
      )}

      {/* Display character count for textarea */}
      {maxLength && type === 'textarea' && (
        <p className="text-right text-xs text-gray-500 mt-1">
          {value ? value.length : 0}/{maxLength}
        </p>
      )}
    </div>
  );
};

export default FormField;
