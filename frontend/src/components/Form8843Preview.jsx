import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collectFormData, generateForm8843, base64ToBlobURL, downloadPDF } from '../services/form8843Service';

function Form8843Preview() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [formData, setFormData] = useState(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleGenerate = async () => {
    if (!currentUser) {
      setError('Please log in to generate the form');
      return;
    }

    setLoading(true);
    setError('');
    setPdfUrl(null);
    setPdfBase64(null);

    try {
      // Collect all form data
      const taxYear = '2024'; // Default, could come from onboarding
      const collectedData = collectFormData(currentUser.uid, taxYear);
      setFormData(collectedData);

      // Basic validation
      if (!collectedData.firstName || !collectedData.lastName) {
        throw new Error('Please complete your profile information first.');
      }
      if (!collectedData.taxYear) {
        throw new Error('Tax year is required.');
      }

      // Generate PDF
      const response = await generateForm8843(collectedData);

      if (response.success && response.pdf) {
        setPdfBase64(response.pdf);
        const blobUrl = base64ToBlobURL(response.pdf);
        setPdfUrl(blobUrl);
      } else {
        throw new Error(response.message || 'Failed to generate PDF.');
      }
    } catch (err) {
      console.error('Error generating form:', err);
      setError(err.message || 'Failed to generate Form 8843. Please ensure all required filing information is complete and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfBase64) {
      setError('No PDF available to download');
      return;
    }

    try {
      const taxYear = formData?.taxYear || '2024';
      const lastName = formData?.lastName || 'form';
      const filename = `form8843_${taxYear}_${lastName}.pdf`;
      downloadPDF(pdfBase64, filename);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  return (
    <div className="bg-white border border-slate-300 p-6 md:p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-ink mb-2">Form 8843 Preview</h2>
        <p className="text-slate-700">
          Generate and preview your filled Form 8843 before downloading.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {!pdfUrl ? (
        <div className="text-center py-8">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`px-8 py-3 text-sm font-medium transition-all ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-ink text-white hover:bg-slate-800'
            } border border-ink rounded`}
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⏳</span>
                Generating PDF...
              </>
            ) : (
              'Generate Form 8843 PDF'
            )}
          </button>
          {loading && (
            <p className="mt-4 text-sm text-slate-600">
              Please wait while we generate your form...
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-slate-700">
              ✓ PDF generated successfully
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="px-6 py-2 bg-ink text-white text-sm font-medium hover:bg-slate-800 transition-colors border border-ink rounded"
              >
                Download PDF
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 text-ink text-sm font-medium hover:bg-stone-100 transition-colors border border-slate-300 rounded"
              >
                Regenerate
              </button>
            </div>
          </div>

          <div className="border border-slate-300 rounded-lg overflow-hidden" style={{ minHeight: '600px' }}>
            <iframe
              src={pdfUrl}
              className="w-full h-full"
              style={{ minHeight: '600px' }}
              title="Form 8843 Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Form8843Preview;

