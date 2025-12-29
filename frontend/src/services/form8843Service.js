/**
 * Service for Form 8843 PDF generation
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Collect all form data from localStorage
 */
export const collectFormData = (userId, taxYear) => {
  try {
    // Get onboarding data
    const onboardingKey = `taxcurb_onboarding_data_${userId}_${taxYear}`;
    const onboardingData = JSON.parse(localStorage.getItem(onboardingKey) || '{}');
    
    // Get filing data from various steps
    const profileData = JSON.parse(localStorage.getItem('filing_profile') || '{}');
    const visaData = JSON.parse(localStorage.getItem('filing_visa_status') || '{}');
    const identityData = JSON.parse(localStorage.getItem('filing_identity_travel') || '{}');
    const programData = JSON.parse(localStorage.getItem('filing_program_presence') || '{}');
    const addressData = JSON.parse(localStorage.getItem('filing_address') || '{}');
    
    // Combine all data
    const formData = {
      // From onboarding
      taxYear: onboardingData.taxYear || onboardingData.answers?.taxYear || taxYear || '2024',
      usPresence: onboardingData.answers?.usPresence || onboardingData.usPresence,
      
      // From profile
      firstName: profileData.firstName,
      middleName: profileData.middleName,
      lastName: profileData.lastName,
      dateOfBirth: profileData.dateOfBirth,
      countryOfCitizenship: profileData.countryOfCitizenship,
      
      // From visa status
      visaType: visaData.visaStatus,
      visaStatus: visaData.visaStatus,
      dateEnteredUS: visaData.dateEnteredUS,
      programStartDate: visaData.programStartDate,
      programEndDate: visaData.programEndDate,
      
      // From identity/travel
      ssn: identityData.ssn || '',
      hasSSN: identityData.hasSSN,
      
      // From program/presence
      daysInUS: programData.daysInUS2024 || programData.daysInUS || programData.daysInUSCalculated,
      daysInUSCalculated: programData.daysInUS2024 || programData.daysInUS || programData.daysInUSCalculated,
      institutionName: programData.institutionName,
      institutionStreet1: programData.institutionStreet1,
      institutionStreet2: programData.institutionStreet2,
      institutionCity: programData.institutionCity,
      institutionState: programData.institutionState,
      institutionZip: programData.institutionZip,
      institutionPhone: programData.institutionPhone,
      dsoName: programData.dsoName,
      dsoEmail: programData.dsoEmail,
      dsoPhone: programData.dsoPhone,
      
      // For checkbox fields
      hasSSN: identityData.hasSSN,
      
      // Page 2 fields (if needed - these can be populated from additional data)
      // part2Info1 through part2Info8 can be added if you collect this data
      
      // From address
      foreignAddressStreet1: addressData.countryOfResidence?.street1 || addressData.residenceStreet1,
      foreignAddressStreet2: addressData.countryOfResidence?.street2 || addressData.residenceStreet2,
      foreignAddressCity: addressData.countryOfResidence?.city || addressData.residenceCity,
      foreignAddressStateProvince: addressData.countryOfResidence?.state || addressData.residenceState,
      foreignAddressZip: addressData.countryOfResidence?.zip || addressData.residenceZip,
      foreignAddressCountry: addressData.countryOfResidence?.country || addressData.countryOfResidence,
      
      usAddressStreet1: addressData.unitedStates?.street1 || addressData.usStreet1,
      usAddressStreet2: addressData.unitedStates?.street2 || addressData.usStreet2,
      usAddressCity: addressData.unitedStates?.city || addressData.usCity,
      usAddressState: addressData.unitedStates?.state || addressData.usState,
      usAddressZip: addressData.unitedStates?.zip || addressData.usZip,
    };
    
    console.log('Collected form data:', formData);
    return formData;
  } catch (error) {
    console.error('Error collecting form data:', error);
    throw new Error('Failed to collect form data');
  }
};

/**
 * Generate Form 8843 PDF
 */
export const generateForm8843 = async (formData) => {
  try {
    console.log('Sending form data to backend:', formData);
    console.log('API URL:', `${API_URL}/api/forms/8843/generate`);
    
    const response = await fetch(`${API_URL}/api/forms/8843/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    
    console.log('Backend response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Backend response data:', { 
      success: data.success, 
      hasPdf: !!data.pdf,
      message: data.message 
    });
    
    if (!data.success || !data.pdf) {
      throw new Error(data.message || 'Failed to generate PDF');
    }
    
    return {
      success: true,
      pdf: data.pdf,
      message: data.message || 'PDF generated successfully'
    };
  } catch (error) {
    console.error('Error generating Form 8843:', error);
    
    // Provide user-friendly error messages
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('Cannot connect to server. Please make sure the backend is running on port 5000.');
    }
    
    throw error;
  }
};

/**
 * Convert base64 PDF to Blob URL for preview
 */
export const base64ToBlobURL = (base64String) => {
  try {
    // Remove data URL prefix if present
    const base64 = base64String.replace(/^data:application\/pdf;base64,/, '');
    
    // Convert base64 to binary
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and URL
    const blob = new Blob([bytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Error converting base64 to blob URL:', error);
    throw new Error('Failed to process PDF');
  }
};

/**
 * Download PDF
 */
export const downloadPDF = (base64String, filename = 'form8843.pdf') => {
  try {
    const blobUrl = base64ToBlobURL(base64String);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    throw new Error('Failed to download PDF');
  }
};

