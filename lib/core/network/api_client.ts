import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ApiResponse<T = any> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export interface ApiRequestConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  params?: Record<string, any>;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken?: string;

  constructor(config: ApiRequestConfig = {}) {
    this.baseURL = config.baseURL || 'https://api.assetmanagement.com';
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Platform': Platform.OS,
      'X-App-Version': '1.0.0',
      ...config.headers,
    };
  }

  private async getAuthToken(): Promise<string | null> {
    if (this.authToken) return this.authToken;
    
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }



  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await AsyncStorage.getItem('device_id');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('device_id', deviceId);
      }
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return 'unknown_device';
    }
  }

  private async makeRequest<T>(
    method: string,
    url: string,
    data?: any,
    config: Partial<ApiRequestConfig> = {}
  ): Promise<ApiResponse<T>> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseURL}${url}`;
    const headers = { ...this.defaultHeaders, ...config.headers };
    
    // Add auth token if available
    const authToken = await this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    // Add device ID
    const deviceId = await this.getDeviceId();
    headers['X-Device-ID'] = deviceId;

    const requestConfig: RequestInit = {
      method,
      headers,
    };

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    // Add query parameters for GET requests
    if (method === 'GET' && config.params) {
      const urlObj = new URL(fullUrl);
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          urlObj.searchParams.append(key, String(value));
        }
      });
      url = urlObj.toString();
    }

    try {
      console.log(`API ${method} ${url}`, data ? { data } : '');
      
      const response = await fetch(url, requestConfig);
      
      let responseData: T;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text() as T;
      }

      const apiResponse: ApiResponse<T> = {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries()),
      };

      console.log(`API Response ${response.status} ${url}`, responseData);

      // Handle token refresh for 401 errors
      if (response.status === 401) {
        await this.handleTokenRefresh();
      }

      return apiResponse;
    } catch (error) {
      console.error(`API Error ${method} ${url}:`, error);
      throw error;
    }
  }

  private async handleTokenRefresh(): Promise<void> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.setAuthToken(data.access_token);
        if (data.refresh_token) {
          await AsyncStorage.setItem('refresh_token', data.refresh_token);
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        await this.clearAuthTokens();
        throw new Error('Token refresh failed');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await this.clearAuthTokens();
      throw error;
    }
  }

  private async clearAuthTokens(): Promise<void> {
    this.authToken = undefined;
    try {
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
    } catch (error) {
      console.error('Error clearing auth tokens:', error);
    }
  }

  async get<T = any>(url: string, config: Partial<ApiRequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', url, undefined, config);
  }

  async post<T = any>(url: string, data?: any, config: Partial<ApiRequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', url, data, config);
  }

  async put<T = any>(url: string, data?: any, config: Partial<ApiRequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', url, data, config);
  }

  async delete<T = any>(url: string, data?: any, config: Partial<ApiRequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', url, data, config);
  }

  async patch<T = any>(url: string, data?: any, config: Partial<ApiRequestConfig> = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PATCH', url, data, config);
  }

  async uploadFile<T = any>(
    url: string,
    fileUri: string,
    fieldName: string = 'file',
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // Add file
    const fileInfo = {
      uri: fileUri,
      type: 'application/octet-stream',
      name: fileUri.split('/').pop() || 'file',
    };
    formData.append(fieldName, fileInfo as any);

    // Add additional data
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers = {
      ...this.defaultHeaders,
      'Content-Type': 'multipart/form-data',
    };

    return this.makeRequest<T>('POST', url, formData, { headers });
  }

  async downloadFile(url: string, filename?: string): Promise<Blob> {
    const authToken = await this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  setAuthToken(token: string): void {
    this.authToken = token;
    // Also save to AsyncStorage
    AsyncStorage.setItem('auth_token', token).catch(error => {
      console.error('Error saving auth token:', error);
    });
  }

  clearAuthToken(): void {
    this.authToken = undefined;
  }

  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  addDefaultHeader(key: string, value: string): void {
    this.defaultHeaders[key] = value;
  }

  removeDefaultHeader(key: string): void {
    delete this.defaultHeaders[key];
  }
} 