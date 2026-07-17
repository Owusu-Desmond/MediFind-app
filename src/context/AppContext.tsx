import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  inStock: boolean;
  price: number;
  pharmacy: string;
  pharmacyId: string;
  distance: string;
  rating: number;
  reviews: number;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  isOpen: boolean;
  openHours: string;
  phone: string;
  verified: boolean;
}

export interface Reservation {
  id: string;
  medicineId: string;
  medicineName: string;
  pharmacyName: string;
  pharmacyId: string;
  fulfillmentMethod: "Pickup" | "Delivery";
  status:
    | "Pending Approval"
    | "Approved"
    | "Paid"
    | "Ready for Pickup"
    | "Preparing"
    | "Out for Delivery"
    | "Delivered"
    | "Collected"
    | "Cancelled";
  date: string;
  refNumber: string;
  quantity: number;
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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string, phone: string) => void;
  createReservation: (medicine: Medicine, qty: number) => void;
  markReservationPaid: (id: string) => void;
  advanceReservationStatus: (id: string) => void;
  cancelReservation: (id: string) => void;
  savedPharmacies: string[];
  toggleSavePharmacy: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const sampleMedicines: Medicine[] = [
  {
    id: "med-1",
    name: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    category: "Analgesic",
    inStock: true,
    price: 5.50,
    pharmacy: "Ghana National Pharmacy",
    pharmacyId: "phr-1",
    distance: "0.3 km",
    rating: 4.8,
    reviews: 124,
  },
  {
    id: "med-2",
    name: "Amoxicillin 500mg",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    inStock: true,
    price: 18.00,
    pharmacy: "East Legon Pharmacy",
    pharmacyId: "phr-2",
    distance: "1.2 km",
    rating: 4.6,
    reviews: 78,
  },
  {
    id: "med-3",
    name: "Metformin 850mg",
    genericName: "Metformin HCl",
    category: "Antidiabetic",
    inStock: true,
    price: 22.00,
    pharmacy: "Accra Mall Pharmacy",
    pharmacyId: "phr-3",
    distance: "2.1 km",
    rating: 4.7,
    reviews: 203,
  },
  {
    id: "med-4",
    name: "Lisinopril 10mg",
    genericName: "Lisinopril",
    category: "Antihypertensive",
    inStock: false,
    price: 30.00,
    pharmacy: "Tema Dispensary",
    pharmacyId: "phr-4",
    distance: "4.5 km",
    rating: 4.2,
    reviews: 45,
  },
  {
    id: "med-5",
    name: "Artemether/Lumefantrine 80/480mg",
    genericName: "Coartem",
    category: "Antimalarial",
    inStock: true,
    price: 45.00,
    pharmacy: "Ghana National Pharmacy",
    pharmacyId: "phr-1",
    distance: "0.3 km",
    rating: 4.9,
    reviews: 312,
  },
  {
    id: "med-6",
    name: "Atorvastatin 20mg",
    genericName: "Atorvastatin Calcium",
    category: "Statin",
    inStock: true,
    price: 35.00,
    pharmacy: "East Legon Pharmacy",
    pharmacyId: "phr-2",
    distance: "1.2 km",
    rating: 4.5,
    reviews: 89,
  },
];

const samplePharmacies: Pharmacy[] = [
  {
    id: "phr-1",
    name: "Ghana National Pharmacy",
    address: "Ring Road Central, Accra",
    distance: "0.3 km",
    rating: 4.8,
    reviews: 512,
    isOpen: true,
    openHours: "Mon–Sat: 7am – 9pm",
    phone: "+233 30 223 4455",
    verified: true,
  },
  {
    id: "phr-2",
    name: "East Legon Pharmacy Ltd",
    address: "14 Boundary Road, East Legon",
    distance: "1.2 km",
    rating: 4.6,
    reviews: 284,
    isOpen: true,
    openHours: "Mon–Sun: 8am – 10pm",
    phone: "+233 24 123 4567",
    verified: true,
  },
  {
    id: "phr-3",
    name: "Accra Mall Pharmacy",
    address: "Tetteh Quarshie, Spintex Rd, Accra",
    distance: "2.1 km",
    rating: 4.7,
    reviews: 392,
    isOpen: true,
    openHours: "Mon–Sun: 9am – 9pm",
    phone: "+233 20 882 1200",
    verified: true,
  },
  {
    id: "phr-4",
    name: "Tema Community 1 Dispensary",
    address: "Community 1 Market Area, Tema",
    distance: "4.5 km",
    rating: 4.2,
    reviews: 120,
    isOpen: false,
    openHours: "Mon–Fri: 8am – 5pm",
    phone: "+233 30 320 4481",
    verified: false,
  },
];

