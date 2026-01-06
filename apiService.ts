import axios from "axios";
import {
  Patient,
  Address,
  ApiPatientDetails,
} from "../components/CreatePatient/types";

const BASE_URL = "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

export const apiService = {
  get: <T>(url: string, params?: any) =>
    apiClient.get<T>(url, { params }).then((response) => response.data),

  post: <T>(url: string, data?: any) =>
    apiClient.post<T>(url, data).then((response) => response.data),

  put: <T>(url: string, data?: any) =>
    apiClient.put<T>(url, data).then((response) => response.data),

  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((response) => response.data),
};

export const patientApi = {
  getAll: () => apiService.get<Patient[]>("/Patients"),
  getById: (id: number) => apiService.get<Patient>(`/Patients/${id}`),
  create: (data: Partial<Patient>) =>
    apiService.post<Patient>("/Patients", data),
  update: (id: number, data: Partial<Patient>) =>
    apiService.put<Patient>(`/Patients/${id}`, data),
  delete: (id: number) => apiService.delete(`/Patients/${id}`),
};


export const addressApi = {
  getByPatientId: (patientId: number) => 
    apiService.get<any[]>(`/Addresses?patientId=${patientId}`),
  
  create: (data: Partial<Address>) => 
    apiService.post<Address>("/Addresses", data),
  
  update: (id: number, data: Partial<Address>) => 
    apiService.put<Address>(`/Addresses/${id}`, data),
};

export const patientDetailsApi = {
  getByPatientId: (patientId: number) =>
    apiService.get<ApiPatientDetails | ApiPatientDetails[]>(
      `/PatientDetails?patientId=${patientId}`
    ),
  create: (data: any) => apiService.post<any>("/PatientDetails", data),
  update: (id: number, data: any) =>
    apiService.put<any>(`/PatientDetails/${id}`, data),
};

export const authApi = {
  login: (credentials: { username: string; password: string }) =>
    apiService.post<{ token: string }>("/Auth/login", credentials),
};
