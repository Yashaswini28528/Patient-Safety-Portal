import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  patientApi,
  addressApi,
  patientDetailsApi,
} from "../../services/apiService";
import {
  formatDateForInput,
  detectHealthType,
  mapAddressFields,
  getAuthToken,
} from "../../utils/helpers";
import {
  Address,
  Patient,
  HealthType,
  MaternityDetail,
  DiabeticDetail,
  CardiacDetail,
  CreatePatientFormProps,
  ApiAddress,
  ApiPatientDetails,
} from "../CreatePatient/types";
import MaternityForm from "./MaternityForm";
import DiabeticForm from "./DiabeticForm";
import CardiacForm from "./CardiacForm";
import "./CreatePatientForm.css";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreatePatientForm: React.FC<CreatePatientFormProps> = ({
  editingPatient,
  onClose,
  onPatientSaved,
}) => {
  const location = useLocation();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [healthTypeDetected, setHealthTypeDetected] = useState(false);

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    fatherName: "",
    age: 0,
    gender: "Male",
    dob: "",
  });

  const [currentAddress, setCurrentAddress] = useState<Address>({
    homeFlatNo: "",
    streetNo: "",
    town: "",
    fullAddress: "",
  });

  const [healthType, setHealthType] = useState<HealthType>("Maternity");
  const [existingAddressIds, setExistingAddressIds] = useState<{current: number | null;}>({current: null,});

  const [maternityDetail, setMaternityDetail] = useState<MaternityDetail>({
    bloodPressure: "",
    weight: "",
    lastMenstrualPeriod: "",
    weeks: 0,
    significantHistory: undefined,
    description: "",
    report: null,
    reportName: "",
    reportUrl: "",
    histories: [],
  });

  const [diabeticDetail, setDiabeticDetail] = useState<DiabeticDetail>({
    bloodPressure: "",
    heartRate: "",
    weight: "",
    currentSymptoms: "",
    treatmentDate: "",
    familyHistory: "",
    hasMedicalHistory: undefined,
    previousDoctor: "",
    hospitalDetails: "",
    lastDiagnosedDate: "",
    description: "",
    report: null,
    reportName: "",
    reportUrl: "",
    histories: [],
  });

  const [cardiacDetail, setCardiacDetail] = useState<CardiacDetail>({
    bloodPressure: "",
    heartRate: "",
    weight: "",
    currentSymptoms: "",
    treatmentDate: "",
    familyHistory: "",
    hasMedicalHistory: undefined,
    previousDoctor: "",
    hospitalDetails: "",
    lastDiagnosedDate: "",
    description: "",
    report: null,
    reportName: "",
    reportUrl: "",
    histories: [],
  });

  const handleCurrentAddressChange = (field: keyof Address, value: string) => {
    const updatedAddress = { ...currentAddress, [field]: value };
    setCurrentAddress(updatedAddress);
  };



  const fetchAddresses = async (patientId: number) => {
  try {
    const addresses = await addressApi.getByPatientId(patientId);

    let currentAddressData: ApiAddress = {} as ApiAddress;
    let currentAddressId: number | null = null;

    console.log("Raw addresses response:", addresses);
    console.log("Looking for patientId:", patientId);

    if (Array.isArray(addresses)) {
      
      const patientAddress = addresses.find(
        (addr) => addr.patientId === patientId
      );

      if (patientAddress) {
        currentAddressData = patientAddress;
        currentAddressId = patientAddress.addressId || (patientAddress as any).id || null;
        
        console.log("Found address for patient:", {
          patientAddress,
          currentAddressId
        });
      } else if (addresses.length > 0) {
        
        currentAddressData = addresses[0];
        currentAddressId = addresses[0].addressId || (addresses[0] as any).id || null;
      }
    } else if (addresses && typeof addresses === 'object') {
    
      const addr = addresses as any;
      
      if (addr.patientId === patientId) {
        currentAddressData = addresses as ApiAddress;
        currentAddressId = addr.addressId || addr.id || null;
      }
    }

    const newCurrentAddress = mapAddressFields(currentAddressData);

    setCurrentAddress(newCurrentAddress);
    setExistingAddressIds({
      current: currentAddressId,
    });

    console.log("Final address state:", {
      currentAddress: newCurrentAddress,
      currentAddressId
    });

    return {
      success: true,
      current: newCurrentAddress,
    };
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return { success: false, error };
  }
};

  const loadHealthDetails = async (
    patientId: number,
    healthType: HealthType
  ) => {
    try {
      const healthData = await patientDetailsApi.getByPatientId(patientId);
      let details: ApiPatientDetails = Array.isArray(healthData)
        ? healthData.find((item) => item.patientId === patientId) ||
          healthData[0] ||
          {}
        : healthData;

      const mapCommonFields = (data: ApiPatientDetails) => ({
        bloodPressure: data.bloodPressure?.toString() || "",
        weight: data.weight?.toString() || "",
        description: data.description || "",
        histories: [],
        reportName: data.report || "",
        reportUrl: "",
        report: null,
      });

      switch (healthType) {
        case "Maternity":
          setMaternityDetail({
            ...mapCommonFields(details),
            lastMenstrualPeriod: formatDateForInput(
              details.lastMenstrualPeriod || ""
            ),
            weeks: details.numberOfWeeks || 0,
            significantHistory:
              details.significantHistory !== undefined
                ? Boolean(details.significantHistory)
                : undefined,
            detailId: details.detailId,
            maternityId: details.maternityId,
          });
          break;
        case "Diabetic":
          setDiabeticDetail({
            ...mapCommonFields(details),
            heartRate: details.heartRate?.toString() || "",
            currentSymptoms: details.currentSymptoms || "",
            treatmentDate: formatDateForInput(details.treatmentDate || ""),
            familyHistory: details.familyHistory || "",
            hasMedicalHistory:
              details.medicalHistory !== undefined
                ? Boolean(details.medicalHistory)
                : undefined,
            previousDoctor: details.previousDoctor || "",
            hospitalDetails: details.hospitalDetails || "",
            lastDiagnosedDate: formatDateForInput(
              details.lastDiagnosedDate || ""
            ),
            detailId: details.detailId,
            diabeticId: details.diabeticId,
          });
          break;
        case "Cardiac":
          setCardiacDetail({
            ...mapCommonFields(details),
            heartRate: details.heartRate?.toString() || "",
            currentSymptoms: details.currentSymptoms || "",
            treatmentDate: formatDateForInput(details.treatmentDate || ""),
            familyHistory: details.familyHistory || "",
            hasMedicalHistory:
              details.medicalHistory !== undefined
                ? Boolean(details.medicalHistory)
                : undefined,
            previousDoctor: details.previousDoctor || "",
            hospitalDetails: details.hospitalDetails || "",
            lastDiagnosedDate: formatDateForInput(
              details.lastDiagnosedDate || ""
            ),
            detailId: details.detailId,
            cardiacId: details.cardiacId,
          });
          break;
      }
    } catch (error) {
      console.error("Error loading health details:", error);
    }
  };

  useEffect(() => {
  const loadPatientData = async () => {
    if (!editingPatient) {
      setIsLoading(false);
      setHealthTypeDetected(true);
      return;
    }

    try {
      const patientId = editingPatient.patientId;
      if (!patientId) throw new Error("No patientId found");

      console.log("Loading patient data for ID:", patientId);

      setPersonalInfo({
        firstName: editingPatient.firstName || "",
        lastName: editingPatient.lastName || "",
        fatherName: editingPatient.fatherName || "",
        age: editingPatient.age || 0,
        gender: editingPatient.gender || "Male",
        dob: formatDateForInput(editingPatient.dob || ""),
      });

      const addressResult = await fetchAddresses(patientId);
      console.log("Address fetch result:", addressResult);

      let finalHealthType: HealthType = "Maternity";
      if (editingPatient.healthType) {
        finalHealthType = detectHealthType(editingPatient.healthType);
      } else if (location.state?.healthType) {
        finalHealthType = location.state.healthType;
      }

      setHealthType(finalHealthType);
      setHealthTypeDetected(true);
      await loadHealthDetails(patientId, finalHealthType);
    } catch (error) {
      console.error("Error loading patient data:", error);
      alert("Failed to load patient data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  loadPatientData();
}, [editingPatient, location.state]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!personalInfo.firstName.trim())
      newErrors.firstName = "First Name is required";
    if (!personalInfo.lastName.trim())
      newErrors.lastName = "Last Name is required";
    if (!personalInfo.fatherName.trim())
      newErrors.fatherName = "Father's Name is required";
    if (!personalInfo.age || personalInfo.age <= 0)
      newErrors.age = "Valid Age is required";
    if (!personalInfo.gender) newErrors.gender = "Gender is required";

    if (!currentAddress.homeFlatNo.trim())
      newErrors.currentHomeFlatNo = "Current Home/Flat Number is required";
    if (!currentAddress.streetNo.trim())
      newErrors.currentStreetNo = "Current Street is required";
    if (!currentAddress.town.trim())
      newErrors.currentTown = "Current Town/City is required";
    if (!currentAddress.fullAddress.trim())
      newErrors.currentFullAddress = "Current Full Address is required";

    const healthDetail =
      healthType === "Maternity"
        ? maternityDetail
        : healthType === "Diabetic"
        ? diabeticDetail
        : cardiacDetail;

    if (!healthDetail.bloodPressure?.toString().trim())
      newErrors.bloodPressure = "Blood Pressure is required";
    if (!healthDetail.weight?.toString().trim())
      newErrors.weight = "Weight is required";

    if (healthType === "Maternity") {
      if (!maternityDetail.lastMenstrualPeriod)
        newErrors.lastMenstrualPeriod = "Last Menstrual Period is required";
      if (
        maternityDetail.significantHistory === true &&
        !maternityDetail.description?.trim()
      ) {
        newErrors.description =
          "Description is required when Significant History is Yes";
      }
    } else {
      const detail = healthType === "Diabetic" ? diabeticDetail : cardiacDetail;
      if (!detail.heartRate?.toString().trim())
        newErrors.heartRate = "Heart Rate is required";
      if (!detail.currentSymptoms?.trim())
        newErrors.currentSymptoms = "Current Symptoms are required";
      if (!detail.familyHistory?.trim())
        newErrors.familyHistory = "Family History is required";

      if (detail.hasMedicalHistory === false && !detail.description?.trim()) {
        newErrors.description =
          "Description is required when Medical History is No";
      }
      if (detail.hasMedicalHistory === true) {
        if (!detail.previousDoctor?.trim())
          newErrors.previousDoctor = "Previous Doctor is required";
        if (!detail.hospitalDetails?.trim())
          newErrors.hospitalDetails = "Hospital Details are required";
        if (!detail.lastDiagnosedDate)
          newErrors.lastDiagnosedDate = "Last Diagnosed Date is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveAddresses = async (patientId: number) => {
  try {
    console.log("Saving addresses with existing IDs:", existingAddressIds);
    console.log("Current Address:", currentAddress);

    const currentAddressData: Partial<Address> = {
      addressId: existingAddressIds.current || undefined,
      patientId,
      type: "Current",
      homeFlatNo: currentAddress.homeFlatNo || undefined,
      streetNo: currentAddress.streetNo || undefined,
      town: currentAddress.town || undefined,
      fullAddress: currentAddress.fullAddress || undefined,
    };

    console.log("Current Address Data to Save:", currentAddressData);

    
    if (existingAddressIds.current) {
      console.log(`🔄 UPDATING current address with ID: ${existingAddressIds.current}`);
      const result = await addressApi.update(existingAddressIds.current, currentAddressData);
      console.log("✅ Current address update result:", result);
    } else {
      console.log("🆕 CREATING new current address");
      const result = await addressApi.create(currentAddressData);
      console.log("✅ Current address create result:", result);
    }

    console.log("🎉 Address saved successfully");
  } catch (error) {
    console.error("❌ Error saving address:", error);
    throw new Error(`Failed to save address: ${error}`);
  }
};

  const mapHealthDataForApi = (
    healthType: HealthType,
    detail: any,
    patientId: number
  ): any => {
    const baseData = {
      patientId,
      healthType,
      report: detail.reportName || detail.reportUrl || null,
    };

    const commonFields = {
      bloodPressure: detail.bloodPressure || null,
      weight: detail.weight ? parseFloat(detail.weight) : null,
      description: detail.description || null,
    };

    switch (healthType) {
      case "Maternity":
        return {
          ...baseData,
          ...commonFields,
          detailId: detail.detailId || detail.maternityId,
          lastMenstrualPeriod: detail.lastMenstrualPeriod
            ? new Date(detail.lastMenstrualPeriod).toISOString()
            : null,
          numberOfWeeks: detail.weeks || 0,
          significantHistory:
            detail.significantHistory !== undefined
              ? detail.significantHistory
              : null,
        };
      case "Diabetic":
        return {
          ...baseData,
          ...commonFields,
          detailId: detail.detailId || detail.diabeticId,
          heartRate: detail.heartRate ? parseInt(detail.heartRate) : null,
          currentSymptoms: detail.currentSymptoms || null,
          treatmentDate: detail.treatmentDate
            ? new Date(detail.treatmentDate).toISOString()
            : null,
          familyHistory: detail.familyHistory || null,
          medicalHistory:
            detail.hasMedicalHistory !== undefined
              ? detail.hasMedicalHistory
              : null,
          previousDoctor: detail.previousDoctor || null,
          hospitalDetails: detail.hospitalDetails || null,
          lastDiagnosedDate: detail.lastDiagnosedDate
            ? new Date(detail.lastDiagnosedDate).toISOString()
            : null,
        };
      case "Cardiac":
        return {
          ...baseData,
          ...commonFields,
          detailId: detail.detailId || detail.cardiacId,
          heartRate: detail.heartRate ? parseInt(detail.heartRate) : null,
          currentSymptoms: detail.currentSymptoms || null,
          treatmentDate: detail.treatmentDate
            ? new Date(detail.treatmentDate).toISOString()
            : null,
          familyHistory: detail.familyHistory || null,
          medicalHistory:
            detail.hasMedicalHistory !== undefined
              ? detail.hasMedicalHistory
              : null,
          previousDoctor: detail.previousDoctor || null,
          hospitalDetails: detail.hospitalDetails || null,
          lastDiagnosedDate: detail.lastDiagnosedDate
            ? new Date(detail.lastDiagnosedDate).toISOString()
            : null,
        };
      default:
        return baseData;
    }
  };

  const saveHealthDetails = async (patientId: number) => {
    let healthDetail: any;
    switch (healthType) {
      case "Maternity":
        healthDetail = { ...maternityDetail };
        break;
      case "Diabetic":
        healthDetail = { ...diabeticDetail };
        break;
      case "Cardiac":
        healthDetail = { ...cardiacDetail };
        break;
    }

    if (healthDetail.report instanceof File) {
      healthDetail.reportName = healthDetail.report.name;
    }

    const healthData = mapHealthDataForApi(healthType, healthDetail, patientId);

    const detailId = (healthData as any).detailId;
    if (detailId) {
      await patientDetailsApi.update(detailId, healthData);
    } else {
      await patientDetailsApi.create(healthData);
    }
  };

  const handleSave = async () => {
    setErrors({});

    if (!validateForm()) {
      alert("Please fix the validation errors before saving.");
      return;
    }

    try {
      getAuthToken();

      const patientData: Partial<Patient> = {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        fatherName: personalInfo.fatherName.trim() || null,
        age: personalInfo.age || 0,
        gender: personalInfo.gender,
        dob: personalInfo.dob ? new Date(personalInfo.dob).toISOString() : null,
        healthType: healthType,
      };

      const patientDataupdate: Partial<Patient> = {
        patientId: editingPatient?.patientId,
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        fatherName: personalInfo.fatherName.trim() || null,
        age: personalInfo.age || 0,
        gender: personalInfo.gender,
        dob: personalInfo.dob ? new Date(personalInfo.dob).toISOString() : null,
        healthType: healthType,
      };

      
      let patientId = editingPatient?.patientId;

      if (patientId) {
        await patientApi.update(patientId, patientDataupdate);
      } else {
        const newPatient = await patientApi.create(patientData);
        patientId = newPatient.patientId;
        if (!patientId)
          throw new Error("Patient creation returned no patientId");
      }

      await saveAddresses(patientId);
      await saveHealthDetails(patientId);

      toast.success("Patient saved successfully!");
      onPatientSaved();
      onClose();
    } catch (error: any) {
      console.error("Save error:", error);
      alert(`Save failed: ${error.message}`);
    }
  };

  const handleHealthTypeChange = (newHealthType: HealthType) => {
    setHealthType(newHealthType);
    setErrors({});
  };

  if (
    (isLoading && editingPatient) ||
    (editingPatient && !healthTypeDetected)
  ) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading patient data...</p>
      </div>
    );
  }

  return (
    <div className="create-patient-page modal-version">
      <div className="form-header">
        <div className="header-content">
          <h1>
            <i className="icon-patient"></i>
            {editingPatient ? "Edit Patient Record" : "Create New Patient"}
          </h1>
          <p>
            {editingPatient
              ? "Update patient information, addresses, and health details below."
              : "Fill in the patient's personal information, addresses, and health details below."}
          </p>
        </div>
        <button className="close-button" onClick={onClose}>
          <i className="icon-close"></i>
        </button>
      </div>

      <div className="form-container">
        <section className="form-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name *</label>
              <input
                id="firstName"
                type="text"
                value={personalInfo.firstName}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    firstName: e.target.value,
                  })
                }
                className={errors.firstName ? "error" : ""}
              />
              {errors.firstName && (
                <span className="error-message">{errors.firstName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name *</label>
              <input
                id="lastName"
                type="text"
                value={personalInfo.lastName}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, lastName: e.target.value })
                }
                className={errors.lastName ? "error" : ""}
              />
              {errors.lastName && (
                <span className="error-message">{errors.lastName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fatherName">Father's Name *</label>
              <input
                id="fatherName"
                type="text"
                value={personalInfo.fatherName}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    fatherName: e.target.value,
                  })
                }
                className={errors.fatherName ? "error" : ""}
              />
              {errors.fatherName && (
                <span className="error-message">{errors.fatherName}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="age">Age *</label>
              <input
                id="age"
                type="number"
                value={personalInfo.age || ""}
                onChange={(e) =>
                  setPersonalInfo({
                    ...personalInfo,
                    age: parseInt(e.target.value) || 0,
                  })
                }
                className={errors.age ? "error" : ""}
              />
              {errors.age && (
                <span className="error-message">{errors.age}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender *</label>
              <select
                id="gender"
                value={personalInfo.gender}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, gender: e.target.value })
                }
                className={errors.gender ? "error" : ""}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <span className="error-message">{errors.gender}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                value={personalInfo.dob}
                onChange={(e) =>
                  setPersonalInfo({ ...personalInfo, dob: e.target.value })
                }
              />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Address Information</h2>

          <div className="address-section">
            <h3>Current Address</h3>
            <div className="form-grid">
              {["homeFlatNo", "streetNo", "town"].map((field) => (
                <div key={field} className="form-group">
                  <label htmlFor={`current${field}`}>
                    {field === "homeFlatNo"
                      ? "Home/Flat No *"
                      : field === "streetNo"
                      ? "Street No *"
                      : "Town/City *"}
                  </label>
                  <input
                    id={`current${field}`}
                    type="text"
                    value={currentAddress[field as keyof Address]}
                    onChange={(e) =>
                      handleCurrentAddressChange(
                        field as keyof Address,
                        e.target.value
                      )
                    }
                    className={
                      errors[
                        `current${
                          field.charAt(0).toUpperCase() + field.slice(1)
                        }`
                      ]
                        ? "error"
                        : ""
                    }
                  />
                  {errors[
                    `current${field.charAt(0).toUpperCase() + field.slice(1)}`
                  ] && (
                    <span className="error-message">
                      {
                        errors[
                          `current${
                            field.charAt(0).toUpperCase() + field.slice(1)
                          }`
                        ]
                      }
                    </span>
                  )}
                </div>
              ))}

              <div className="form-group full-width">
                <label htmlFor="currentFullAddress">Full Address *</label>
                <textarea
                  id="currentFullAddress"
                  value={currentAddress.fullAddress}
                  onChange={(e) =>
                    handleCurrentAddressChange("fullAddress", e.target.value)
                  }
                  rows={3}
                  className={errors.currentFullAddress ? "error" : ""}
                />
                {errors.currentFullAddress && (
                  <span className="error-message">
                    {errors.currentFullAddress}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Health Condition Type</h2>
          <div className="health-type-selector">
            {(["Maternity", "Diabetic", "Cardiac"] as HealthType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  className={`health-type-btn ${
                    healthType === type ? "active" : ""
                  }`}
                  onClick={() => handleHealthTypeChange(type)}
                >
                  <i className={`icon-${type.toLowerCase()}`}></i>
                  {type}
                </button>
              )
            )}
          </div>
        </section>

        <section className="form-section">
          <h2>Health Details - {healthType}</h2>

          {healthType === "Maternity" && (
            <MaternityForm
              detail={maternityDetail}
              onChange={setMaternityDetail}
              errors={errors}
            />
          )}

          {healthType === "Diabetic" && (
            <DiabeticForm
              detail={diabeticDetail}
              onChange={setDiabeticDetail}
              errors={errors}
            />
          )}

          {healthType === "Cardiac" && (
            <CardiacForm
              detail={cardiacDetail}
              onChange={setCardiacDetail}
              errors={errors}
            />
          )}
        </section>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleSave}>
            {editingPatient ? "Update Patient" : "Create Patient"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePatientForm;