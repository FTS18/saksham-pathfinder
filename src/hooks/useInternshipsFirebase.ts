import { useState, useEffect } from "react";
import { getAllInternships } from "@/services/internshipService";

/**
 * Hook to fetch internships from Firebase or fallback to JSON
 */
export const useInternshipsFirebase = () => {
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadInternships = async () => {
      setLoading(true);
      setError(null);

      try {
        // Try Firebase first
        try {
          const data = await getAllInternships();
          setInternships(Array.isArray(data) ? data : []);
          setLoading(false);
          return;
        } catch (firebaseError) {
          console.warn(
            "Firebase internships unavailable, falling back to JSON:",
            firebaseError
          );
        }

        // Fallback to JSON file
        const response = await fetch("/internships.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setInternships(Array.isArray(data) ? data : []);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to load internships");
        console.error("Error loading internships:", error);
        setError(error);
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  return { internships, loading, error };
};
