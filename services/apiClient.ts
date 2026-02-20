import { API_CONFIG } from './apiConfig';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: {
    id: string;
    userName: string;
    email: string;
    type: string;
  };
}

export class ApiClient {
  private static token: string | null = null;

  /**
   * Set authentication token
   */
  static setToken(token: string): void {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Get authentication token
   */
  static getToken(): string | null {
    return this.token || localStorage.getItem('auth_token');
  }

  /**
   * Clear authentication token
   */
  static clearToken(): void {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make HTTP request
   */
  private static async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: unknown,
    headers?: HeadersInit
  ): Promise<T> {
    const url = `${API_CONFIG.API_BASE_URL}${endpoint}`;
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json() as Promise<T>;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * GET request
   */
  static get<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, headers);
  }

  /**
   * POST request
   */
  static post<T>(endpoint: string, body: unknown, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, headers);
  }

  /**
   * PUT request
   */
  static put<T>(endpoint: string, body: unknown, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body, headers);
  }

  /**
   * DELETE request
   */
  static delete<T>(endpoint: string, headers?: HeadersInit): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, headers);
  }

  /**
   * Login
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Logout
   */
  static logout(): void {
    this.clearToken();
  }

  /**
   * Get Orders
   */
  static getOrders() {
    return this.get('/orders');
  }

  /**
   * Get Order by ID
   */
  static getOrder(id: number) {
    return this.get(`/orders/${id}`);
  }

  /**
   * Create Order
   */
  static createOrder(order: unknown) {
    return this.post('/orders', order);
  }

  /**
   * Health Check
   */
  static healthCheck() {
    return this.get('/health');
  }
}

export default ApiClient;
