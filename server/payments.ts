/**
 * NEXVORA GLOBAL - Payment Integration Architecture & Gateway Specifications
 * 
 * Legitimate, production-ready structure for external disbursement and merchant processing.
 * NO simulated or fake transactions. If credentials are not present in process.env,
 * gateways are marked unconfigured and all withdrawals are queued for administrative compliance verification.
 */

import type { PaymentGatewayConfig, PaymentMethodType } from '../src/types';

export interface GatewayIntegrationSpec {
  id: PaymentMethodType;
  name: string;
  isConfigured: boolean;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  webhookUrl: string;
  docsUrl: string;
  notes: string;
}

/**
 * Evaluates whether environment variables for each payment gateway are configured.
 */
export function getPaymentGatewaySpecs(appUrl: string = 'https://nexvora.global'): GatewayIntegrationSpec[] {
  const baseUrl = appUrl.replace(/\/$/, '');

  const specs: GatewayIntegrationSpec[] = [
    {
      id: 'bKash',
      name: 'bKash Merchant / Tokenized Payout API',
      isConfigured: Boolean(
        process.env.BKASH_APP_KEY &&
        process.env.BKASH_APP_SECRET &&
        process.env.BKASH_USERNAME &&
        process.env.BKASH_PASSWORD
      ),
      requiredEnvVars: [
        'BKASH_APP_KEY',
        'BKASH_APP_SECRET',
        'BKASH_USERNAME',
        'BKASH_PASSWORD',
        'BKASH_BASE_URL',
      ],
      missingEnvVars: [
        !process.env.BKASH_APP_KEY && 'BKASH_APP_KEY',
        !process.env.BKASH_APP_SECRET && 'BKASH_APP_SECRET',
        !process.env.BKASH_USERNAME && 'BKASH_USERNAME',
        !process.env.BKASH_PASSWORD && 'BKASH_PASSWORD',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/bkash`,
      docsUrl: 'https://developer.bKash.com/',
      notes: 'Requires verified Bangladesh merchant account with Tokenized Checkout and B2C Payout Agreement enabled.',
    },
    {
      id: 'Nagad',
      name: 'Nagad Disbursement & PGW API',
      isConfigured: Boolean(
        process.env.NAGAD_MERCHANT_ID &&
        process.env.NAGAD_PUBLIC_KEY &&
        process.env.NAGAD_PRIVATE_KEY
      ),
      requiredEnvVars: [
        'NAGAD_MERCHANT_ID',
        'NAGAD_PUBLIC_KEY',
        'NAGAD_PRIVATE_KEY',
        'NAGAD_BASE_URL',
      ],
      missingEnvVars: [
        !process.env.NAGAD_MERCHANT_ID && 'NAGAD_MERCHANT_ID',
        !process.env.NAGAD_PUBLIC_KEY && 'NAGAD_PUBLIC_KEY',
        !process.env.NAGAD_PRIVATE_KEY && 'NAGAD_PRIVATE_KEY',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/nagad`,
      docsUrl: 'https://pgw.mynagad.com/',
      notes: 'Requires RSA 2048-bit keypair signing and registered IP whitelisting with Nagad PGW desk.',
    },
    {
      id: 'Bank Transfer',
      name: 'Direct Global Wire & Local Bank Clearing',
      isConfigured: Boolean(
        process.env.BANK_WIRE_PARTNER_API_KEY ||
        process.env.BANK_MERCHANT_ACCOUNT
      ),
      requiredEnvVars: [
        'BANK_MERCHANT_ACCOUNT',
        'BANK_WIRE_PARTNER_API_KEY',
        'BANK_SWIFT_ROUTING_CODE',
      ],
      missingEnvVars: [
        !process.env.BANK_MERCHANT_ACCOUNT && 'BANK_MERCHANT_ACCOUNT',
        !process.env.BANK_WIRE_PARTNER_API_KEY && 'BANK_WIRE_PARTNER_API_KEY',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/bank-wire`,
      docsUrl: 'https://nexvora.global/admin/docs/bank-clearing',
      notes: 'Domestic and international SWIFT settlements processed via bank partner API or manual compliance wire desk.',
    },
    {
      id: 'PayPal',
      name: 'PayPal Payouts & Marketplace Commerce',
      isConfigured: Boolean(
        process.env.PAYPAL_CLIENT_ID &&
        process.env.PAYPAL_CLIENT_SECRET
      ),
      requiredEnvVars: [
        'PAYPAL_CLIENT_ID',
        'PAYPAL_CLIENT_SECRET',
        'PAYPAL_WEBHOOK_ID',
        'PAYPAL_MODE', // 'sandbox' | 'live'
      ],
      missingEnvVars: [
        !process.env.PAYPAL_CLIENT_ID && 'PAYPAL_CLIENT_ID',
        !process.env.PAYPAL_CLIENT_SECRET && 'PAYPAL_CLIENT_SECRET',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/paypal`,
      docsUrl: 'https://developer.paypal.com/docs/api/payments.payouts-batch/v1/',
      notes: 'Requires verified PayPal Business account with Payouts permission enabled by account manager.',
    },
    {
      id: 'Payoneer',
      name: 'Payoneer Mass Payouts API',
      isConfigured: Boolean(
        process.env.PAYONEER_PROGRAM_ID &&
        process.env.PAYONEER_CLIENT_ID &&
        process.env.PAYONEER_CLIENT_SECRET
      ),
      requiredEnvVars: [
        'PAYONEER_PROGRAM_ID',
        'PAYONEER_CLIENT_ID',
        'PAYONEER_CLIENT_SECRET',
        'PAYONEER_API_URL',
      ],
      missingEnvVars: [
        !process.env.PAYONEER_PROGRAM_ID && 'PAYONEER_PROGRAM_ID',
        !process.env.PAYONEER_CLIENT_ID && 'PAYONEER_CLIENT_ID',
        !process.env.PAYONEER_CLIENT_SECRET && 'PAYONEER_CLIENT_SECRET',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/payoneer`,
      docsUrl: 'https://developer.payoneer.com/',
      notes: 'Requires registered Payoneer Enterprise Payout Partner agreement and API token credentials.',
    },
    {
      id: 'USDT/Crypto',
      name: 'USDT (TRC20 / ERC20) Settlement API',
      isConfigured: Boolean(
        process.env.CRYPTO_HOTWALLET_ADDRESS &&
        process.env.CRYPTO_RPC_ENDPOINT &&
        process.env.CRYPTO_WEBHOOK_SECRET
      ),
      requiredEnvVars: [
        'CRYPTO_HOTWALLET_ADDRESS',
        'CRYPTO_RPC_ENDPOINT',
        'CRYPTO_WEBHOOK_SECRET',
      ],
      missingEnvVars: [
        !process.env.CRYPTO_HOTWALLET_ADDRESS && 'CRYPTO_HOTWALLET_ADDRESS',
        !process.env.CRYPTO_RPC_ENDPOINT && 'CRYPTO_RPC_ENDPOINT',
        !process.env.CRYPTO_WEBHOOK_SECRET && 'CRYPTO_WEBHOOK_SECRET',
      ].filter(Boolean) as string[],
      webhookUrl: `${baseUrl}/api/webhooks/crypto`,
      docsUrl: 'https://nexvora.global/admin/docs/crypto-settlement',
      notes: 'Automated multi-signature node integration for USDT TRC20/ERC20 transactions with minimum 12 network confirmations.',
    },
  ];

  return specs;
}
