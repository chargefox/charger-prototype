import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle2, AlertCircle, HelpCircle, Info, XCircle, ChevronDown, Circle, Lock } from 'lucide-react';
import Accordion from './Accordion';
import FormField from './FormField';
import ConfirmationModal from './ConfirmationModal';

const SidePanel = ({ isOpen, onClose, onSave, onSubmit, setIsFormSubmittable }) => {
  const [formData, setFormData] = useState({
    stationDetails: {
      stationVisibility: '',
      locationName: '',
      locationAddress: '',
      latitude: '',
      longitude: '',
      directions: ''
    },
    stickersLabels: {
      stickersApplied: '',
      stationNumber: ''
    },
    networkCommunication: {
      connectionType: '',
      simCardICCID: '',
      provider: ''
    },
    pricing: {
      basePricePerKwh: '',
      addFreePeriod: false,
      freeMinutes: '',
      addPeakPricing: false,
      peakPricePerKwh: '',
      peakStartTime: '',
      peakEndTime: ''
    },
    connectToChargefox: {
      ocppId: '',
      connected: false,
      status: 'idle',
      message: ''
    },
    hardwareDetails: {
      make: '',
      model: '',
      powerRating: '',
      usingLMS: false,
      connectors: [
        {
          portName: '',
          plugType: '',
          driversBringCable: false
        },
        {
          portName: '',
          plugType: '',
          driversBringCable: false
        }
      ]
    }
  });

  const [sectionStatus, setSectionStatus] = useState({
    visibilityLocation: { completed: false, requiredFields: ['stationVisibility', 'locationName', 'locationAddress', 'latitude', 'longitude'] },
    stickersLabels: { completed: false, requiredFields: ['stickersApplied', 'stationNumber'] },
    networkCommunication: { completed: false, requiredFields: ['connectionType'] },
    pricing: { completed: false, requiredFields: ['basePricePerKwh'] },
    connectToChargefox: { completed: false, requiredFields: ['ocppId'] },
    hardwareDetails: { completed: false, requiredFields: ['make', 'model', 'powerRating', 'connectors'] }
  });

  const [openAccordion, setOpenAccordion] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const checkSectionCompletion = useCallback((sectionKey, data) => {
    const section = sectionStatus[sectionKey];
    if (!section) return false;

    if (section.dependsOn) {
      const dependentSectionKey = section.dependsOn;
      if (!sectionStatus[dependentSectionKey] || !sectionStatus[dependentSectionKey].completed) {
        return false;
      }
    }

    if (sectionKey === 'connectToChargefox') {
      return data.connectToChargefox.status === 'success';
    }

    if (sectionKey === 'networkCommunication') {
      if (!data.networkCommunication.connectionType) return false;

      if (data.networkCommunication.connectionType === 'sim_card_chargefox') {
        return data.networkCommunication.simCardICCID.trim() !== '';
      }
      return true;
    }

    if (sectionKey === 'pricing') {
      if (data.pricing.basePricePerKwh.trim() === '') return false;

      if (data.pricing.addFreePeriod && data.pricing.freeMinutes.trim() === '') return false;

      if (data.pricing.addPeakPricing && (
        data.pricing.peakStartTime.trim() === '' ||
        data.pricing.peakEndTime.trim() === '' ||
        data.pricing.peakPricePerKwh.trim() === ''
      )) return false;

      return true;
    }

    if (sectionKey === 'hardwareDetails') {
      if (!data.connectToChargefox.connected) {
        return true;
      }

      if (data.hardwareDetails.make.trim() === '' ||
        data.hardwareDetails.model.trim() === '' ||
        data.hardwareDetails.powerRating.trim() === '') {
        return false;
      }

      for (const connector of data.hardwareDetails.connectors) {
        if (connector.portName.trim() === '' || connector.plugType.trim() === '') {
          return false;
        }
      }
      return true;
    }

    for (const field of section.requiredFields) {
      let fieldValue;
      if (sectionKey === 'visibilityLocation') {
        fieldValue = data.stationDetails[field];
      } else if (sectionKey === 'stickersLabels') {
        fieldValue = data.stickersLabels[field];
      } else {
        fieldValue = data[Object.keys(data).find(k => k.startsWith(sectionKey.split(/(?=[A-Z])/).join('').toLowerCase()))]?.[field];
        if (typeof fieldValue === 'undefined') {
          fieldValue = data[sectionKey]?.[field];
        }
      }

      if (typeof fieldValue === 'string' && fieldValue.trim() === '') {
        return false;
      }
      if (fieldValue === null || typeof fieldValue === 'undefined') {
        return false;
      }
    }
    return true;
  }, [sectionStatus]);

  useEffect(() => {
    setSectionStatus(prevStatus => {
      const newStatus = { ...prevStatus };
      for (const key in newStatus) {
        const isCompleted = checkSectionCompletion(key, formData);
        newStatus[key] = { ...newStatus[key], completed: isCompleted };
      }
      return newStatus;
    });
  }, [formData, checkSectionCompletion]);

  // Notify parent about form submittable state
  useEffect(() => {
    if (setIsFormSubmittable) {
      const isFormSubmittable = Object.values(sectionStatus).every(s => s.completed);
      setIsFormSubmittable(isFormSubmittable);
    }
  }, [sectionStatus, setIsFormSubmittable]);

  const handleChange = (section, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [section]: {
        ...prevData[section],
        [field]: value,
      },
    }));

    if (section === 'connectToChargefox' && field === 'ocppId') {
      setFormData(prevData => ({
        ...prevData,
        connectToChargefox: { ...prevData.connectToChargefox, status: 'idle', message: '', connected: false }
      }));
    }

    if (section === 'networkCommunication' && field === 'connectionType' && value !== 'sim_card_chargefox') {
      setFormData(prevData => ({
        ...prevData,
        networkCommunication: { ...prevData.networkCommunication, simCardICCID: '' }
      }));
    }
  };

  const handleConnectorChange = (index, field, value) => {
    setFormData(prevData => {
      const newConnectors = [...prevData.hardwareDetails.connectors];
      newConnectors[index] = { ...newConnectors[index], [field]: value };
      return {
        ...prevData,
        hardwareDetails: {
          ...prevData.hardwareDetails,
          connectors: newConnectors
        }
      };
    });
  };

  const handleConnectChargefox = () => {
    const ocppId = formData.connectToChargefox.ocppId.trim();

    if (ocppId === '') {
      setFormData(prevData => ({
        ...prevData,
        connectToChargefox: { ...prevData.connectToChargefox, status: 'error', message: 'OCPP ID cannot be empty.' }
      }));
      return;
    }

    setFormData(prevData => ({
      ...prevData,
      connectToChargefox: { ...prevData.connectToChargefox, status: 'loading', message: 'Connection in progress. This may take up to 10 minutes. You can close this page and revisit it later.' }
    }));

    setTimeout(() => {
      if (ocppId === 'chargefox') {
        setFormData(prevData => ({
          ...prevData,
          connectToChargefox: { ...prevData.connectToChargefox, status: 'success', message: 'Station successfully connected to Chargefox. You can now configure your hardware details.', connected: true }
        }));
        setFormData(prevData => ({
          ...prevData,
          hardwareDetails: {
            ...prevData.hardwareDetails,
            make: 'Fimer',
            model: 'Electra DC / QCK-DC-AC',
          }
        }));
      } else if (ocppId === 'invalid-id') {
        setFormData(prevData => ({
          ...prevData,
          connectToChargefox: { ...prevData.connectToChargefox, status: 'error', message: 'Connection unsuccessful. Please check the chargebox identity for typos and try again.', connected: false }
        }));
      } else {
        setFormData(prevData => ({
          ...prevData,
          connectToChargefox: { ...prevData.connectToChargefox, status: 'error', message: 'Connection failed. Please try again later.', connected: false }
        }));
      }
    }, 4000);
  };

  const handlePreSubmit = () => {
    if (Object.values(sectionStatus).every(s => s.completed)) {
      setShowConfirmModal(true);
    } else {
      alert("Please complete all required sections before submitting.");
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    onSubmit(formData);
  };

  const isFormSubmittable = Object.values(sectionStatus).every(s => s.completed);

  if (!isOpen) return null;

  const connectStatus = formData.connectToChargefox.status;
  const connectMessage = formData.connectToChargefox.message;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-end z-50">
      <div className="relative w-full max-w-3xl bg-white shadow-xl flex flex-col h-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Station details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 text-gray-600 text-sm border-b border-gray-200">
          Fill in the details below to set up your charging station. You can save and return
          to this form at any time before submitting to Chargefox for final review.
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Accordion
            title="Visibility and location"
            description="Enter the station's visibility type and location details."
            isOpen={openAccordion === 'visibilityLocation'}
            onToggle={() => setOpenAccordion(openAccordion === 'visibilityLocation' ? null : 'visibilityLocation')}
            isCompleted={sectionStatus.visibilityLocation.completed}
            statusIcon={sectionStatus.visibilityLocation.completed ? CheckCircle2 : Circle}
          >
            <FormField
              label="Station visibility"
              type="radio"
              required
              value={formData.stationDetails.stationVisibility}
              onChange={(e) => handleChange('stationDetails', 'stationVisibility', e.target.value)}
              options={[
                { value: 'public', label: 'Public' },
                { value: 'private', label: 'Private' },
              ]}
            />
            <FormField
              label="Location name"
              type="text"
              required
              value={formData.stationDetails.locationName}
              onChange={(e) => handleChange('stationDetails', 'locationName', e.target.value)}
              placeholder="e.g., Melbourne Office Carpark 2"
              helpText="For public stations, this name will be displayed to drivers in the app."
            />
            <FormField
              label="Location address"
              type="text"
              required
              value={formData.stationDetails.locationAddress}
              onChange={(e) => handleChange('stationDetails', 'locationAddress', e.target.value)}
              placeholder="Enter location address"
            />
            <p className="text-sm text-gray-600 mb-2 mt-6">
              Drag the map pin to the precise position of the station to automatically update the coordinates.
            </p>
            <div className="bg-gray-200 h-56 w-full rounded-md flex items-center justify-center text-gray-500 mb-4">
              <img
                src="https://www.readytechgo.com.au/wp-content/uploads/2018/11/Using-Google-Maps-to-Get-Around.png"
                alt="Placeholder map of Melbourne"
                className="w-full h-full object-cover rounded-md"
                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/400x192/ADD8E6/000000?text=Map+Error"; }}
              />
            </div>
            <div className="flex space-x-4">
              <FormField
                label="Latitude"
                type="number"
                required
                value={formData.stationDetails.latitude}
                onChange={(e) => handleChange('stationDetails', 'latitude', e.target.value)}
                placeholder="-37.816335755470924"
                className="flex-1"
              />
              <FormField
                label="Longitude"
                type="number"
                required
                value={formData.stationDetails.longitude}
                onChange={(e) => handleChange('stationDetails', 'longitude', e.target.value)}
                placeholder="145.01334547976228"
                className="flex-1"
              />
            </div>
            <FormField
              label="Directions"
              type="textarea"
              value={formData.stationDetails.directions}
              onChange={(e) => handleChange('stationDetails', 'directions', e.target.value)}
              placeholder="e.g., Enter from Bourke Street and turn right after entering carpark 2."
              helpText="Displayed in the app to help drivers easily locate the station."
              maxLength={150}
            />
          </Accordion>

          <Accordion
            title="Stickers and labels"
            description="Add information about physical labels on the station."
            isOpen={openAccordion === 'stickersLabels'}
            onToggle={() => setOpenAccordion(openAccordion === 'stickersLabels' ? null : 'stickersLabels')}
            isCompleted={sectionStatus.stickersLabels.completed}
            statusIcon={sectionStatus.stickersLabels.completed ? CheckCircle2 : Circle}
          >
            <p className="text-sm mb-4 text-gray-600">Please refer to our <a href="#" className="text-blue-600 underline">Station Guidelines</a> to determine the proper sticker placement for each charger model.</p>
            <FormField
              label="Are station stickers and port labels applied to the station?"
              type="radio"
              required
              value={formData.stickersLabels.stickersApplied}
              onChange={(e) => handleChange('stickersLabels', 'stickersApplied', e.target.value)}
              options={[
                { value: 'yes', label: 'Yes' },
                { value: 'no', label: 'No' },
              ]}
            />
            {formData.stickersLabels.stickersApplied === 'no' && (
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4" role="alert">
                <p className="font-bold">Station stickers and labels are required before going live.</p>
                <p>Contact support@chargefox.com to arrange delivery.</p>
              </div>
            )}
            <FormField
              label="Station number"
              type="text"
              required
              value={formData.stickersLabels.stationNumber}
              onChange={(e) => handleChange('stickersLabels', 'stationNumber', e.target.value)}
              placeholder="Enter the station number"
              helpText="Enter the Chargefox station number printed on the sticker."
            />
            <p className='text-sm text-gray-600 mb-2 mt-6'>Please attach photo(s) of the completed installation including sticker placements.</p>
            <div className="bg-blue-50 border-2 border-dotted rounded-lg border-blue-400 p-4 mb-4 flex items-center">
              <input type="file" className='mutiple text-sm'/>
            </div>
          </Accordion>

          <Accordion
            title="Network communication"
            description="Choose how the station will connect to the internet."
            isOpen={openAccordion === 'networkCommunication'}
            onToggle={() => setOpenAccordion(openAccordion === 'networkCommunication' ? null : 'networkCommunication')}
            isCompleted={sectionStatus.networkCommunication.completed}
            statusIcon={sectionStatus.networkCommunication.completed ? CheckCircle2 : Circle}
          >
            <FormField
              label="Connection type"
              type="radio"
              required
              value={formData.networkCommunication.connectionType}
              onChange={(e) => handleChange('networkCommunication', 'connectionType', e.target.value)}
              options={[
                { value: 'sim_card_chargefox', label: 'SIM card provided by Chargefox' },
                { value: 'i_have_my_own_sim_card', label: 'I have my own SIM card' },
                { value: 'ethernet_wifi', label: 'Ethernet / Wi-Fi' },
              ]}
            />
            {formData.networkCommunication.connectionType === 'sim_card_chargefox' && (
              <FormField
                label="SIM card ICCID"
                type="text"
                required
                value={formData.networkCommunication.simCardICCID}
                onChange={(e) => handleChange('networkCommunication', 'simCardICCID', e.target.value)}
                placeholder="Enter SIM ICCID"
                helpText="Unique 19-20 digit number typically located on the SIM card."
                maxLength={20}
              />
            )}
            {formData.networkCommunication.connectionType !== 'sim_card_chargefox' && formData.networkCommunication.connectionType !== '' && (
              <FormField
                label="Provider"
                type="text"
                value={formData.networkCommunication.provider}
                onChange={(e) => handleChange('networkCommunication', 'provider', e.target.value)}
                placeholder="e.g., Telstra, Optus"
              />
            )}
          </Accordion>

          <Accordion
            title="Pricing"
            description="Choose how you want to price charging sessions at this station."
            isOpen={openAccordion === 'pricing'}
            onToggle={() => setOpenAccordion(openAccordion === 'pricing' ? null : 'pricing')}
            isCompleted={sectionStatus.pricing.completed}
            statusIcon={sectionStatus.pricing.completed ? CheckCircle2 : Circle}
          >
            <FormField
              label="Price per kWh"
              type="number"
              required
              value={formData.pricing.basePricePerKwh}
              onChange={(e) => handleChange('pricing', 'basePricePerKwh', e.target.value)}
              placeholder="$ 0.35"
              helpText="Leave this field blank or enter 0 if charging will be free at this station."
            />

            <FormField
              label="Add a free charging period at the beginning"
              type="checkbox"
              checked={formData.pricing.addFreePeriod}
              onChange={(e) => handleChange('pricing', 'addFreePeriod', e.target.checked)}
            />
            {formData.pricing.addFreePeriod && (
              <FormField
                label="Free for how many minutes?"
                type="number"
                required
                value={formData.pricing.freeMinutes}
                onChange={(e) => handleChange('pricing', 'freeMinutes', e.target.value)}
                placeholder="15"
              />
            )}

            <FormField
              label="Add peak pricing"
              type="checkbox"
              checked={formData.pricing.addPeakPricing}
              onChange={(e) => handleChange('pricing', 'addPeakPricing', e.target.checked)}
            />
            {formData.pricing.addPeakPricing && (
              <>
                <div className="flex space-x-4">
                  <FormField
                    label="Start time"
                    type="time"
                    required
                    value={formData.pricing.peakStartTime}
                    onChange={(e) => handleChange('pricing', 'peakStartTime', e.target.value)}
                    className="flex-1"
                  />
                  <FormField
                    label="End time"
                    type="time"
                    required
                    value={formData.pricing.peakEndTime}
                    onChange={(e) => handleChange('pricing', 'peakEndTime', e.target.value)}
                    className="flex-1"
                  />
                </div>
                <FormField
                  label="Peak pricing per kWh"
                  type="number"
                  required
                  value={formData.pricing.peakPricePerKwh}
                  onChange={(e) => handleChange('pricing', 'peakPricePerKwh', e.target.value)}
                  placeholder="$ 0.45"
                />
              </>
            )}
          </Accordion>

          <Accordion
            title="Enter chargebox identity"
            description="Enter the station's chargebox identity to connect it to the Chargefox network."
            isOpen={openAccordion === 'connectToChargefox'}
            onToggle={() => setOpenAccordion(openAccordion === 'connectToChargefox' ? null : 'connectToChargefox')}
            isCompleted={sectionStatus.connectToChargefox.completed}
            statusIcon={sectionStatus.connectToChargefox.completed ? CheckCircle2 : Circle}
          >
            <p className="text-sm text-gray-600 mb-4">
              Please configure your station with the secure OCPP URL (wss://test.chargefox.com/ocpp/1.6). 

              For Chargefox-supplied SIM cards, also ensure the APN is set to ipx2.m2mone. <a href="#" className="text-blue-600 hover:underline">Learn more</a>
            </p>
            <FormField
              label="Chargebox identity (OCPP ID)"
              type="text"
              required
              value={formData.connectToChargefox.ocppId}
              onChange={(e) => handleChange('connectToChargefox', 'ocppId', e.target.value)}
              placeholder="e.g. 123456789"
              helpText="The charger identity typically found in the documentation or packaging."
            />

            {connectStatus === 'loading' && (
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4 flex items-center" role="status">
                <Info size={20} className="mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold">Connection in progress. This may take up to 10 minutes.</p>
                  <p>You can close this page and revisit it later.</p>
                </div>
              </div>
            )}
            {connectStatus === 'error' && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 mb-4 flex items-center" role="alert">
                <XCircle size={20} className="mr-3 flex-shrink-0" />
                <div>
                  <p className="font-bold">Connection unsuccessful. Please check the chargebox identity for typos and try again.</p>
                  <p>{connectMessage}</p>
                </div>
              </div>
            )}
            {connectStatus === 'success' && (
              <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 mb-4 flex items-center" role="alert">
                <CheckCircle2 size={20} className="mr-3 flex-shrink-0" />
                <p className="font-bold">Station successfully connected to Chargefox. You can now configure hardware details.</p>
              </div>
            )}

            <button
              onClick={handleConnectChargefox}
              className={`mt-4 px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${
                connectStatus === 'loading' || formData.connectToChargefox.ocppId.trim() === '' || connectStatus === 'success'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              disabled={connectStatus === 'loading' || formData.connectToChargefox.ocppId.trim() === '' || connectStatus === 'success'}
            >
              {connectStatus === 'loading' ? 'Testing connection...' : (connectStatus === 'success' ? 'Connected' : 'Check connection')}
            </button>
          </Accordion>

          <Accordion
            title="Hardware details"
            description="Enter station hardware, connector, and power settings."
            isOpen={openAccordion === 'hardwareDetails'}
            onToggle={() => setOpenAccordion(openAccordion === 'hardwareDetails' ? null : 'hardwareDetails')}
            isCompleted={sectionStatus.hardwareDetails.completed}
            isDependent={true}
            isDisabled={!sectionStatus.connectToChargefox.completed}
            statusIcon={!sectionStatus.connectToChargefox.completed ? Lock : (sectionStatus.hardwareDetails.completed ? CheckCircle2 : Circle)}
          >
            <p className={`text-sm mb-4 ${!sectionStatus.connectToChargefox.completed ? 'text-red-500' : 'text-gray-600'}`}>
              {!sectionStatus.connectToChargefox.completed ? 'This section is dependent on "Connect to Chargefox" being completed.' : 'You can now enter hardware details.'}
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 mb-4 flex items-center" role="info">
              <Info size={20} className="mr-3 flex-shrink-0" />
              <p className="text-sm">Make, model, and the number of connectors for this station has been automatically populated by OCPP and cannot be manually edited.</p>
            </div>

            <div className="flex space-x-4">
              <FormField
                label="Make"
                type="text"
                value={formData.hardwareDetails.make}
                onChange={(e) => handleChange('hardwareDetails', 'make', e.target.value)}
                placeholder="Fimer"
                className="flex-1"
                disabled={true}
                helpText="Autopopulated by OCPP"
              />
              <FormField
                label="Model"
                type="text"
                value={formData.hardwareDetails.model}
                onChange={(e) => handleChange('hardwareDetails', 'model', e.target.value)}
                placeholder="Electra DC / QCK-DC-AC"
                className="flex-1"
                disabled={true}
                helpText="Autopopulated by OCPP"
              />
            </div>

            <FormField
              label="Power"
              type="number"
              required
              value={formData.hardwareDetails.powerRating}
              onChange={(e) => handleChange('hardwareDetails', 'powerRating', e.target.value)}
              placeholder="e.g. 22"
              helpText="Enter the final power reading for the station."
            />

            <FormField
              label="Station is using a Load Management System (LMS)"
              type="checkbox"
              checked={formData.hardwareDetails.usingLMS}
              onChange={(e) => handleChange('hardwareDetails', 'usingLMS', e.target.checked)}
              optionText="Station is using a Load Management System (LMS)"
            />

            {formData.hardwareDetails.connectors.map((connector, index) => (
              <div key={index} className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-md font-semibold text-gray-800 mb-2">Connector {index + 1}</h3>
                <div className="flex space-x-4">
                  <FormField
                    label="Port name"
                    type="select"
                    required
                    value={connector.portName}
                    onChange={(e) => handleConnectorChange(index, 'portName', e.target.value)}
                    options={[
                      { value: 'a', label: 'A' }, { value: 'b', label: 'B' }, { value: 'c', label: 'C' },
                      { value: 'd', label: 'D' }, { value: 'e', label: 'E' }, { value: 'f', label: 'F' }
                    ]}
                    placeholder="Select port"
                    className="flex-1"
                    helpText="Ensure this matches the port label sticker"
                  />
                  <FormField
                    label="Plug type"
                    type="select"
                    required
                    value={connector.plugType}
                    onChange={(e) => handleConnectorChange(index, 'plugType', e.target.value)}
                    options={[
                      { value: 'ccs2', label: 'CCS2' },
                      { value: 'chademo', label: 'CHAdeMO' },
                      { value: 'type2', label: 'Type 2' },
                      { value: 'type1', label: 'Type 1' }
                    ]}
                    placeholder="Select plug type"
                    className="flex-1"
                    helpText="e.g. CCS2, CHAdeMO, Type 2"
                  />
                </div>
                <FormField
                  label="Drivers need to bring their own cable"
                  type="checkbox"
                  checked={connector.driversBringCable}
                  onChange={(e) => handleConnectorChange(index, 'driversBringCable', e.target.checked)}
                  optionText="Drivers need to bring their own cable"
                />
              </div>
            ))}
          </Accordion>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-md font-semibold text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(formData); onClose(); }}
            className="px-6 py-3 rounded-md font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 transition-colors duration-200"
          >
            Save draft
          </button>
          <button
            onClick={handlePreSubmit}
            className={`px-6 py-3 rounded-md font-semibold text-white transition-colors duration-200 ${isFormSubmittable ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
            disabled={!isFormSubmittable}
          >
            Submit for review
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmSubmit}
        formData={formData}
      />
    </div>
  );
};

export default SidePanel; 