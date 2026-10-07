import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getStoredToken, BackendReservation, BackendMedicine, BackendPharmacy, BackendUser, BackendNotification } from "@/services/api";
import { Coordinates, calculateDistance, formatDistance } from "@/utils/distance";
import { isPharmacyOpen } from "@/utils/date";
import {
  LocationPermissionStatus,
  requestLocationPermission,
  checkLocationPermission,
  getCurrentUserLocation,
  watchUserLocation,
} from "@/services/location";

export interface Medicine {
  id: string;
  rawMedicineId?: number;
  name: string;
  genericName: string;
  strength?: string;
  dosageForm?: string;
  routeOfAdministration?: string;
  category: string;
  therapeuticCategory?: string;
  manufacturer?: string;
  requiresPrescription?: boolean;
  inStock: boolean;
  price: number;
  pharmacy: string;
  pharmacyId: string;
  distance: string;
  distanceKm?: number | null;
  rating: number;
  reviews: number;
  description?: string;
  dosage?: string;
  dosageInstructions?: string;
  precautions?: string;
  sideEffects?: string;
  tags?: string;
  imageUrl?: string;
  matchedBy?: string;
  aliases?: string[];
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  distanceKm?: number | null;
  rating: number;
  reviews: number;
  isOpen: boolean;
  openHours: string;
  phone: string;
  verified: boolean;
  status?: string;
  lat?: number;
  lng?: number;
  imageUrl?: string;
  logoUrl?: string;
}

export interface Reservation {
  id: string;
  rawId?: number;
  medicineId: string;
  medicineName: string;
  pharmacyName: string;
  pharmacyId: string;
  fulfillmentMethod?: "Pickup" | "Delivery";
  fulfillmentAddress?: string;
  fulfillmentTime?: string;
  paymentMethod?: "PAYSTACK" | "CASH" | string;
  paymentStatus?: "UNPAID" | "PENDING" | "PAID" | "FAILED" | "REFUNDED" | string;
  status:
  | "Pending Pharmacy Review"
  | "Approved"
  | "Reserved"
  | "Paid"
  | "Ready for Pickup"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Collected"
  | "Cancelled"
  | "Expired";
  date: string;
  pickupDate?: string;
  notes?: string;
  rejectionReason?: string;
  refNumber: string;
  reservationCode?: string;
  expiresAt?: string;
  paidAt?: string;
  quantity: number;
  totalPrice?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
}

