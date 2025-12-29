import { OneBotV12Response } from './types.js';

export interface HttpClientConfig {
  baseUrl: string;
  accessToken?: string;
  platform: string;
  accountId: string;
  protocol: string;
  version: string;
}

/**
 * HTTP 客户端，用于发送 API 请求
 */
export class HttpClient {
  private config: HttpClientConfig;
  private basePath: string;

  constructor(config: HttpClientConfig) {
    this.config = config;
    // baseUrl 格式: http://localhost:6727/hook/zhin/onebot/v12
    // API 路径直接使用 baseUrl 的路径部分
    const url = new URL(config.baseUrl);
    this.basePath = url.pathname; // 例如: /hook/zhin/onebot/v12
  }

  /**
   * 发送 POST 请求
   */
  async post(action: string, params?: any): Promise<OneBotV12Response> {
    // 确保 baseUrl 和 basePath 正确拼接
    const baseUrl = this.config.baseUrl.replace(/\/$/, '');
    const basePath = this.basePath.startsWith('/') ? this.basePath : `/${this.basePath}`;
    const url = `${baseUrl}${basePath}/${action}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.accessToken) {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(params || {}),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}

