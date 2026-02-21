import { API_CONFIG } from './apiConfig';

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

// Authentication Interfaces
export interface LoginRequest {
  username?: string;
  password?: string;
  phoneNumber?: string;
}

export interface RegisterRequest {
  username: string;
  phoneNumber: string;
  password: string;
  fullName?: string;
}

export interface OtpRequestDto {
  phoneNumber: string;
}

export interface OtpVerificationDto {
  phoneNumber: string;
  verificationCode: string;
}

export interface OtpResponseDto {
  phoneNumber: string;
  message: string;
  expirySeconds: number;
}

export interface LoginResponse {
  token: string;
  expiration: string;
  user: {
    id: string;
    userName: string;
    phoneNumber?: string;
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
   * Login with username and password
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/v1/auth/login', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Register - نیا کاربر ثبت کنید
   */
  static async register(credentials: RegisterRequest): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/v1/auth/register', credentials);
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  /**
   * Request OTP for phone-based authentication
   */
  static async requestOtp(request: OtpRequestDto): Promise<OtpResponseDto> {
    return this.post<OtpResponseDto>('/v1/auth/request-otp', request);
  }

  /**
   * Verify OTP and login/register
   */
  static async verifyOtp(request: OtpVerificationDto): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>('/v1/auth/verify-otp', request);
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
    return this.get('/v1/orders');
  }

  /**
   * Get Order by ID
   */
  static getOrder(id: string) {
    return this.get(`/v1/orders/${id}`);
  }

  /**
   * Get User Orders
   */
  static getUserOrders(userId: string) {
    return this.get(`/v1/orders/user/${userId}`);
  }

  /**
   * Create Order
   */
  static createOrder(order: unknown) {
    return this.post('/v1/orders', order);
  }

  /**
   * Update Order
   */
  static updateOrder(id: string, order: unknown) {
    return this.put(`/v1/orders/${id}`, order);
  }

  /**
   * Delete Order
   */
  static deleteOrder(id: string) {
    return this.delete(`/v1/orders/${id}`);
  }

  /**
   * Get Design System Assets
   */
  static getDesignSystem() {
    return this.get('/v1/design/system');
  }

  /**
   * Health Check
   */
  static healthCheck() {
    return this.get('/health');
  }
}

export default ApiClient;
