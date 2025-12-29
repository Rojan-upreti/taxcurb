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
    const fieldMappings = getFieldMappings(formData);
    
    let filledCount = 0;
    let errorCount = 0;
    const errorFields = [];
    
    for (const [fieldName, value] of Object.entries(fieldMappings)) {
      if (!value && value !== 0 && value !== false) continue; // Skip empty values (but allow 0 and false)
      
      try {
        const field = form.getTextField(fieldName);
        if (field) {
          field.setText(String(value));
          filledCount++;
          console.log(`  ✓ ${fieldName.substring(fieldName.lastIndexOf('.') + 1)}: ${value}`);
        }
      } catch (e) {
        // Field might not exist or be a different type
        errorCount++;
        errorFields.push(fieldName);
        // Don't log every error to avoid spam, just track them
      }
    }
    
    if (errorFields.length > 0) {
      console.warn(`  ⚠️  ${errorFields.length} fields could not be filled (may not exist in PDF)`);
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
 * Complete mapping for all 48 fields in Form 8843
 */
function getFieldMappings(formData) {
  const mappings = {};
  
  // ========== PAGE 1 FIELDS ==========
  
  // f1_01 to f1_34: Text fields
  // Personal Information Section
  if (formData) {
    mappings['topmostSubform[0].Page1[0].f1_01[0]'] = formData.firstName;
  }
  if (formData.middleName) {
    mappings['topmostSubform[0].Page1[0].f1_02[0]'] = formData.middleName;
  }
  if (formData.lastName) {
    mappings['topmostSubform[0].Page1[0].f1_03[0]'] = formData.lastName;
  }
  if (formData.ssn) {
    const formattedSSN = formatSSN(formData.ssn);
    mappings['topmostSubform[0].Page1[0].f1_04[0]'] = formattedSSN;
  }
  if (formData.taxYear) {
    mappings['topmostSubform[0].Page1[0].f1_05[0]'] = formData.taxYear;
  }
  if (formData.dateOfBirth) {
    const formattedDate = formatDateForPDF(formData.dateOfBirth);
    mappings['topmostSubform[0].Page1[0].f1_06[0]'] = formattedDate;
  }
  if (formData.countryOfCitizenship) {
    mappings['topmostSubform[0].Page1[0].f1_07[0]'] = formData.countryOfCitizenship;
  }
  if (formData.visaType || formData.visaStatus) {
    mappings['topmostSubform[0].Page1[0].f1_08[0]'] = formData.visaType || formData.visaStatus;
  }
  if (formData.dateEnteredUS) {
    const formattedDate = formatDateForPDF(formData.dateEnteredUS);
    mappings['topmostSubform[0].Page1[0].f1_09[0]'] = formattedDate;
  }
  if (formData.daysInUS || formData.daysInUSCalculated) {
    mappings['topmostSubform[0].Page1[0].f1_10[0]'] = String(formData.daysInUS || formData.daysInUSCalculated);
  }
  
  // Foreign Address Section
  if (formData.foreignAddressStreet1) {
    mappings['topmostSubform[0].Page1[0].f1_11[0]'] = formData.foreignAddressStreet1;
  }
  if (formData.foreignAddressStreet2) {
    mappings['topmostSubform[0].Page1[0].f1_12[0]'] = formData.foreignAddressStreet2;
  }
  if (formData.foreignAddressCity) {
    mappings['topmostSubform[0].Page1[0].f1_13[0]'] = formData.foreignAddressCity;
  }
  if (formData.foreignAddressStateProvince) {
    mappings['topmostSubform[0].Page1[0].f1_14[0]'] = formData.foreignAddressStateProvince;
  }
  if (formData.foreignAddressZip) {
    mappings['topmostSubform[0].Page1[0].f1_15[0]'] = formData.foreignAddressZip;
  }
  if (formData.foreignAddressCountry) {
    mappings['topmostSubform[0].Page1[0].f1_16[0]'] = formData.foreignAddressCountry;
  }
  
  // US Address Section
  if (formData.usAddressStreet1) {
    mappings['topmostSubform[0].Page1[0].f1_17[0]'] = formData.usAddressStreet1;
  }
  if (formData.usAddressStreet2) {
    mappings['topmostSubform[0].Page1[0].f1_18[0]'] = formData.usAddressStreet2;
  }
  if (formData.usAddressCity) {
    mappings['topmostSubform[0].Page1[0].f1_19[0]'] = formData.usAddressCity;
  }
  if (formData.usAddressState) {
    mappings['topmostSubform[0].Page1[0].f1_20[0]'] = formData.usAddressState;
  }
  if (formData.usAddressZip) {
    mappings['topmostSubform[0].Page1[0].f1_21[0]'] = formData.usAddressZip;
  }
  
  // Institution Information Section
  if (formData.institutionName) {
    mappings['topmostSubform[0].Page1[0].f1_22[0]'] = formData.institutionName;
  }
  if (formData.institutionStreet1) {
    mappings['topmostSubform[0].Page1[0].f1_23[0]'] = formData.institutionStreet1;
  }
  if (formData.institutionStreet2) {
    mappings['topmostSubform[0].Page1[0].f1_24[0]'] = formData.institutionStreet2;
  }
  if (formData.institutionCity) {
    mappings['topmostSubform[0].Page1[0].f1_25[0]'] = formData.institutionCity;
  }
  if (formData.institutionState) {
    mappings['topmostSubform[0].Page1[0].f1_26[0]'] = formData.institutionState;
  }
  if (formData.institutionZip) {
    mappings['topmostSubform[0].Page1[0].f1_27[0]'] = formData.institutionZip;
  }
  if (formData.institutionPhone) {
    mappings['topmostSubform[0].Page1[0].f1_28[0]'] = formData.institutionPhone;
  }
  
  // DSO Information Section
  if (formData.dsoName) {
    mappings['topmostSubform[0].Page1[0].f1_29[0]'] = formData.dsoName;
  }
  if (formData.dsoEmail) {
    mappings['topmostSubform[0].Page1[0].f1_30[0]'] = formData.dsoEmail;
  }
  if (formData.dsoPhone) {
    mappings['topmostSubform[0].Page1[0].f1_31[0]'] = formData.dsoPhone;
  }
  
  // Program Dates
  if (formData.programStartDate) {
    const formattedDate = formatDateForPDF(formData.programStartDate);
    mappings['topmostSubform[0].Page1[0].f1_32[0]'] = formattedDate;
  }
  if (formData.programEndDate) {
    const formattedDate = formatDateForPDF(formData.programEndDate);
    mappings['topmostSubform[0].Page1[0].f1_33[0]'] = formattedDate;
  }
  
  // Additional field (f1_34) - may be for additional information or continuation
  // Map to any additional relevant data
  if (formData.additionalInfo) {
    mappings['topmostSubform[0].Page1[0].f1_34[0]'] = formData.additionalInfo;
  }
  
  // ========== PAGE 2 FIELDS ==========
  
  // f2_01 to f2_08: Additional information fields (typically for Part II or continuation)
  // These might be for additional presence information, treaty information, etc.
  if (formData.part2Info1) {
    mappings['topmostSubform[0].Page2[0].f2_01[0]'] = formData.part2Info1;
  }
  if (formData.part2Info2) {
    mappings['topmostSubform[0].Page2[0].f2_02[0]'] = formData.part2Info2;
  }
  if (formData.part2Info3) {
    mappings['topmostSubform[0].Page2[0].f2_03[0]'] = formData.part2Info3;
  }
  if (formData.part2Info4) {
    mappings['topmostSubform[0].Page2[0].f2_04[0]'] = formData.part2Info4;
  }
  if (formData.part2Info5) {
    mappings['topmostSubform[0].Page2[0].f2_05[0]'] = formData.part2Info5;
  }
  if (formData.part2Info6) {
    mappings['topmostSubform[0].Page2[0].f2_06[0]'] = formData.part2Info6;
  }
  if (formData.part2Info7) {
    mappings['topmostSubform[0].Page2[0].f2_07[0]'] = formData.part2Info7;
  }
  if (formData.part2Info8) {
    mappings['topmostSubform[0].Page2[0].f2_08[0]'] = formData.part2Info8;
  }
  
  return mappings;
}

/**
 * Fill checkboxes in the form
 * Form 8843 has 6 checkboxes: c1_1[0], c1_1[1], c1_2[0], c1_2[1], c1_3[0], c1_3[1]
 * These are typically for Yes/No questions or multiple choice options
 * @returns {number} Number of checkboxes successfully filled
 */
function fillCheckboxes(form, formData) {
  let filledCount = 0;
  
  try {
    // c1_1 checkboxes - typically for a Yes/No question (e.g., "Were you present in the US?")
    // c1_1[0] = Yes, c1_1[1] = No
    if (formData.usPresence === 'yes') {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_1[0]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_1[0] (US Presence: Yes)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_1[0]:', e.message);
      }
    } else if (formData.usPresence === 'no') {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_1[1]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_1[1] (US Presence: No)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_1[1]:', e.message);
      }
    }
    
    // c1_2 checkboxes - typically for another Yes/No question
    // c1_2[0] = Yes, c1_2[1] = No
    if (formData.hasSSN === 'yes' || formData.hasSSN === true) {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_2[0]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_2[0] (Has SSN: Yes)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_2[0]:', e.message);
      }
    } else if (formData.hasSSN === 'no' || formData.hasSSN === false) {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_2[1]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_2[1] (Has SSN: No)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_2[1]:', e.message);
      }
    }
    
    // c1_3 checkboxes - typically for another Yes/No question
    // c1_3[0] = Yes, c1_3[1] = No
    // This might be for treaty benefits, tax home, or other conditions
    if (formData.treatyBenefits === 'yes' || formData.claimTreatyBenefits === true) {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_3[0]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_3[0] (Treaty Benefits: Yes)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_3[0]:', e.message);
      }
    } else if (formData.treatyBenefits === 'no' || formData.claimTreatyBenefits === false) {
      try {
        const checkbox = form.getCheckBox('topmostSubform[0].Page1[0].c1_3[1]');
        checkbox.check();
        filledCount++;
        console.log('  ✓ Checked: c1_3[1] (Treaty Benefits: No)');
      } catch (e) {
        console.warn('  ⚠️  Could not check c1_3[1]:', e.message);
      }
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

