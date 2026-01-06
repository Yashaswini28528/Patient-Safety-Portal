import React from "react";
import { MaternityDetail } from "./types";

interface MaternityFormProps {
  detail: MaternityDetail;
  onChange: (detail: MaternityDetail) => void;
  errors: Record<string, string>;
}

const MaternityForm: React.FC<MaternityFormProps> = ({
  detail,
  onChange,
  errors,
}) => {
  const handleChange = (field: keyof MaternityDetail, value: any) => {
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
          <label htmlFor="lastMenstrualPeriod">Last Menstrual Period *</label>
          <input
            id="lastMenstrualPeriod"
            type="date"
            value={detail.lastMenstrualPeriod || ""}
            onChange={(e) =>
              handleChange("lastMenstrualPeriod", e.target.value)
            }
            className={errors.lastMenstrualPeriod ? "error" : ""}
          />
          {errors.lastMenstrualPeriod && (
            <span className="error-message">{errors.lastMenstrualPeriod}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="weeks">Number of Weeks *</label>
          <input
            id="weeks"
            type="number"
            value={detail.weeks || ""}
            onChange={(e) =>
              handleChange("weeks", parseInt(e.target.value) || 0)
            }
          />
        </div>

        <div className="form-group">
          <label>Significant History</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="significantHistory"
                checked={detail.significantHistory === true}
                onChange={() => handleChange("significantHistory", true)}
              />
              Yes
            </label>
            <label>
              <input
                type="radio"
                name="significantHistory"
                checked={detail.significantHistory === false}
                onChange={() => handleChange("significantHistory", false)}
              />
              No
            </label>
          </div>
        </div>

        {detail.significantHistory === true && (
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
          </>
        )}

        {detail.significantHistory === false && (
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

export default MaternityForm;
