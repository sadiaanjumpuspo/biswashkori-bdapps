/**
 * BDApps Gateway Service Client
 * Outbound calls to BDApps PHP endpoints.
 * Note: BDApps endpoints require application/x-www-form-urlencoded payloads.
 */

export const BDAPPS_BASE_URL = process.env.NEXT_PUBLIC_BDAPPS_BASE_URL || 'https://bdappsdigitalapps.com/BishwasKori';
export const BDAPPS_APP_ID = process.env.NEXT_PUBLIC_BDAPPS_APP_ID || 'APP_140016';
export const BDAPPS_APP_PASSWORD = process.env.NEXT_PUBLIC_BDAPPS_APP_PASSWORD || 'e9266e586b2cb19f6e6a6c6516d1467b';

export interface BdappsCheckSubResponse {
  subscriptionStatus: 'REGISTERED' | 'UNREGISTERED' | 'PENDING_CHARGE' | string;
  isSubscribed?: boolean;
  statusCode?: string;
  statusDetail?: string;
  subscriberId?: string;
  version?: string;
}

export interface BdappsSendOtpResponse {
  success?: boolean;
  referenceNo?: string;
  statusCode?: string;
  statusDetail?: string;
  version?: string;
}

export interface BdappsVerifyOtpResponse {
  statusCode?: string;
  statusDetail?: string;
  subscriptionStatus?: string;
  subscriberId?: string;
  version?: string;
}

export interface BdappsUnsubscribeResponse {
  success?: boolean;
  subscriptionStatus?: string;
  subscriberId?: string;
  action?: string;
  statusCode?: string;
  statusDetail?: string;
}

/**
 * Format mobile number to 8801XXXXXXXXX standard
 */
export function formatBdappsMobile(mobile: string): string {
  let cleaned = mobile.trim().replace(/\D/g, '');
  if (cleaned.startsWith('01')) {
    cleaned = '88' + cleaned;
  } else if (cleaned.startsWith('1')) {
    cleaned = '880' + cleaned;
  }
  return cleaned;
}

/**
 * Helper to execute POST request with x-www-form-urlencoded content
 */
async function postFormUrlEncoded(endpoint: string, params: Record<string, string>) {
  const url = `${BDAPPS_BASE_URL}/${endpoint}`;
  const body = new URLSearchParams(params).toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`BDApps API HTTP error ${response.status}: ${response.statusText}`);
  }

  const json = await response.json();
  return json;
}

export const bdappsService = {
  /**
   * Check user subscription status
   */
  async checkSubscription(mobile: string): Promise<BdappsCheckSubResponse> {
    const formatted = formatBdappsMobile(mobile);
    const data = await postFormUrlEncoded('check_subscription.php', { user_mobile: formatted });
    
    // Normalize isSubscribed flag
    const isSubscribed = data.subscriptionStatus === 'REGISTERED';
    return {
      ...data,
      isSubscribed,
    };
  },

  /**
   * Request OTP for subscription
   */
  async sendOtp(mobile: string): Promise<BdappsSendOtpResponse> {
    const formatted = formatBdappsMobile(mobile);
    const data = await postFormUrlEncoded('send_otp.php', { user_mobile: formatted });
    return data;
  },

  /**
   * Verify OTP to complete subscription
   */
  async verifyOtp(otp: string, referenceNo: string): Promise<BdappsVerifyOtpResponse> {
    const data = await postFormUrlEncoded('verify_otp.php', { Otp: otp, referenceNo });
    return data;
  },

  /**
   * Unsubscribe user from carrier service
   */
  async unsubscribe(mobile: string): Promise<BdappsUnsubscribeResponse> {
    const formatted = formatBdappsMobile(mobile);
    const data = await postFormUrlEncoded('unsubscribe.php', { user_mobile: formatted });
    return data;
  },
};
