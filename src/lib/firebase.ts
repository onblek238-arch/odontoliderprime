import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum AppointmentStatus {
  PENDING = 'pending',
  PATIENT_CONFIRMED = 'patient_confirmed',
  PATIENT_CANCELLED = 'patient_cancelled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientWhatsApp: string;
  treatment: string;
  unit: 'Unidade I' | 'Unidade II';
  date: string;
  time: string;
  status: AppointmentStatus;
  notes: string;
  protocol?: string;
  patientAccessToken?: string;
  patientActionAt?: any;
  lastPatientActionToken?: string;
  patientRG?: string;
  patientCPF?: string;
  patientAddress?: string;
  patientBirthDate?: string;
  guardianName?: string;
  guardianCPF?: string;
  createdAt: any;
  updatedAt: any;
}
