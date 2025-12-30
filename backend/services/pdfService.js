import { PDFDocument } from 'pdf-lib';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fill Form 8843 PDF with user data
 * @param {Object} formData - User data from onboarding and filing forms
 * @returns {Promise<Uint8Array>} Filled PDF as bytes
 */
export async function fillForm8843(formData) {
  try {
    console.log('\n=== Form 8843 Fill ===');
    console.log('Form data received:', {
      name: formData.firstName && formData.lastName 
        ? `${formData.firstName} ${formData.lastName}` 
        : 'N/A',
      taxYear: formData.taxYear || 'N/A',
    });

    // Load PDF template
    const templatePath = path.join(__dirname, '../templates/f8843.pdf');
    const templateBytes = await fs.readFile(templatePath);
    
    // Load PDF document
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    console.log(`\nFilling form fields...`);
    
    // Map form data to PDF fields
    // Based on Form 8843 structure and the field names we discovered
    const fieldMappings = await getFieldMappings(formData);
    
    let filledCount = 0;
    let errorCount = 0;
    const errorFields = [];
    
    for (const [fieldName, value] of Object.entries(fieldMappings)) {
      if (!value && value !== 0 && value !== false) continue; // Skip empty values (but allow 0 and false)
      
      try {
        // Try to get the field - it might be a text field, dropdown, or other type
        let field = null;
        let fieldType = 'unknown';
        
        // Try text field first
        try {
          field = form.getTextField(fieldName);
          fieldType = 'text';
        } catch (e) {
          // Not a text field, try dropdown/choice field
          try {
            field = form.getDropdown(fieldName);
            fieldType = 'dropdown';
          } catch (e2) {
            // Not a dropdown either, try option list
            try {
              field = form.getOptionList(fieldName);
              fieldType = 'optionlist';
            } catch (e3) {
              // Field doesn't exist or is a different type
              errorCount++;
              errorFields.push({ fieldName, error: 'Field not found or unsupported type' });
              console.warn(`  ⚠️  Field not found or unsupported: ${fieldName.substring(fieldName.lastIndexOf('.') + 1)}`);
              continue;
            }
          }
        }
        
        // Set the value based on field type
        if (field) {
          if (fieldType === 'text') {
            field.setText(String(value));
          } else if (fieldType === 'dropdown' || fieldType === 'optionlist') {
            // For dropdowns, try to select the option
            try {
              field.select(String(value));
            } catch (e) {
              // If selection fails, try setting as text (some dropdowns allow this)
              try {
                if (field.setText) {
                  field.setText(String(value));
                } else {
                  throw new Error('Cannot set dropdown value');
                }
              } catch (e2) {
                throw e;
              }
            }
          }
          
          filledCount++;
          console.log(`  ✓ ${fieldName.substring(fieldName.lastIndexOf('.') + 1)}: ${value} (${fieldType})`);
        }
      } catch (e) {
        // Field exists but setting value failed
        errorCount++;
        errorFields.push({ fieldName, error: e.message });
        console.warn(`  ⚠️  Failed to fill ${fieldName.substring(fieldName.lastIndexOf('.') + 1)}: ${e.message}`);
      }
    }
    
    if (errorFields.length > 0) {
      console.warn(`  ⚠️  ${errorFields.length} fields could not be filled:`);
      errorFields.forEach(({ fieldName, error }) => {
        const shortName = fieldName.substring(fieldName.lastIndexOf('.') + 1);
        console.warn(`    - ${shortName}: ${error}`);
      });
    }
    
    // Handle checkboxes
    console.log('\nFilling checkboxes...');
    const checkboxCount = fillCheckboxes(form, formData);
    
    console.log(`\n✓ Summary: ${filledCount} text fields filled, ${checkboxCount} checkboxes filled, ${errorCount} field errors`);
    
    // Save PDF
    const pdfBytes = await pdfDoc.save();
    console.log(`✓ PDF generated: ${pdfBytes.length} bytes\n`);
    
    return pdfBytes;
  } catch (error) {
    console.error('\n✗ ERROR in fillForm8843:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    throw error;
  }
}

/**
 * Map form data to PDF field names
 * Updated mapping according to new specifications
 */
async function getFieldMappings(formData) {
  const mappings = {};
  
  console.log('\n=== Building Field Mappings ===');
  console.log('Form data keys:', Object.keys(formData));
  console.log('Has firstName:', !!formData.firstName);
  console.log('Has lastName:', !!formData.lastName);
  console.log('Has ssn:', !!formData.ssn);
  console.log('Has passports:', Array.isArray(formData.passports) ? formData.passports.length : 'not array');
  console.log('Has visaHistory:', !!formData.visaHistory);
  console.log('Has daysInUS2025:', formData.daysInUS2025);
  console.log('Has daysInUS2024:', formData.daysInUS2024);
  console.log('Has daysInUS2023:', formData.daysInUS2023);
  
  // ========== DEFAULT TAX YEAR FIELDS ==========
  mappings['topmostSubform[0].Page1[0].f1_01[0]'] = '01/01';
  mappings['topmostSubform[0].Page1[0].f1_02[0]'] = '12/31';
  mappings['topmostSubform[0].Page1[0].f1_03[0]'] = '2025';
  
  // ========== PERSONAL INFORMATION ==========
  // f1_04: First name and initial (firstName + middleName)
  const firstNameInitial = [formData.firstName, formData.middleName].filter(Boolean).join(' ').trim();
  if (firstNameInitial) {
    mappings['topmostSubform[0].Page1[0].f1_04[0]'] = firstNameInitial;
  }
  
  // f1_05: Last name
  if (formData.lastName) {
    mappings['topmostSubform[0].Page1[0].f1_05[0]'] = formData.lastName;
  }
  
  // f1_06: SSN/ITIN
  if (formData.ssn) {
    const formattedSSN = formatSSN(formData.ssn);
    mappings['topmostSubform[0].Page1[0].f1_06[0]'] = formattedSSN;
  }
  
  // ========== ADDRESS FIELDS (COMBINED) ==========
  // f1_07: Home country address
  const homeCountryAddress = combineAddressFields(
    formData.foreignAddressStreet1 || formData.residenceStreet1,
    formData.foreignAddressStreet2 || formData.residenceStreet2,
    formData.foreignAddressCity || formData.residenceCity,
    formData.foreignAddressStateProvince || formData.residenceState,
    formData.foreignAddressZip || formData.residenceZip,
    formData.foreignAddressCountry || formData.countryOfResidence
  );
  if (homeCountryAddress) {
    mappings['topmostSubform[0].Page1[0].f1_07[0]'] = homeCountryAddress;
  }
  
  // f1_08: US address
  const usAddress = combineAddressFields(
    formData.usAddressStreet1 || formData.usStreet1,
    formData.usAddressStreet2 || formData.usStreet2,
    formData.usAddressCity || formData.usCity,
    formData.usAddressState || formData.usState,
    formData.usAddressZip || formData.usZip,
    null // No country for US address
  );
  if (usAddress) {
    mappings['topmostSubform[0].Page1[0].f1_08[0]'] = usAddress;
  }
  
  // ========== VISA INFORMATION ==========
  // f1_09: Visa and entry date (combined)
  if (formData.visaStatus && formData.dateEnteredUS) {
    const visaEntryDate = `${formData.visaStatus}, ${formatDateForPDF(formData.dateEnteredUS)}`;
    mappings['topmostSubform[0].Page1[0].f1_09[0]'] = visaEntryDate;
  }
  
  // f1_10: Nonimmigrant status
  if (formData.visaStatus) {
    mappings['topmostSubform[0].Page1[0].f1_10[0]'] = formData.visaStatus;
  }
  
  // ========== CITIZENSHIP ==========
  // f1_11: Citizen tax year (countryOfCitizenship + otherCitizenships)
  const citizenships = [formData.countryOfCitizenship];
  if (formData.otherCitizenships && Array.isArray(formData.otherCitizenships)) {
    const otherCitizenships = formData.otherCitizenships.filter(c => {
      if (!c) return false;
      if (typeof c === 'string') {
        return c.trim() !== '';
      }
      return true; // Non-string values (shouldn't happen, but safe)
    });
    citizenships.push(...otherCitizenships);
  }
  const citizenTaxYear = citizenships.filter(Boolean).join(', ');
  if (citizenTaxYear) {
    mappings['topmostSubform[0].Page1[0].f1_11[0]'] = citizenTaxYear;
  }
  
  // ========== PASSPORT INFORMATION ==========
  // f1_12: Passport countries
  const passportCountries = combinePassportFields(formData.passports, 'country');
  if (passportCountries) {
    mappings['topmostSubform[0].Page1[0].f1_12[0]'] = passportCountries;
  }
  
  // f1_13: Passport numbers
  const passportNumbers = combinePassportFields(formData.passports, 'number');
  if (passportNumbers) {
    mappings['topmostSubform[0].Page1[0].f1_13[0]'] = passportNumbers;
  }
  
  // ========== DAYS IN USA ==========
  // f1_14: Number in USA 2025
  if (formData.daysInUS2025 !== undefined && formData.daysInUS2025 !== null) {
    mappings['topmostSubform[0].Page1[0].f1_14[0]'] = String(formData.daysInUS2025);
  }
  
  // f1_15: Number in USA 2024
  if (formData.daysInUS2024 !== undefined && formData.daysInUS2024 !== null) {
    mappings['topmostSubform[0].Page1[0].f1_15[0]'] = String(formData.daysInUS2024);
  }
  
  // f1_16: Number in USA 2023
  if (formData.daysInUS2023 !== undefined && formData.daysInUS2023 !== null) {
    mappings['topmostSubform[0].Page1[0].f1_16[0]'] = String(formData.daysInUS2023);
  }
  
  // f1_17: 2025 exclude presence (display daysInUS2025)
  if (formData.daysInUS2025 !== undefined && formData.daysInUS2025 !== null) {
    mappings['topmostSubform[0].Page1[0].f1_17[0]'] = String(formData.daysInUS2025);
  }
  
  // ========== INSTITUTION INFORMATION (COMBINED) ==========
  // f1_26: Student school info
  const schoolParts = [];
  if (formData.institutionName) schoolParts.push(formData.institutionName);
  if (formData.institutionStreet1) schoolParts.push(formData.institutionStreet1);
  if (formData.institutionStreet2) schoolParts.push(formData.institutionStreet2);
  const schoolCityStateZip = [formData.institutionCity, formData.institutionState, formData.institutionZip].filter(Boolean).join(' ');
  if (schoolCityStateZip) schoolParts.push(schoolCityStateZip);
  if (formData.institutionPhone) schoolParts.push(formData.institutionPhone);
  const studentSchoolInfo = schoolParts.join(', ');
  if (studentSchoolInfo) {
    mappings['topmostSubform[0].Page1[0].f1_26[0]'] = studentSchoolInfo;
  }
  
  // f1_27: Student director info
  const directorParts = [];
  if (formData.dsoName) directorParts.push(formData.dsoName);
  if (formData.dsoEmail) directorParts.push(formData.dsoEmail);
  if (formData.dsoPhone) directorParts.push(formData.dsoPhone);
  const studentDirectorInfo = directorParts.join(', ');
  if (studentDirectorInfo) {
    mappings['topmostSubform[0].Page1[0].f1_27[0]'] = studentDirectorInfo;
  }
  
  // ========== VISA HISTORY BY YEAR ==========
  // f1_28 to f1_33: Visa held for each year (2019-2024)
  if (formData.visaHistory && typeof formData.visaHistory === 'object') {
    console.log('Processing visaHistory:', formData.visaHistory);
    const yearMapping = {
      '2019': 'topmostSubform[0].Page1[0].f1_28[0]',
      '2020': 'topmostSubform[0].Page1[0].f1_29[0]',
      '2021': 'topmostSubform[0].Page1[0].f1_30[0]',
      '2022': 'topmostSubform[0].Page1[0].f1_31[0]',
      '2023': 'topmostSubform[0].Page1[0].f1_32[0]',
      '2024': 'topmostSubform[0].Page1[0].f1_33[0]'
    };
    
    for (const [year, fieldName] of Object.entries(yearMapping)) {
      const yearValue = formData.visaHistory[year];
      
      if (yearValue && String(yearValue).trim() !== '') {
        // Extract single character from visa status (e.g., "F-1" -> "F", "M-1" -> "M")
        // PDF fields only accept 1 character
        const singleChar = extractVisaTypeChar(yearValue);
        if (singleChar) {
          mappings[fieldName] = singleChar;
          console.log(`  Mapped visa history ${year}: "${yearValue}" -> "${singleChar}"`);
        } else {
          console.log(`  Skipped visa history ${year}: "${yearValue}" (no valid char extracted)`);
        }
      } else {
        console.log(`  No visa history for year ${year}`);
      }
    }
  } else {
    console.log('No visaHistory data found or invalid format');
  }
  
  // ========== APPLIED FOR PR EXPLANATION ==========
  // f1_34: Explain applied for PR (auto-filled with empty string)
  mappings['topmostSubform[0].Page1[0].f1_34[0]'] = '';
  
  console.log(`\nTotal mappings created: ${Object.keys(mappings).length}`);
  console.log('Mapped fields:', Object.keys(mappings).map(k => k.substring(k.lastIndexOf('.') + 1)).join(', '));
  
  return mappings;
}

/**
 * Fill checkboxes in the form
 * Form 8843 checkboxes: c1_2[0], c1_2[1], c1_3[0], c1_3[1]
 * @returns {number} Number of checkboxes successfully filled
 */
function fillCheckboxes(form, formData) {
  let filledCount = 0;
  
  try {
    // c1_2 checkboxes - Exempt 5 years check
    // Logic: If dateEnteredUS is more than 5 years ago → Yes (c1_2[0])
    //        If 5 years or less ago → No (c1_2[1])
    if (formData.dateEnteredUS) {
      const yearsSince = calculateYearsSince(formData.dateEnteredUS);
      try {
        const checkboxYes = form.getCheckBox('topmostSubform[0].Page1[0].c1_2[0]');
        const checkboxNo = form.getCheckBox('topmostSubform[0].Page1[0].c1_2[1]');
        
        if (yearsSince > 5) {
          checkboxYes.check();
          try {
            checkboxNo.uncheck();
          } catch (e) {
            // Ignore uncheck errors
          }
          filledCount++;
          console.log(`  ✓ Checked: c1_2[0] (Exempt 5 years: Yes - entered ${yearsSince} years ago)`);
        } else {
          checkboxNo.check();
          try {
            checkboxYes.uncheck();
          } catch (e) {
            // Ignore uncheck errors
          }
          filledCount++;
          console.log(`  ✓ Checked: c1_2[1] (Exempt 5 years: No - entered ${yearsSince} years ago)`);
        }
      } catch (e) {
        console.warn('  ⚠️  Could not set c1_2 checkboxes:', e.message);
      }
    }
    
    // c1_3 checkboxes - Applied for PR
    // Default: Check No (c1_3[1]), uncheck Yes (c1_3[0])
    try {
      const checkboxYes = form.getCheckBox('topmostSubform[0].Page1[0].c1_3[0]');
      const checkboxNo = form.getCheckBox('topmostSubform[0].Page1[0].c1_3[1]');
      checkboxNo.check();
      try {
        checkboxYes.uncheck();
      } catch (e) {
        // Ignore uncheck errors
      }
      filledCount++;
      console.log('  ✓ Checked: c1_3[1] (Applied for PR: No - default)');
    } catch (e) {
      console.warn('  ⚠️  Could not set c1_3 checkboxes:', e.message);
    }
  } catch (e) {
    console.warn('  ⚠️  Error filling checkboxes:', e.message);
  }
  
  return filledCount;
}

/**
 * Format SSN for PDF (XXX-XX-XXXX)
 */
function formatSSN(ssn) {
  if (!ssn) return '';
  // Remove any existing formatting
  const cleaned = ssn.replace(/[^\d]/g, '');
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 5)}-${cleaned.slice(5)}`;
  }
  return ssn; // Return as-is if not 9 digits
}

/**
 * Format date for PDF (MM/DD/YYYY)
 */
function formatDateForPDF(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  } catch (e) {
    return dateString; // Return as-is if parsing fails
  }
}

/**
 * Combine address fields into a single string
 */
function combineAddressFields(street1, street2, city, state, zip, country) {
  const parts = [];
  if (country) parts.push(country);
  if (street1) parts.push(street1);
  if (street2) parts.push(street2);
  if (city) parts.push(city);
  if (state) parts.push(state);
  if (zip) parts.push(zip);
  return parts.join(', ');
}

/**
 * Combine passport arrays into comma-separated string
 */
function combinePassportFields(passports, field) {
  if (!passports || !Array.isArray(passports)) return '';
  const values = passports
    .map(p => p && p[field])
    .filter(Boolean);
  return values.join(', ');
}

/**
 * Calculate years since a given date
 */
function calculateYearsSince(dateString) {
  if (!dateString) return 0;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 0;
    const today = new Date();
    const years = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      return years - 1;
    }
    return years;
  } catch (e) {
    return 0;
  }
}

/**
 * Calculate exclude presence (365 - daysInUS2025, ensure non-negative)
 */
function calculateExcludePresence(daysInUS2025) {
  const days = parseInt(daysInUS2025) || 0;
  const exclude = 365 - days;
  return Math.max(0, exclude);
}

/**
 * Extract single character from visa status for PDF fields
 * PDF fields only accept 1 character, so "F-1" -> "F", "M-1" -> "M", etc.
 * Handles: "F-1" -> "F", "M-1" -> "M", "J-1" -> "J", "F1" -> "F", "F" -> "F"
 * For "Not in U.S." or empty values, returns empty string
 */
function extractVisaTypeChar(visaStatus) {
  if (!visaStatus) return '';
  const statusStr = String(visaStatus).trim();
  if (!statusStr) return '';
  
  // Handle "Not in U.S." or similar - return empty
  if (statusStr.toLowerCase().includes('not in')) return '';
  
  // Extract first character and uppercase it (e.g., "F-1" -> "F", "M-1" -> "M", "F1" -> "F")
  const firstChar = statusStr.charAt(0).toUpperCase();
  // Only return if it's a letter (A-Z)
  if (/[A-Z]/.test(firstChar)) {
    return firstChar;
  }
  return '';
}

/**
 * Get all field names from PDF (for debugging)
 */
export async function getPDFFieldNames() {
  try {
    const templatePath = path.join(__dirname, '../templates/f8843.pdf');
    const templateBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    return fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));
  } catch (error) {
    console.error('Error getting field names:', error);
    throw error;
  }
}