const sampleReservations: Reservation[] = [
  {
    id: "res-demo-approved-1",
    medicineId: "med-5",
    medicineName: "Artemether/Lumefantrine 80/480mg",
    pharmacyName: "Ghana National Pharmacy",
    pharmacyId: "phr-1",
    fulfillmentMethod: "Delivery",
    status: "Approved",
    date: new Date().toISOString().split("T")[0],
    refNumber: "MF-DEMO1",
    quantity: 2,
  },
];

const ensureDemoReservation = (reservations: Reservation[]) => {
  if (reservations.some((reservation) => reservation.id === "res-demo-approved-1")) {
    return reservations;
  }

  return [sampleReservations[0], ...reservations];
};

const normalizeReservation = (reservation: any): Reservation => {
  const mapStatus = (status: string | undefined): Reservation["status"] => {
    switch (status) {
      case "Pending":
        return "Pending Approval";
      case "Ready":
        return "Ready for Pickup";
      case "Collected":
        return "Collected";
      case "Cancelled":
        return "Cancelled";
      case "Approved":
      case "Paid":
      case "Preparing":
      case "Out for Delivery":
      case "Delivered":
      case "Ready for Pickup":
      case "Pending Approval":
        return status;
      default:
        return "Pending Approval";
    }
  };

  return {
    id: reservation.id,
    medicineId: reservation.medicineId,
    medicineName: reservation.medicineName,
    pharmacyName: reservation.pharmacyName,
    pharmacyId: reservation.pharmacyId,
    fulfillmentMethod: reservation.fulfillmentMethod ?? "Pickup",
    status: mapStatus(reservation.status),
    date: reservation.date,
    refNumber: reservation.refNumber,
    quantity: reservation.quantity ?? 1,
  };
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines] = useState<Medicine[]>(sampleMedicines);
  const [pharmacies] = useState<Pharmacy[]>(samplePharmacies);
  const [reservations, setReservations] = useState<Reservation[]>(sampleReservations);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedPharmacies, setSavedPharmacies] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const storedReservations = await AsyncStorage.getItem("mf_reservations");
      const storedSaved = await AsyncStorage.getItem("mf_saved_pharmacies");

      if (storedReservations) {
        try {
          const parsedReservations = JSON.parse(storedReservations);
          const normalizedReservations = Array.isArray(parsedReservations)
            ? parsedReservations.map(normalizeReservation)
            : sampleReservations;
          setReservations(ensureDemoReservation(normalizedReservations));
        } catch {
          setReservations(sampleReservations);
        }
      } else {
        setReservations(sampleReservations);
      }

      if (storedSaved) setSavedPharmacies(JSON.parse(storedSaved));
    };
    load();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("mf_reservations", JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    AsyncStorage.setItem("mf_saved_pharmacies", JSON.stringify(savedPharmacies));
  }, [savedPharmacies]);

  const login = (email: string, _password: string): boolean => {
    const newUser: User = {
      id: "usr-patient-1",
      name: email.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email,
      phone: "+233 24 000 0001",
      location: "East Legon, Accra",
    };
    setUser(newUser);
    AsyncStorage.setItem("mf_user", JSON.stringify(newUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    AsyncStorage.removeItem("mf_user");
  };

  const register = (name: string, email: string, _password: string, phone: string) => {
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      location: "Accra, Ghana",
    };
    setUser(newUser);
    AsyncStorage.setItem("mf_user", JSON.stringify(newUser));
  };

  const createReservation = (medicine: Medicine, qty: number) => {
    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      pharmacyName: medicine.pharmacy,
      pharmacyId: medicine.pharmacyId,
      fulfillmentMethod: "Pickup",
      status: "Pending Approval",
      date: new Date().toISOString().split("T")[0],
      refNumber: `MF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      quantity: qty,
    };
    setReservations((prev) => [newRes, ...prev]);
  };

  const markReservationPaid = (id: string) => {
    setReservations((prev) =>
      prev.map((reservation) =>
        reservation.id === id
          ? { ...reservation, status: "Paid" }
          : reservation
      )
    );
  };

  const advanceReservationStatus = (id: string) => {
    setReservations((prev) =>
      prev.map((reservation) => {
        if (reservation.id !== id) return reservation;

        switch (reservation.status) {
          case "Paid":
            return {
              ...reservation,
              status: reservation.fulfillmentMethod === "Delivery" ? "Preparing" : "Ready for Pickup",
            };
          case "Preparing":
            return { ...reservation, status: "Out for Delivery" };
          case "Out for Delivery":
            return { ...reservation, status: "Delivered" };
          case "Ready for Pickup":
            return { ...reservation, status: "Collected" };
          default:
            return reservation;
        }
      })
    );
  };

  const cancelReservation = (id: string) => {
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
        searchQuery,
        setSearchQuery,
        login,
        logout,
        register,
        createReservation,
        markReservationPaid,
        advanceReservationStatus,
        cancelReservation,
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