interface AppContextType {
  user: User | null;
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  reservations: Reservation[];
  loading: boolean;
  searchLoading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userLocation: Coordinates | null;
  locationPermission: LocationPermissionStatus;
  requestLocationAccess: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, location?: string) => Promise<boolean>;
  createReservation: (
    medicine: Medicine,
    qty: number,
    pickupDate: string,
    notes: string,
    paymentMethod?: "PAYSTACK" | "CASH"
  ) => Promise<Reservation | null>;
  approveReservation: (id: string) => Promise<void>;
  updateFulfillmentAndPayment: (
    id: string,
    fulfillmentMethod: "Pickup" | "Delivery",
    paymentMethod: string,
    address?: string
  ) => Promise<void>;
  initializePaystackPayment: (
    reservationId: string | number
  ) => Promise<{ authorization_url: string; reference: string; is_mock: boolean }>;
  verifyPaystackPayment: (reference: string) => Promise<boolean>;
  markReservationPaid: (id: string) => Promise<void>;
  advanceReservationStatus: (id: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  clearReservation: (id: string) => Promise<void>;
  clearAllFinishedReservations: () => Promise<void>;
  refreshReservations: (currentPharmacies?: Pharmacy[]) => Promise<void>;
  refreshData: () => Promise<void>;
  savedPharmacies: string[];
  toggleSavePharmacy: (id: string) => void;
  searchLiveMedicines: (query: string, category?: string) => Promise<Medicine[]>;
  notifications: BackendNotification[];
  unreadCount: number;
  notificationsLoading: boolean;
  notificationsRefreshing: boolean;
  refreshNotifications: () => Promise<void>;
  markNotificationRead: (id: number) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  clearAllNotifications: (readOnly?: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mapStatus = (status: string | undefined): Reservation["status"] => {
  switch (status) {
    case "Pending":
    case "Pending Approval":
    case "Pending Pharmacy Review":
      return "Pending Pharmacy Review";
    case "Approved":
    case "Confirmed":
      return "Approved";
    case "Reserved":
      return "Reserved";
    case "Paid":
      return "Paid";
    case "Ready":
    case "Ready for Pickup":
      return "Ready for Pickup";
    case "Preparing":
      return "Preparing";
    case "Out for Delivery":
      return "Out for Delivery";
    case "Delivered":
      return "Delivered";
    case "Picked Up":
    case "Collected":
    case "Completed":
      return "Collected";
    case "Cancelled":
    case "Rejected":
      return "Cancelled";
    case "Expired":
      return "Expired";
    default:
      return "Pending Pharmacy Review";
  }
};

const transformBackendReservation = (
  br: BackendReservation,
  pharmaciesList: Pharmacy[] = []
): Reservation => {
  const pharmacyMatch = pharmaciesList.find((p) => p.id === String(br.pharmacy_id));
  const pharmacyName = br.pharmacy?.name || pharmacyMatch?.name || "Selected Pharmacy";

  const firstItem = br.items && br.items.length > 0 ? br.items[0] : null;
  const medicineName = firstItem?.medicine?.name || "Medicine Order";
  const medicineId = firstItem ? String(firstItem.medicine_id) : "1";
  const quantity = firstItem ? firstItem.quantity : 1;

  const resCode = br.reservation_code || br.ref_number || `MF-${br.id}`;

  return {
    id: String(br.id),
    rawId: br.id,
    medicineId,
    medicineName,
    pharmacyName,
    pharmacyId: String(br.pharmacy_id),
    fulfillmentMethod: (br.fulfillment_method === "Delivery" ? "Delivery" : "Pickup") as "Pickup" | "Delivery",
    fulfillmentAddress: br.fulfillment_address,
    fulfillmentTime: br.fulfillment_time,
    paymentMethod: br.payment_method || (br.payment_preference === "Pay Online" ? "PAYSTACK" : br.payment_preference === "Pay at Pharmacy" || br.payment_preference === "Pay on Delivery" ? "CASH" : undefined),
    paymentStatus: br.payment_status || "UNPAID",
    status: mapStatus(br.status),
    date: br.date ? new Date(br.date).toISOString() : new Date().toISOString(),
    pickupDate: br.fulfillment_time,
    notes: br.notes,
    rejectionReason: br.rejection_reason || undefined,
    refNumber: br.ref_number || resCode,
    reservationCode: resCode,
    expiresAt: br.expires_at,
    paidAt: br.paid_at,
    quantity,
    totalPrice: br.total_price,
  };
};


export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [clearedReservationIds, setClearedReservationIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [savedPharmacies, setSavedPharmacies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notificationsLoading, setNotificationsLoading] = useState<boolean>(false);
  const [notificationsRefreshing, setNotificationsRefreshing] = useState<boolean>(false);

  // Live GPS Location state
  const [userLocation, setUserLocation] = useState<Coordinates | null>(null);
  const [locationPermission, setLocationPermission] = useState<LocationPermissionStatus>("undetermined");

  const requestLocationAccess = async (): Promise<boolean> => {
    try {
      const result = await getCurrentUserLocation();
      setLocationPermission(result.status);
      if (result.coords) {
        setUserLocation(result.coords);
        return true;
      }
      return false;
    } catch {
      setLocationPermission("denied");
      return false;
    }
  };

  const searchLiveMedicines = useCallback(
    async (query: string, category?: string): Promise<Medicine[]> => {
      try {
        const searchResults = await api.searchMedicines(
          query,
          userLocation ? userLocation.latitude : undefined,
          userLocation ? userLocation.longitude : undefined,
          category
        );

        if (Array.isArray(searchResults)) {
          const transformed: Medicine[] = searchResults
            .filter((item) => {
              const pharma = item.pharmacy;
              return pharma && (!pharma.status || pharma.status.toLowerCase() === "approved");
            })
            .map((item) => {
              const med = item.medicine;
              const pharma = item.pharmacy;
              const inv = item.inventory;
              const distKm = userLocation
                ? calculateDistance(userLocation.latitude, userLocation.longitude, pharma.lat, pharma.lng)
                : (item.distance_km ?? null);

              return {
                id: `${med.id}-${pharma.id}`,
                rawMedicineId: med.id,
                name: med.name,
                genericName: med.generic_name || med.name,
                strength: med.strength || med.dosage || "",
                dosageForm: med.dosage_form || "",
                routeOfAdministration: med.route_of_administration || "",
                category: med.therapeutic_category || med.category || "General",
                therapeuticCategory: med.therapeutic_category || med.category || "General",
                manufacturer: med.manufacturer || "",
                requiresPrescription: !!med.requires_prescription,
                inStock: (inv?.stock_quantity ?? 0) > 0,
                price: inv?.price ?? 15.0,
                pharmacy: pharma.name,
                pharmacyId: String(pharma.id),
                distance: formatDistance(distKm),
                distanceKm: distKm,
                rating: 4.8,
                reviews: 18,
                description: med.description || "",
                dosage: med.dosage || med.strength || "",
                dosageInstructions: med.dosage_instructions || "",
                precautions: med.precautions || "",
                sideEffects: med.side_effects || "",
                tags: med.tags || "",
                imageUrl: med.image_url || undefined,
                matchedBy: med.matched_by,
                aliases: med.aliases ? med.aliases.map((a) => a.alias) : [],
              };
            });

          return transformed;
        }
        return [];
      } catch {
        return [];
      }
    },
    [userLocation]
  );

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setSearchLoading(false);
      if (allMedicines.length > 0) {
        setMedicines(allMedicines);
      }
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        console.log(`[MediFind] Triggering live search for query: "${trimmed}"`);
        const liveResults = await searchLiveMedicines(trimmed);
        setMedicines(liveResults);
      } catch (err) {
        console.error("[MediFind] Live search failed:", err);
      } finally {
        setSearchLoading(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery, allMedicines, searchLiveMedicines]);

  // Initialize app, user, and start GPS location tracking
  useEffect(() => {
    let locationSub: any = null;

    const initApp = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("mf_user_data");
        const storedSaved = await AsyncStorage.getItem("mf_saved_pharmacies");
        const storedCleared = await AsyncStorage.getItem("mf_cleared_reservations");

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch { }
        }

        if (storedSaved) {
          try {
            setSavedPharmacies(JSON.parse(storedSaved));
          } catch { }
        }

        if (storedCleared) {
          try {
            setClearedReservationIds(JSON.parse(storedCleared));
          } catch { }
        }
      } catch { }

      // 1. Initial live location fetch & permission check
      try {
        const perm = await checkLocationPermission();
        setLocationPermission(perm);
        if (perm === "granted") {
          const locRes = await getCurrentUserLocation();
          if (locRes.coords) {
            setUserLocation(locRes.coords);
          }
        }
      } catch { }

      // 2. Fetch live backend data
      await refreshData();

      // 3. Start live location subscription
      try {
        locationSub = await watchUserLocation((newCoords) => {
          setUserLocation(newCoords);
        });
      } catch { }
    };

    initApp();

    return () => {
      if (locationSub && typeof locationSub.remove === "function") {
        locationSub.remove();
      }
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("mf_saved_pharmacies", JSON.stringify(savedPharmacies));
  }, [savedPharmacies]);

  // Recalculate distances dynamically when userLocation updates
  useEffect(() => {
    if (!userLocation) return;

    // Recalculate and sort pharmacies
    setPharmacies((prevPharms) => {
      if (prevPharms.length === 0) return prevPharms;
      const updated = prevPharms.map((p) => {
        const distKm = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          p.lat,
          p.lng
        );
        return {
          ...p,
          distanceKm: distKm,
          distance: formatDistance(distKm),
        };
      });

      // Sort closest first
      return updated.sort((a, b) => {
        if (a.distanceKm === null || a.distanceKm === undefined) return 1;
        if (b.distanceKm === null || b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    });

    // Recalculate and sort medicines
    setMedicines((prevMeds) => {
      if (prevMeds.length === 0) return prevMeds;
      const updated = prevMeds.map((m) => {
        const matchingPharma = pharmacies.find((p) => p.id === m.pharmacyId);
        const distKm = matchingPharma
          ? calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            matchingPharma.lat,
            matchingPharma.lng
          )
          : null;
        return {
          ...m,
          distanceKm: distKm,
          distance: formatDistance(distKm),
        };
      });

      return updated.sort((a, b) => {
        if (a.distanceKm === null || a.distanceKm === undefined) return 1;
        if (b.distanceKm === null || b.distanceKm === undefined) return -1;
        return a.distanceKm - b.distanceKm;
      });
    });
  }, [userLocation]);

  const refreshData = async () => {
    try {
      setLoading(true);

      // 1. Fetch live Pharmacies from backend (Approved only for patient app)
      let loadedPharmacies: Pharmacy[] = [];
      try {
        const backendPharmacies = await api.getPharmacies("Approved");
        if (Array.isArray(backendPharmacies) && backendPharmacies.length > 0) {
          loadedPharmacies = backendPharmacies
            .filter((bp) => !bp.status || bp.status.toLowerCase() === "approved")
            .map((bp) => {
              const distKm = userLocation
                ? calculateDistance(userLocation.latitude, userLocation.longitude, bp.lat, bp.lng)
                : null;
              return {
                id: String(bp.id),
                name: bp.name,
                address: bp.location,
                distance: formatDistance(distKm),
                distanceKm: distKm,
                rating: 4.8,
                reviews: 24,
                isOpen: bp.is_open !== undefined ? bp.is_open : isPharmacyOpen(bp.opening_hours),
                openHours: bp.opening_hours || "8:00 AM - 9:00 PM",
                phone: bp.phone || "+233 24 000 0000",
                verified: bp.verified ?? true,
                status: bp.status,
                lat: bp.lat,
                lng: bp.lng,
                imageUrl: bp.image_url || undefined,
                logoUrl: bp.logo_url || undefined,
              };
            });

          // Sort closest first if location is available
          if (userLocation) {
            loadedPharmacies.sort((a, b) => {
              if (a.distanceKm === null || a.distanceKm === undefined) return 1;
              if (b.distanceKm === null || b.distanceKm === undefined) return -1;
              return a.distanceKm - b.distanceKm;
            });
          }

          setPharmacies(loadedPharmacies);
        } else {
          setPharmacies([]);
        }
      } catch (err) {
        setPharmacies([]);
      }

      // 2. Fetch live Medicines from backend inventory/search
      try {
        const searchResults = await api.searchMedicines(
          "",
          userLocation ? userLocation.latitude : undefined,
          userLocation ? userLocation.longitude : undefined
        );

        if (Array.isArray(searchResults) && searchResults.length > 0) {
          const transformedMeds: Medicine[] = searchResults
            .filter((item) => {
              const pharma = item.pharmacy;
              return pharma && (!pharma.status || pharma.status.toLowerCase() === "approved");
            })
            .map((item) => {
              const med = item.medicine;
              const pharma = item.pharmacy;
              const inv = item.inventory;
              const distKm = userLocation
                ? calculateDistance(userLocation.latitude, userLocation.longitude, pharma.lat, pharma.lng)
                : (item.distance_km ?? null);

              return {
                id: `${med.id}-${pharma.id}`,
                rawMedicineId: med.id,
                name: med.name,
                genericName: med.generic_name || med.name,
                strength: med.strength || med.dosage || "",
                dosageForm: med.dosage_form || "",
                routeOfAdministration: med.route_of_administration || "",
                category: med.therapeutic_category || med.category || "General",
                therapeuticCategory: med.therapeutic_category || med.category || "General",
                manufacturer: med.manufacturer || "",
                requiresPrescription: !!med.requires_prescription,
                inStock: (inv?.stock_quantity ?? 0) > 0,
                price: inv?.price ?? 15.0,
                pharmacy: pharma.name,
                pharmacyId: String(pharma.id),
                distance: formatDistance(distKm),
                distanceKm: distKm,
                rating: 4.8,
                reviews: 18,
                description: med.description || "",
                dosage: med.dosage || med.strength || "",
                dosageInstructions: med.dosage_instructions || "",
                precautions: med.precautions || "",
                sideEffects: med.side_effects || "",
                tags: med.tags || "",
                imageUrl: med.image_url || undefined,
              };
            });

          if (userLocation) {
            transformedMeds.sort((a, b) => {
              if (a.distanceKm === null || a.distanceKm === undefined) return 1;
              if (b.distanceKm === null || b.distanceKm === undefined) return -1;
              return a.distanceKm - b.distanceKm;
            });
          }

          setAllMedicines(transformedMeds);
          setMedicines(transformedMeds);
        } else {
          // Fallback to medicines catalog if search returned empty
          const catalogMeds = await api.getMedicines();
          if (Array.isArray(catalogMeds) && catalogMeds.length > 0) {
            const firstPharma = loadedPharmacies.length > 0 ? loadedPharmacies[0] : null;
            const distKm = userLocation && firstPharma
              ? calculateDistance(userLocation.latitude, userLocation.longitude, firstPharma.lat, firstPharma.lng)
              : null;

            const transformedMeds: Medicine[] = catalogMeds.map((med) => ({
              id: String(med.id),
              rawMedicineId: med.id,
              name: med.name,
              genericName: med.generic_name || med.name,
              strength: med.strength || med.dosage || "",
              dosageForm: med.dosage_form || "",
              routeOfAdministration: med.route_of_administration || "",
              category: med.therapeutic_category || med.category || "General",
              therapeuticCategory: med.therapeutic_category || med.category || "General",
              manufacturer: med.manufacturer || "",
              requiresPrescription: !!med.requires_prescription,
              inStock: true,
              price: 15.0,
              pharmacy: firstPharma?.name || "Verified Pharmacy",
              pharmacyId: String(firstPharma?.id || "1"),
              distance: formatDistance(distKm),
              distanceKm: distKm,
              rating: 4.8,
              reviews: 15,
              description: med.description || "",
              dosage: med.dosage || med.strength || "",
              dosageInstructions: med.dosage_instructions || "",
              precautions: med.precautions || "",
              sideEffects: med.side_effects || "",
              tags: med.tags || "",
              imageUrl: med.image_url || undefined,
            }));
            setAllMedicines(transformedMeds);
            setMedicines(transformedMeds);
          } else {
            setAllMedicines([]);
            setMedicines([]);
          }
        }
      } catch (err) {
        setMedicines([]);
      }

      // 3. Fetch Reservations from backend
      await refreshReservations(loadedPharmacies);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const refreshReservations = useCallback(async (currentPharmacies?: Pharmacy[]) => {
    try {
      setLoading(true);
      const token = await getStoredToken();
      if (!token) {
        setReservations([]);
        return;
      }
      const activePharmacies = currentPharmacies || pharmacies;
      const backendReservations = await api.getReservations();
      if (Array.isArray(backendReservations)) {
        let currentCleared = clearedReservationIds;
        try {
          const storedCleared = await AsyncStorage.getItem("mf_cleared_reservations");
          if (storedCleared) currentCleared = JSON.parse(storedCleared);
        } catch { }

        const transformed = backendReservations
          .filter((br) => !currentCleared.includes(String(br.id)))
          .map((br) => transformBackendReservation(br, activePharmacies));
        setReservations(transformed);
      } else {
        setReservations([]);
      }
    } catch (err) {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [pharmacies, clearedReservationIds]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { user: backendUser } = await api.login(email, password);
      const loggedUser: User = {
        id: String(backendUser.id),
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone || "+233 24 000 0001",
        location: backendUser.location || "Accra, Ghana",
      };
      setUser(loggedUser);
      await AsyncStorage.setItem("mf_user_data", JSON.stringify(loggedUser));
      await refreshData();
      await fetchNotifications();
      return true;
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch { }
    setUser(null);
    setReservations([]);
    setNotifications([]);
    setUnreadCount(0);
    await AsyncStorage.removeItem("mf_user_data");
    await AsyncStorage.removeItem("mf_access_token");
    await AsyncStorage.removeItem("mf_reservations");
  };

  const register = async (name: string, email: string, password: string, phone: string, location?: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { user: backendUser } = await api.register({
        name,
        email,
        password,
        phone,
        location: location || "Accra, Ghana",
      });
      const registeredUser: User = {
        id: String(backendUser.id),
        name: backendUser.name,
        email: backendUser.email,
        phone: backendUser.phone || phone,
        location: backendUser.location || location || "Accra, Ghana",
      };
      setUser(registeredUser);
      await AsyncStorage.setItem("mf_user_data", JSON.stringify(registeredUser));
      await refreshData();
      return true;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (
    medicine: Medicine,
    qty: number,
    pickupDate: string,
    notes: string,
    paymentMethod?: "PAYSTACK" | "CASH"
  ): Promise<Reservation | null> => {
    try {
      const pharmacyIdNum = parseInt(medicine.pharmacyId.replace(/\D/g, "") || "1", 10) || 1;
      const rawMedId = medicine.rawMedicineId || parseInt(medicine.id.split("-")[0].replace(/\D/g, "") || "1", 10) || 1;

      const created = await api.createReservation({
        pharmacy_id: pharmacyIdNum,
        items: [{ medicine_id: rawMedId, quantity: qty }],
        fulfillment_time: pickupDate,
        notes: notes || undefined,
        fulfillment_method: "Pickup",
        payment_method: paymentMethod || undefined,
        payment_preference: paymentMethod ? (paymentMethod === "PAYSTACK" ? "Pay Online" : "Pay at Pharmacy") : undefined,
      });

      const transformed = transformBackendReservation(created, pharmacies);
      setReservations((prev) => [transformed, ...prev.filter((r) => r.id !== transformed.id)]);
      return transformed;
    } catch (err) {
      console.error("Failed to create reservation:", err);
      throw err;
    }
  };

  const initializePaystackPayment = async (
    reservationId: string | number
  ): Promise<{ authorization_url: string; reference: string; is_mock: boolean }> => {
    const numId = typeof reservationId === "string" ? parseInt(reservationId.replace(/\D/g, ""), 10) : reservationId;
    const res = await api.initializePayment(numId);
    return {
      authorization_url: res.authorization_url,
      reference: res.reference,
      is_mock: res.is_mock,
    };
  };

  const verifyPaystackPayment = async (reference: string): Promise<boolean> => {
    try {
      const res = await api.verifyPayment(reference);
      if (res.status === "Success" || res.payment_status === "PAID") {
        await refreshReservations();
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error verifying Paystack payment:", err);
      return false;
    }
  };

  const approveReservation = async (id: string) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        await api.updateReservationStatus(numericId, "Approved");
      }
    } catch { }

    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "Approved" } : res))
    );
  };

  const updateFulfillmentAndPayment = async (
    id: string,
    fulfillmentMethod: "Pickup" | "Delivery",
    paymentMethod: string,
    address?: string
  ) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        await api.updateReservationFulfillment(numericId, fulfillmentMethod, paymentMethod, address);
      }
    } catch { }

    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id === id) {
          const nextStatus: Reservation["status"] =
            paymentMethod === "Pay Online"
              ? "Paid"
              : fulfillmentMethod === "Pickup"
                ? "Ready for Pickup"
                : "Preparing";

          return {
            ...reservation,
            fulfillmentMethod,
            paymentMethod: paymentMethod === "Pay Online" ? "PAYSTACK" : "CASH",
            paymentStatus: paymentMethod === "Pay Online" ? "PAID" : "UNPAID",
            fulfillmentAddress: address || reservation.fulfillmentAddress,
            status: nextStatus,
          };
        }
        return reservation;
      })
    );
  };

  const markReservationPaid = async (id: string) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        await api.updateReservationStatus(numericId, "Paid");
      }
    } catch { }

    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: "Paid", paymentStatus: "PAID" } : res))
    );
  };

  const advanceReservationStatus = async (id: string) => {
    const target = reservations.find((r) => r.id === id);
    if (!target) return;

    let nextStatus: Reservation["status"] = target.status;
    switch (target.status) {
      case "Paid":
        nextStatus = target.fulfillmentMethod === "Delivery" ? "Preparing" : "Ready for Pickup";
        break;
      case "Preparing":
        nextStatus = "Out for Delivery";
        break;
      case "Out for Delivery":
        nextStatus = "Delivered";
        break;
      case "Ready for Pickup":
        nextStatus = "Collected";
        break;
      default:
        break;
    }

    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId) && nextStatus !== target.status) {
        await api.updateReservationStatus(numericId, nextStatus);
      }
    } catch { }

    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: nextStatus } : res))
    );
  };

  const cancelReservation = async (id: string) => {
    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        await api.cancelReservation(numericId);
      }
    } catch { }

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Cancelled" } : r))
    );
  };

  const clearReservation = async (id: string) => {
    const updatedCleared = [...new Set([...clearedReservationIds, String(id)])];
    setClearedReservationIds(updatedCleared);
    await AsyncStorage.setItem("mf_cleared_reservations", JSON.stringify(updatedCleared));
    setReservations((prev) => prev.filter((r) => r.id !== String(id)));

    try {
      const numericId = parseInt(id.replace(/\D/g, ""), 10);
      if (!isNaN(numericId)) {
        await api.clearReservation(numericId);
      }
    } catch (err) {
      console.error("Failed to sync cleared reservation to backend:", err);
    }
  };

  const clearAllFinishedReservations = async () => {
    const finishedIds = reservations
      .filter((r) => ["Delivered", "Collected", "Cancelled", "Expired"].includes(r.status))
      .map((r) => String(r.id));
    if (finishedIds.length === 0) return;
    const updatedCleared = [...new Set([...clearedReservationIds, ...finishedIds])];
    setClearedReservationIds(updatedCleared);
    await AsyncStorage.setItem("mf_cleared_reservations", JSON.stringify(updatedCleared));
    setReservations((prev) => prev.filter((r) => !finishedIds.includes(String(r.id))));

    try {
      await api.clearFinishedReservations();
    } catch (err) {
      console.error("Failed to sync cleared finished reservations to backend:", err);
    }
  };

  const toggleSavePharmacy = useCallback((id: string) => {
    setSavedPharmacies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }, []);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    const token = await getStoredToken();
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (isRefresh) setNotificationsRefreshing(true);
    else setNotificationsLoading(true);

    try {
      const res = await api.getNotifications();
      setNotifications(res.items || []);
      setUnreadCount(res.unread_count || 0);
    } catch (e) {
      console.log("[AppContext] Error fetching notifications:", e);
    } finally {
      setNotificationsLoading(false);
      setNotificationsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markNotificationRead = useCallback(async (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await api.markNotificationRead(id);
    } catch (e) {
      console.log("[AppContext] Error marking notification read:", e);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const markAllNotificationsRead = useCallback(async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
    );
    setUnreadCount(0);

    try {
      await api.markAllNotificationsRead();
    } catch (e) {
      console.log("[AppContext] Error marking all notifications read:", e);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const deleteNotification = useCallback(async (id: number) => {
    const target = notifications.find((n) => n.id === id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await api.deleteNotification(id);
    } catch (e) {
      console.log("[AppContext] Error deleting notification:", e);
      fetchNotifications();
    }
  }, [notifications, fetchNotifications]);

  const clearAllNotifications = useCallback(async (readOnly = false) => {
    if (readOnly) {
      setNotifications((prev) => prev.filter((n) => !n.is_read));
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }

    try {
      await api.clearAllNotifications(readOnly);
    } catch (e) {
      console.log("[AppContext] Error clearing notifications:", e);
      fetchNotifications();
    }
  }, [fetchNotifications]);

  const refreshNotifications = useCallback(() => fetchNotifications(true), [fetchNotifications]);

  const contextValue = useMemo<AppContextType>(
    () => ({
      user,
      medicines,
      pharmacies,
      reservations,
      loading,
      searchLoading,
      searchQuery,
      setSearchQuery,
      userLocation,
      locationPermission,
      requestLocationAccess,
      login,
      logout,
      register,
      createReservation,
      approveReservation,
      updateFulfillmentAndPayment,
      initializePaystackPayment,
      verifyPaystackPayment,
      markReservationPaid,
      advanceReservationStatus,
      cancelReservation,
      clearReservation,
      clearAllFinishedReservations,
      refreshReservations,
      refreshData,
      savedPharmacies,
      toggleSavePharmacy,
      searchLiveMedicines,
      notifications,
      unreadCount,
      notificationsLoading,
      notificationsRefreshing,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearAllNotifications,
    }),
    [
      user,
      medicines,
      pharmacies,
      reservations,
      loading,
      searchLoading,
      searchQuery,
      userLocation,
      locationPermission,
      savedPharmacies,
      notifications,
      unreadCount,
      notificationsLoading,
      notificationsRefreshing,
      refreshNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearAllNotifications,
      searchLiveMedicines,
      refreshReservations,
      toggleSavePharmacy,
    ]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};

export const useNotifications = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useNotifications must be used within an AppProvider");
  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    loading: context.notificationsLoading,
    refreshing: context.notificationsRefreshing,
    refreshNotifications: context.refreshNotifications,
    markNotificationRead: context.markNotificationRead,
    markAllNotificationsRead: context.markAllNotificationsRead,
    deleteNotification: context.deleteNotification,
    clearAllNotifications: context.clearAllNotifications,
  };
};

