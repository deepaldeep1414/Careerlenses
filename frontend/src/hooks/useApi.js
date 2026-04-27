import { useState } from "react";

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const call = async (fn) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fn();
            return res.data;
        } catch (err) {
            const msg = err.response?.data?.detail
                || err.message
                || "Something went wrong.";
            setError(msg);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { loading, error, call };
}