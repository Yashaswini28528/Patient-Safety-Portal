import React, { useEffect, useState } from "react";
import { patientApi } from "../../services/apiService";
import CreatePatientForm from "../CreatePatient/CreatePatientForm";
import { Patient } from "../CreatePatient/types";
import "./Dashboard.css";
import {  toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface DashboardProps {
  onLogout: () => void;
}

interface DashboardStats {
  total: number;
  male: number;
  female: number;
  averageAge: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showActionMenu, setShowActionMenu] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<DashboardStats>({
    total: 0,
    male: 0,
    female: 0,
    averageAge: 0,
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const fetchPatients = async () => {
    try {
      const patientsData = await patientApi.getAll();

      const patientsWithDefaults: Patient[] = patientsData.map((patient) => ({
        ...patient,
        dob: patient.dob || "",
        healthType: patient.healthType || null,
        fatherName: patient.fatherName || "",
      }));

      setPatients(patientsWithDefaults);

      const maleCount = patientsWithDefaults.filter(
        (p) => p.gender.toLowerCase() === "male"
      ).length;
      const femaleCount = patientsWithDefaults.filter(
        (p) => p.gender.toLowerCase() === "female"
      ).length;
      const totalAge = patientsWithDefaults.reduce((sum, p) => sum + p.age, 0);

      setStats({
        total: patientsWithDefaults.length,
        male: maleCount,
        female: femaleCount,
        averageAge:
          patientsWithDefaults.length > 0
            ? Math.round(totalAge / patientsWithDefaults.length)
            : 0,
      });

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch patients. Please try again.");
      setLoading(false);
      console.error("Error fetching patients:", err);
    }
  };

  const handleDelete = async (patientId: number) => {
    if (
      window.confirm("Are you sure you want to delete this patient record?")
    ) {
      try {
        toast.success("Deleted successfully!");     
        await patientApi.delete(patientId);
        setPatients((prev) => prev.filter((p) => p.patientId !== patientId));
        setShowActionMenu(null);
      } catch (err) {
        console.error("Error deleting patient:", err);
        alert("Failed to delete patient. Please try again.");
      }
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setShowCreateModal(true);
    setShowActionMenu(null);
  };

  const handleCreateNew = () => {
    setEditingPatient(null);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditingPatient(null);
    fetchPatients();
  };

  const filteredPatients = patients.filter(
    (patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (patient.fatherName &&
        patient.fatherName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.patientId && patient.patientId.toString().includes(searchTerm))
  );

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".action-menu-container")) {
        setShowActionMenu(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const statCards = [
    {
      value: stats.total,
      label: "Total Patients",
      icon: "👥",
      className: "total-patients",
    },
    {
      value: stats.male,
      label: "Male Patients",
      icon: "👨",
      className: "male-patients",
    },
    {
      value: stats.female,
      label: "Female Patients",
      icon: "👩",
      className: "female-patients",
    },
    {
      value: stats.averageAge,
      label: "Average Age",
      icon: "📊",
      className: "age-icon",
    },
  ];

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <div className="hospital-brand">
            <div className="brand-text">
              <h1>PSI SAFETY</h1>
              <p>Patient Management System</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="user-welcome">
              <span className="welcome-text">Welcome, Medical Staff</span>
            </div>
            <button className="logout-btn" onClick={onLogout}>
              <span className="logout-icon">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-container">
        <div className="stats-container">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className={`stat-icon ${stat.className}`}>
                <span>{stat.icon}</span>
              </div>
              <div className="stat-info">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="patients-section">
          <div className="section-header">
            <div className="section-title">
              <h2>Patient Records</h2>
              <p>Manage and view all patient information</p>
            </div>
            <div className="section-actions">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search patients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button className="create-patient-btn" onClick={handleCreateNew}>
                <span className="btn-icon">+</span>
                Create Patient Details
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading patient records...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <span className="error-icon">⚠️</span>
              <p>{error}</p>
              <button className="retry-btn" onClick={fetchPatients}>
                Try Again
              </button>
            </div>
          ) : (
            <div className="table-container">
              {filteredPatients.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📝</span>
                  <h3>No patients found</h3>
                  <p>
                    {searchTerm
                      ? "Try adjusting your search terms"
                      : "Get started by adding your first patient"}
                  </p>
                  {!searchTerm && (
                    <button
                      className="create-patient-btn"
                      onClick={handleCreateNew}
                    >
                      Add First Patient
                    </button>
                  )}
                </div>
              ) : (
                <table className="patients-table">
                  <thead>
                    <tr>
                      <th>PATIENT ID</th>
                      <th>PATIENT NAME</th>
                      <th>AGE</th>
                      <th>GENDER</th>
                      <th>LAST UPDATED DATE</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient) => (
                      <tr key={patient.patientId}>
                        <td>
                          <span className="patient-id">
                            #{patient.patientId}
                          </span>
                        </td>
                        <td>
                          <div className="patient-name">
                            {patient.firstName} {patient.lastName}
                          </div>
                        </td>
                        <td>
                          <span className="age-badge">{patient.age} yrs</span>
                        </td>
                        <td>
                          <span
                            className={`gender-badge ${patient.gender.toLowerCase()}`}
                          >
                            {patient.gender}
                          </span>
                        </td>
                        <td>
                          {patient.lastUpdated
                            ? new Date(patient.lastUpdated).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            : "N/A"}
                        </td>
                        <td className="actions-column">
                          <div className="action-menu-container">
                            <button
                              className="action-menu-toggle"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowActionMenu(
                                  showActionMenu === patient.patientId
                                    ? null
                                    : patient.patientId || null
                                );
                              }}
                            >
                              <span className="dots">•••</span>
                            </button>
                            {showActionMenu === patient.patientId && (
                              <div className="action-menu">
                                <button
                                  className="action-btn edit-btn"
                                  onClick={() => handleEdit(patient)}
                                >
                                  <span>✏️</span>
                                  Edit
                                </button>
                                <button
                                  className="action-btn delete-btn"
                                  onClick={() =>
                                    patient.patientId &&
                                    handleDelete(patient.patientId)
                                  }
                                >
                                  <span>🗑️</span>
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-content">
              <CreatePatientForm
                editingPatient={editingPatient || undefined}
                onClose={handleCloseModal}
                onPatientSaved={fetchPatients}
              />
            </div>
          </div>
        </div>
      )}

      <footer className="dashboard-footer">
        <div className="footer-content">
          <p>
            &copy; 2025 PSI Safety Hospital Management System. Providing quality
            care.
          </p>
          <div className="footer-links">
            <span>Emergency: 📞 911</span>
            <span>Support: 📧 support@psisafety.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
