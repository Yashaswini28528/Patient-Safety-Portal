import React from "react";
import { CardiacDetail } from "./types";

interface CardiacFormProps {
  detail: CardiacDetail;
  onChange: (detail: CardiacDetail) => void;
  errors: Record<string, string>;
}

const CardiacForm: React.FC<CardiacFormProps> = ({
  detail,
  onChange,
  errors,
}) => {
  const handleChange = (field: keyof CardiacDetail, value: any) => {
    onChange({ ...detail, [field]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      onChange({
        ...detail,
        report: file,
        reportName: file.name,
      });
    }
  };

  const handleClearFile = () => {
    onChange({
      ...detail,
      report: null,
      reportName: "",
      reportUrl: "",
    });
  };

  const handleDownloadFile = async () => {
    try {
      if (detail.report instanceof File) {
        const url = URL.createObjectURL(detail.report);
        const link = document.createElement("a");
        link.href = url;
        link.download = detail.report.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        alert(
          `Downloading "${detail.report.name}" - check your downloads folder`
        );
        return;
      }

      if (detail.reportUrl) {
        try {
          const response = await fetch(detail.reportUrl);
          if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = detail.reportName || "document";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert(
              `Downloading "${detail.reportName}" - check your downloads folder`
            );
          } else {
            window.open(detail.reportUrl, "_blank");
            alert(`Opening "${detail.reportName}" in a new tab`);
          }
        } catch (fetchError) {
          window.open(detail.reportUrl, "_blank");
          alert(`Opening "${detail.reportName}" in a new tab`);
        }
        return;
      }

      if (detail.reportName) {
        const fileName = detail.reportName;

        if (fileName.toLowerCase().endsWith(".pdf")) {
          const pdfBlob = new Blob(["PDF file content would be here"], {
            type: "application/pdf",
          });
          const url = URL.createObjectURL(pdfBlob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          alert(`Downloading "${fileName}" - check your downloads folder`);
        } else {
          alert(
            `File "${fileName}" cannot be downloaded directly. Please contact support for the file.`
          );
        }
        return;
      }

      alert("No file available for download.");
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. Please try again or contact support.");
    }
  };

  return (
    <div className="health-details-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="bloodPressure">Blood Pressure *</label>
          <input
            id="bloodPressure"
            type="text"
            value={detail.bloodPressure || ""}
            onChange={(e) => handleChange("bloodPressure", e.target.value)}
            className={errors.bloodPressure ? "error" : ""}
          />
          {errors.bloodPressure && (
            <span className="error-message">{errors.bloodPressure}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="heartRate">Heart Rate *</label>
          <input
            id="heartRate"
            type="number"
            value={detail.heartRate || ""}
            onChange={(e) => handleChange("heartRate", e.target.value)}
            className={errors.heartRate ? "error" : ""}
          />
          {errors.heartRate && (
            <span className="error-message">{errors.heartRate}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="weight">Weight (kg) *</label>
          <input
            id="weight"
            type="number"
            step="0.1"
            value={detail.weight || ""}
            onChange={(e) => handleChange("weight", e.target.value)}
            className={errors.weight ? "error" : ""}
          />
          {errors.weight && (
            <span className="error-message">{errors.weight}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="treatmentDate">Treatment Date</label>
          <input
            id="treatmentDate"
            type="date"
            value={detail.treatmentDate || ""}
            onChange={(e) => handleChange("treatmentDate", e.target.value)}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="currentSymptoms">Current Symptoms *</label>
          <textarea
            id="currentSymptoms"
            value={detail.currentSymptoms || ""}
            onChange={(e) => handleChange("currentSymptoms", e.target.value)}
            rows={3}
            className={errors.currentSymptoms ? "error" : ""}
          />
          {errors.currentSymptoms && (
            <span className="error-message">{errors.currentSymptoms}</span>
          )}
        </div>

        <div className="form-group full-width">
          <label htmlFor="familyHistory">Family History *</label>
          <select
            id="familyHistory"
            value={detail.familyHistory || ""}
            onChange={(e) => handleChange("familyHistory", e.target.value)}
            className={errors.familyHistory ? "error" : ""}
          >
            <option value="">-- Select --</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
          </select>
          {errors.familyHistory && (
            <span className="error-message">{errors.familyHistory}</span>
          )}
        </div>

        <div className="form-group">
          <label>Medical History</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="hasMedicalHistory"
                checked={detail.hasMedicalHistory === true}
                onChange={() => handleChange("hasMedicalHistory", true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="hasMedicalHistory"
                checked={detail.hasMedicalHistory === false}
                onChange={() => handleChange("hasMedicalHistory", false)}
              />
              No
            </label>
          </div>
        </div>

        {detail.hasMedicalHistory === true && (
          <>
            <div className="form-group full-width">
              <label htmlFor="report">Upload Report/File</label>
              <div className="file-upload-section">
                {detail.reportName ? (
                  <div className="file-info">
                    <span className="file-name">{detail.reportName}</span>
                    <div className="file-actions">
                      <button
                        type="button"
                        className="btn-download-file"
                        onClick={handleDownloadFile}
                        title={`Download ${detail.reportName}`}
                      >
                        <i className="icon-download">📥</i> Download
                      </button>
                      <button
                        type="button"
                        className="btn-clear-file"
                        onClick={handleClearFile}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <input
                    id="report"
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="file-input"
                  />
                )}
              </div>
              <small className="file-hint">
                Supported formats: PDF, DOC, DOCX, JPG, PNG
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="previousDoctor">Previous Doctor *</label>
              <input
                id="previousDoctor"
                type="text"
                value={detail.previousDoctor || ""}
                onChange={(e) => handleChange("previousDoctor", e.target.value)}
                className={errors.previousDoctor ? "error" : ""}
              />
              {errors.previousDoctor && (
                <span className="error-message">{errors.previousDoctor}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="hospitalDetails">Hospital Details *</label>
              <input
                id="hospitalDetails"
                type="text"
                value={detail.hospitalDetails || ""}
                onChange={(e) =>
                  handleChange("hospitalDetails", e.target.value)
                }
                className={errors.hospitalDetails ? "error" : ""}
              />
              {errors.hospitalDetails && (
                <span className="error-message">{errors.hospitalDetails}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastDiagnosedDate">Last Diagnosed Date *</label>
              <input
                id="lastDiagnosedDate"
                type="date"
                value={detail.lastDiagnosedDate || ""}
                onChange={(e) =>
                  handleChange("lastDiagnosedDate", e.target.value)
                }
                className={errors.lastDiagnosedDate ? "error" : ""}
              />
              {errors.lastDiagnosedDate && (
                <span className="error-message">
                  {errors.lastDiagnosedDate}
                </span>
              )}
            </div>
          </>
        )}

        {detail.hasMedicalHistory === false && (
          <div className="form-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              value={detail.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className={errors.description ? "error" : ""}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardiacForm;
