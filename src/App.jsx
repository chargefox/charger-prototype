import React, { useState } from 'react';
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react';
import SidePanel from './components/SidePanel';


// =============================================================================
// 1. App.jsx (Main Application Entry)
//    - Renders the main page layout with the "Add New Charge Station" button.
//    - Manages the state for the side panel's visibility.
//    - Manages the state for the submitted station data to display on the main page.
// =============================================================================

// --- Global Font Styles (In a real project, this would be in a CSS file or index.html) ---
const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400&family=Poppins:wght@400;600&display=swap');

  body {
    font-family: 'Poppins', sans-serif; /* Default for text */
    font-weight: 400; /* Regular font weight */
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Poppins', sans-serif;
    font-weight: 600; /* Semi-bold for headers */
  }

  /* Override specific elements that might have default font-weight */
  .text-lg.font-semibold { /* Accordion titles */
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
  }

  .text-sm.font-normal { /* Accordion descriptions */
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 400;
  }

  .text-sm.font-medium { /* Form field labels */
    font-family: 'Poppins', sans-serif;
    font-weight: 500; /* Medium weight for labels */
  }

  .font-bold { /* Specific bold elements like alert messages */
    font-family: 'Poppins', sans-serif; /* Use Poppins for bold emphasis */
    font-weight: 600;
  }

  /* Ensure input fields also use IBM Plex Sans regular */
  input, select, textarea {
    font-family: 'Poppins', sans-serif; /* Changed to Poppins as per general body */
    font-weight: 400;
  }
`;

// Inject font styles into the document head (runs once when script loads)
if (typeof document !== 'undefined' && document.head) {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = fontStyles;
  document.head.appendChild(styleSheet);
}

function App() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [submittedStation, setSubmittedStation] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [isFormSubmittable, setIsFormSubmittable] = useState(false);

  const handleSave = (formData) => {
    // In a real application, you would save the form data to a backend
    console.log('Saving form data:', formData);
  };

  const handleSubmit = (formData) => {
    // In a real application, you would submit the form data to a backend
    console.log('Submitting form data:', formData);
    setSubmittedStation(formData);
    setIsSidePanelOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="bg-orange-500 rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="text-lg font-bold text-gray-900 tracking-tight">CHARGEFOX</span>
              </div>
              <nav className="hidden md:flex space-x-6 ml-8">
                <a href="#" className="text-gray-700 font-medium hover:text-blue-600">Dashboard</a>
                <a href="#" className="text-gray-700 font-medium hover:text-blue-600">Usage Report</a>
                <a href="#" className="text-gray-700 font-medium hover:text-blue-600">Insights</a>
                <a href="#" className="text-gray-700 font-medium hover:text-blue-600">Network</a>
                <a href="#" className="text-gray-700 font-medium hover:text-blue-600">Fleet</a>
              </nav>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#" className="text-gray-500 hover:text-blue-600">Help</a>
              <a href="#" className="text-gray-500 hover:text-blue-600">Account</a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-2xl shadow p-8 relative">
          {/* Top-right action buttons */}
          <div className="absolute right-8 top-8 flex space-x-3">
            <button
              className={`px-5 py-2 rounded-md font-semibold border transition-colors duration-200
                ${isFormSubmittable
                  ? 'text-gray-700 border-gray-300 bg-white hover:bg-gray-100'
                  : 'text-gray-400 border-gray-200 bg-gray-100 cursor-not-allowed'}
              `}
              disabled={!isFormSubmittable}
              title={!isFormSubmittable ? 'Complete all required fields to enable' : ''}
            >
              Submit for review
            </button>
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="px-5 py-2 rounded-md font-semibold text-white bg-blue-900 hover:bg-blue-950 transition-colors duration-200"
            >
              Add station details
            </button>
          </div>
          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New charge station</h1>
          {/* Tabs */}
          <div className="flex space-x-8 border-b border-blue-100 mb-8 mt-8">
            <button
              className={`pb-2 text-base font-medium focus:outline-none ${activeTab === 'details' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('details')}
            >
              Details
            </button>
            <button
              className={`pb-2 text-base font-medium focus:outline-none ${activeTab === 'availability' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('availability')}
            >
              Availability
            </button>
          </div>
          {/* Card Content */}
          {activeTab === 'details' && (
            <div className="flex flex-col items-center justify-center py-8">
              <h2 className="text-2xl font-bold text-grey-700 mb-2 text-center">Set up your station</h2>
              <p className="text-base text-grey-700 mb-6 text-center">Get your station ready so that drivers can start charging</p>
              <button
                onClick={() => setIsSidePanelOpen(true)}
                className="mb-8 px-6 py-3 rounded-md font-semibold text-white bg-blue-900 hover:bg-blue-950 transition-colors duration-200 text-lg"
              >
                Add station details
              </button>
              <div className="bg-slate-100 rounded-md flex items-center justify-center w-full h-80 mx-auto">
                <span className="text-xl font-semibold text-gray-600">Charge station</span>
              </div>
            </div>
          )}
          {activeTab === 'availability' && (
            <div className="flex flex-col items-center justify-center py-16">
              <span className="text-gray-500">Availability tab content goes here.</span>
            </div>
          )}
        </div>
      </main>

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onSave={handleSave}
        onSubmit={handleSubmit}
        setIsFormSubmittable={setIsFormSubmittable}
      />
    </div>
  );
}

export default App;
