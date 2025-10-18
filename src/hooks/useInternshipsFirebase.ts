import { useState, useEffect } from "react";
import { fetchInternships } from "@/lib/dataExtractor";

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
        const data = await fetchInternships();
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
