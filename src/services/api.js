import axios from 'axios';
import { authHeader } from './auth';

const DEFAULT_API_BASE = 'http://localhost:8080/api';
const API_BASE = (process.env.REACT_APP_API_BASE_URL || DEFAULT_API_BASE).replace(/\/+$/, '');

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use((config) => {
  const token = authHeader().Authorization;
  if (!config.headers) config.headers = {};
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

function wrapError(e) {
  const message = e.response?.data?.message || e.response?.statusText || e.message || 'Request failed';
  const err = new Error(message);
  err.status = e.response?.status;
  err.data = e.response?.data;
  return err;
}

async function request(endpoint, options = {}) {
  try {
    const response = await client.request({
      url: endpoint,
      method: options.method || 'GET',
      data: options.body,
      responseType: options.responseType,
      headers: options.headers,
    });
    return response.data;
  } catch (e) {
    const err = wrapError(e);
    if (err.status === 403) {
      err.message = 'Forbidden: You do not have permission to perform this action. Please login as Doctor or Admin.';
    }
    throw err;
  }
}

export const api = {
  register: (user) => request('/auth/register', { method: 'POST', body: user }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getUsers: () => request('/users', { method: 'GET' }),
  getDashboard: () => request('/dashboard', { method: 'GET' }),

  // Patients
  // If a query is provided, use the /search endpoint. Otherwise, return all patients.
  getPatients: (query) =>
    request(query ? `/patients/search?q=${encodeURIComponent(query)}` : '/patients', { method: 'GET' }),
  getPatientById: (id) => request(`/patients/${id}`, { method: 'GET' }),
  createPatient: (patient) => request('/patients', { method: 'POST', body: patient }),
  updatePatient: (id, patient) => request(`/patients/${id}`, { method: 'PUT', body: patient }),

  // Appointments
  createAppointment: (appointment) => request('/appointments', { method: 'POST', body: appointment }),
  getAppointmentsByPatient: (patientId) => request(`/appointments/patient/${patientId}`, { method: 'GET' }),
  getAppointmentsByDoctor: (doctorId) => request(`/appointments/doctor/${doctorId}`, { method: 'GET' }),

  // Prescriptions
  createPrescription: (prescription) => request('/prescriptions', { method: 'POST', body: prescription }),
  createPrescriptionFromVoice: (payload) => request('/prescriptions/from-voice', { method: 'POST', body: payload }),
  getPrescriptionsByPatient: (patientId) => request(`/prescriptions/patient/${patientId}`, { method: 'GET' }),
  downloadPrescriptionPdf: (id) => request(`/prescriptions/${id}/pdf`, { method: 'GET', headers: { Accept: 'application/pdf' }, responseType: 'arraybuffer' }),

  // Medical history
  getMedicalHistoryByPatient: (patientId) => request(`/medical-history/patient/${patientId}`, { method: 'GET' }),

  // Symptom Analysis
  analyzeSymptoms: (query) => request('/symptom-analysis/analyze', { method: 'POST', body: query }),
  getQueryHistory: () => request('/symptom-analysis/history', { method: 'GET' }),
  getPatientQueryHistory: (patientId) => request(`/symptom-analysis/patient/${patientId}/history`, { method: 'GET' }),

  // Health Tips
  getHealthTips: () => request('/health-tips', { method: 'GET' }),
};
