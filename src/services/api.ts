import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEFAULT_API_URL = Platform.OS === "android" ? "http://10.0.2.2:8000" : "http://127.0.0.1:8000";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;

const TOKEN_KEY = "mf_access_token";
const USER_KEY = "mf_user_data";

let cachedToken: string | null = null;

export const setStoredToken = async (token: string | null) => {
  cachedToken = token;
  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } else {
    await AsyncStorage.removeItem(TOKEN_KEY);
  }
};

export const getStoredToken = async (): Promise<string | null> => {
  if (cachedToken) return cachedToken;
  try {
    cachedToken = await AsyncStorage.getItem(TOKEN_KEY);
    return cachedToken;
  } catch {
    return null;
  }
};

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getStoredToken();
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}`;
    try {
      const errorData = await response.json();
      if (typeof errorData.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        errorMessage = errorData.detail.map((err: { msg: string }) => err.msg).join(", ");
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (_) {}
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export interface BackendUser {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  location?: string;
}

export interface BackendPharmacy {
  id: number;
  name: string;
  location: string;
  license_number: string;
  pharmacist_name?: string;
  phone?: string;
  email?: string;
  status: string;
  delivery_offered: boolean;
  opening_hours?: string;
  lat?: number;
  lng?: number;
  verified: boolean;
}

export interface BackendMedicine {
  id: number;
  name: string;
  generic_name?: string;
  dosage?: string;
  category?: string;
  description?: string;
  manufacturer?: string;
  image_url?: string;
  dosage_instructions?: string;
  precautions?: string;
  side_effects?: string;
  tags?: string;
}

export interface BackendReservationItem {
  id: number;
  medicine_id: number;
  quantity: number;
  price: number;
  medicine: BackendMedicine;
}

export interface BackendReservation {
  id: number;
  patient_id: number;
  pharmacy_id: number;
  date: string;
  fulfillment_method?: string;
  fulfillment_address?: string;
  fulfillment_time?: string;
  payment_preference?: string;
  status: string;
  total_price: number;
  notes?: string;
  ref_number?: string;
  pharmacy?: BackendPharmacy;
  patient?: BackendUser;
  items: BackendReservationItem[];
}

export const api = {
  async register(data: { name: string; email: string; password: string; phone?: string; location?: string }) {
    const user = await fetchApi<BackendUser>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    // Automatically log in after registration
    return this.login(data.email, data.password);
  },

  async login(email: string, password: string) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const tokenRes = await fetchApi<{ access_token: string; token_type: string }>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (tokenRes.access_token) {
      await setStoredToken(tokenRes.access_token);
    }

    const user = await this.getMe();
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    return { token: tokenRes.access_token, user };
  },

  async logout() {
    await setStoredToken(null);
    await AsyncStorage.removeItem(USER_KEY);
  },

  async getMe() {
    return fetchApi<BackendUser>("/api/auth/me");
  },

  async getMedicines() {
    return fetchApi<BackendMedicine[]>("/api/medicines/");
  },

  async searchMedicines(q: string, lat?: number, lng?: number) {
    let url = `/api/medicines/search?q=${encodeURIComponent(q)}`;
    if (lat !== undefined && lng !== undefined) {
      url += `&lat=${lat}&lng=${lng}`;
    }
    return fetchApi<Array<{
      medicine: BackendMedicine;
      pharmacy: BackendPharmacy;
      inventory: { id: number; price: number; stock_quantity: number; status: string };
      distance_km?: number;
    }>>(url);
  },

  async getPharmacies() {
    return fetchApi<BackendPharmacy[]>("/api/pharmacies/");
  },

  async getReservations() {
    return fetchApi<BackendReservation[]>("/api/reservations/");
  },

  async getReservation(id: number | string) {
    return fetchApi<BackendReservation>(`/api/reservations/${id}`);
  },

  async createReservation(data: {
    pharmacy_id: number;
    items: Array<{ medicine_id: number; quantity: number }>;
    fulfillment_method?: string;
    fulfillment_address?: string;
    fulfillment_time?: string;
    notes?: string;
  }) {
    return fetchApi<BackendReservation>("/api/reservations/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateReservationStatus(id: number | string, status: string) {
    return fetchApi<BackendReservation>(`/api/reservations/${id}/status?status=${encodeURIComponent(status)}`, {
      method: "PATCH",
    });
  },

  async cancelReservation(id: number | string) {
    return fetchApi<BackendReservation>(`/api/reservations/${id}/cancel`, {
      method: "POST",
    });
  },

  async updateReservationFulfillment(
    id: number | string,
    method: string,
    paymentPref: string,
    address?: string
  ) {
    let url = `/api/reservations/${id}/fulfillment?method=${encodeURIComponent(method)}&payment_pref=${encodeURIComponent(paymentPref)}`;
    if (address) {
      url += `&address=${encodeURIComponent(address)}`;
    }
    return fetchApi<BackendReservation>(url, {
      method: "PATCH",
    });
  },

  async initializePayment(reservationId: number | string) {
    return fetchApi<{ authorization_url: string; reference: string }>(`/api/payments/initialize?reservation_id=${reservationId}`, {
      method: "POST",
    });
  },

  async verifyPayment(reference: string) {
    return fetchApi<{ status: string; message: string; reservation_status: string }>(`/api/payments/verify?reference=${encodeURIComponent(reference)}`, {
      method: "POST",
    });
  },
};
