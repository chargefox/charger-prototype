import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, formData }) => {
  if (!isOpen) return null;

  // Helper to summarize form data
  const summarizeFormData = (data) => {
    const summary = [];

    // Station Details
    summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Station Details</h4>);
    summary.push(<p className="text-sm text-gray-700">Visibility: <strong>{data.stationDetails.stationVisibility ? data.stationDetails.stationVisibility.charAt(0).toUpperCase() + data.stationDetails.stationVisibility.slice(1) : 'N/A'}</strong></p>);
    summary.push(<p className="text-sm text-gray-700">Location Name: <strong>{data.stationDetails.locationName || 'N/A'}</strong></p>);
    summary.push(<p className="text-sm text-gray-700">Address: <strong>{data.stationDetails.locationAddress || 'N/A'}</strong></p>);
    summary.push(<p className="text-sm text-gray-700">Coordinates: <strong>{data.stationDetails.latitude || 'N/A'}, {data.stationDetails.longitude || 'N/A'}</strong></p>);
    if (data.stationDetails.directions) {
      summary.push(<p className="text-sm text-gray-700">Directions: <strong>{data.stationDetails.directions}</strong></p>);
    }

    // Stickers and Labels
    summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Stickers & Labels</h4>);
    summary.push(<p className="text-sm text-gray-700">Applied: <strong>{data.stickersLabels.stickersApplied ? (data.stickersLabels.stickersApplied === 'yes' ? 'Yes' : 'No') : 'N/A'}</strong></p>);
    summary.push(<p className="text-sm text-gray-700">Station Number: <strong>{data.stickersLabels.stationNumber || 'N/A'}</strong></p>);

    // Network Communication
    summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Network Communication</h4>);
    const connTypeLabel = data.networkCommunication.connectionType ?
      (data.networkCommunication.connectionType === 'sim_card_chargefox' ? 'SIM card provided by Chargefox' :
       data.networkCommunication.connectionType === 'i_have_my_own_sim_card' ? 'I have my own SIM card' :
       'Ethernet / Wi-Fi') : 'N/A';
    summary.push(<p className="text-sm text-gray-700">Connection Type: <strong>{connTypeLabel}</strong></p>);
    if (data.networkCommunication.connectionType === 'sim_card_chargefox') {
      summary.push(<p className="text-sm text-gray-700">SIM ICCID: <strong>{data.networkCommunication.simCardICCID || 'N/A'}</strong></p>);
    } else if (data.networkCommunication.provider) {
      summary.push(<p className="text-sm text-gray-700">Provider: <strong>{data.networkCommunication.provider}</strong></p>);
    }

    // Pricing
    summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Pricing</h4>);
    summary.push(<p className="text-sm text-gray-700">Base Price per kWh: <strong>{data.pricing.basePricePerKwh ? `$${data.pricing.basePricePerKwh}` : 'Free'}</strong></p>);
    if (data.pricing.addFreePeriod) {
      summary.push(<p className="text-sm text-gray-700">Free Period: <strong>{data.pricing.freeMinutes || 'N/A'} minutes</strong></p>);
    }
    if (data.pricing.addPeakPricing) {
      summary.push(<p className="text-sm text-gray-700">Peak Pricing: <strong>${data.pricing.peakPricePerKwh || 'N/A'}</strong> ({data.pricing.peakStartTime || 'N/A'} - {data.pricing.peakEndTime || 'N/A'})</p>);
    }

    // Connect to Chargefox
    summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Chargefox Connection</h4>);
    summary.push(<p className="text-sm text-gray-700">OCPP ID: <strong>{data.connectToChargefox.ocppId || 'N/A'}</strong></p>);
    summary.push(<p className="text-sm text-gray-700">Connection Status: <strong>{data.connectToChargefox.connected ? 'Connected' : 'Not Connected'}</strong></p>);

    // Hardware Details (if connected)
    if (data.connectToChargefox.connected) {
      summary.push(<h4 className="font-bold text-gray-800 mt-4 mb-2">Hardware Details</h4>);
      summary.push(<p className="text-sm text-gray-700">Make: <strong>{data.hardwareDetails.make || 'N/A'}</strong></p>);
      summary.push(<p className="text-sm text-gray-700">Model: <strong>{data.hardwareDetails.model || 'N/A'}</strong></p>);
      summary.push(<p className="text-sm text-gray-700">Power: <strong>{data.hardwareDetails.powerRating || 'N/A'} kW</strong></p>);
      summary.push(<p className="text-sm text-gray-700">Using LMS: <strong>{data.hardwareDetails.usingLMS ? 'Yes' : 'No'}</strong></p>);
      
      data.hardwareDetails.connectors.forEach((connector, index) => {
        summary.push(<h5 className="font-bold text-gray-800 mt-3 mb-1">Connector {index + 1}</h5>);
        summary.push(<p className="text-sm text-gray-700">Port Name: <strong>{connector.portName || 'N/A'}</strong></p>);
        summary.push(<p className="text-sm text-gray-700">Plug Type: <strong>{connector.plugType || 'N/A'}</strong></p>);
        summary.push(<p className="text-sm text-gray-700">Drivers Bring Cable: <strong>{connector.driversBringCable ? 'Yes' : 'No'}</strong></p>);
      });
    }

    return summary;
  };

  const summaryContent = summarizeFormData(formData);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full m-4">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Review Station Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          If you need help with your submission, please email <a href="mailto:support@chargefox.com" className="text-blue-600 hover:underline">support@chargefox.com</a>.
        </p>
        <div className="max-h-96 overflow-y-auto mb-4 p-2 border border-gray-200 rounded">
          {summaryContent.map((item, index) => (
            <React.Fragment key={index}>{item}</React.Fragment>
          ))}
        </div>
        

        <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 mb-4" role="alert">
          <p className="font-bold">Important information:</p>
          <ul className="list-disc list-inside text-sm mt-2">
            <li>Once submitted, you cannot edit your station while it is in review.</li>
            <li>Station reviews typically take 1-3 business days.</li>
          </ul>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-md font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 