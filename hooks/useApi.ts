import { useState, useCallback, useEffect } from 'react';
import ApiClient from '../services/apiClient';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const request = useCallback(async (fn: () => Promise<any>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      setData(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, data, request };
};

export const useLogin = () => {
  const { loading, error, request } = useApi();

  const login = useCallback(
    async (email: string, password: string) => {
      return request(() => ApiClient.login({ email, password }));
    },
    [request]
  );

  return { loading, error, login };
};

export const useOrders = () => {
  const { loading, error, data, request } = useApi();

  const getOrders = useCallback(
    () => request(() => ApiClient.getOrders()),
    [request]
  );

  const getOrder = useCallback(
    (id: number) => request(() => ApiClient.getOrder(id)),
    [request]
  );

  const createOrder = useCallback(
    (order: any) => request(() => ApiClient.createOrder(order)),
    [request]
  );

  return { loading, error, orders: data, getOrders, getOrder, createOrder };
};

export default useApi;
