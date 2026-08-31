import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, getStoredToken, BackendReservation, BackendMedicine, BackendPharmacy, BackendUser } from "@/services/api";
import { Coordinates, calculateDistance, formatDistance } from "@/utils/distance";
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
  category: string;
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
  lat?: number;
  lng?: number;
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
  paymentMethod?: string;
  status:
  | "Pending Pharmacy Review"
  | "Approved"
  | "Paid"
  | "Ready for Pickup"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Collected"
  | "Cancelled";
  date: string;
  pickupDate?: string;
  notes?: string;
  refNumber: string;
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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  userLocation: Coordinates | null;
  locationPermission: LocationPermissionStatus;
  requestLocationAccess: () => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, phone: string, location?: string) => Promise<boolean>;
  createReservation: (medicine: Medicine, qty: number, pickupDate: string, notes: string) => Promise<Reservation | null>;
  approveReservation: (id: string) => Promise<void>;
  updateFulfillmentAndPayment: (id: string, fulfillmentMethod: "Pickup" | "Delivery", paymentMethod: string, address?: string) => Promise<void>;
  markReservationPaid: (id: string) => Promise<void>;
  advanceReservationStatus: (id: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  refreshReservations: () => Promise<void>;
  refreshData: () => Promise<void>;
  savedPharmacies: string[];
  toggleSavePharmacy: (id: string) => void;
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
    paymentMethod: br.payment_preference,
    status: mapStatus(br.status),
    date: br.date ? new Date(br.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    pickupDate: br.fulfillment_time,
    notes: br.notes,
    refNumber: br.ref_number || `MF-${br.id}`,
    quantity,
    totalPrice: br.total_price,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPharmacies, setSavedPharmacies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  // Initialize app, user, and start GPS location tracking
  useEffect(() => {
    let locationSub: any = null;

    const initApp = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("mf_user_data");
        const storedSaved = await AsyncStorage.getItem("mf_saved_pharmacies");

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

      // 1. Fetch live Pharmacies from backend
      let loadedPharmacies: Pharmacy[] = [];
      try {
        const backendPharmacies = await api.getPharmacies();
        if (Array.isArray(backendPharmacies) && backendPharmacies.length > 0) {
          loadedPharmacies = backendPharmacies.map((bp) => {
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
              isOpen: true,
              openHours: bp.opening_hours || "Mon–Sat: 8am – 9pm",
              phone: bp.phone || "+233 24 000 0000",
              verified: bp.verified ?? true,
              lat: bp.lat,
              lng: bp.lng,
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
          const transformedMeds: Medicine[] = searchResults.map((item) => {
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
              category: med.category || "General",
              inStock: (inv?.stock_quantity ?? 0) > 0,
              price: inv?.price ?? 15.0,
              pharmacy: pharma.name,
              pharmacyId: String(pharma.id),
              distance: formatDistance(distKm),
              distanceKm: distKm,
              rating: 4.8,
              reviews: 18,
              description: med.description || "",
              dosage: med.dosage || "",
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
              category: med.category || "General",
              inStock: true,
              price: 15.0,
              pharmacy: firstPharma?.name || "Verified Pharmacy",
              pharmacyId: String(firstPharma?.id || "1"),
              distance: formatDistance(distKm),
              distanceKm: distKm,
              rating: 4.8,
              reviews: 15,
              description: med.description || "",
              dosage: med.dosage || "",
              dosageInstructions: med.dosage_instructions || "",
              precautions: med.precautions || "",
              sideEffects: med.side_effects || "",
              tags: med.tags || "",
              imageUrl: med.image_url || undefined,
            }));
            setMedicines(transformedMeds);
          } else {
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
        const transformed = backendReservations.map((br) => transformBackendReservation(br, activePharmacies));
        setReservations(transformed);
      } else {
        setReservations([]);
      }
    } catch (err) {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [pharmacies]);

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
    notes: string
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
      });

      const transformed = transformBackendReservation(created, pharmacies);
      setReservations((prev) => [transformed, ...prev.filter((r) => r.id !== transformed.id)]);
      return transformed;
    } catch (err) {
      console.error("Failed to create reservation:", err);
      throw err;
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
            paymentMethod,
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
      prev.map((res) => (res.id === id ? { ...res, status: "Paid" } : res))
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

  const toggleSavePharmacy = (id: string) => {
    setSavedPharmacies((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        medicines,
        pharmacies,
        reservations,
        loading,
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
        markReservationPaid,
        advanceReservationStatus,
        cancelReservation,
        refreshReservations,
        refreshData,
        savedPharmacies,
        toggleSavePharmacy,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within an AppProvider");
  return context;
};
