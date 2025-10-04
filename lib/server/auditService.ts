// --- filename: lib/server/auditService.ts ---
/**
 * Audit Logging Service
 * Logs security-relevant events for compliance and debugging
 */

import { getSupabaseAdmin } from '@/lib/supabaseAdmin';
import { Json } from '@/types/supabase';

export interface AuditLogParams {
  eventType: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

class AuditService {
  private supabase = getSupabaseAdmin();

  async log(params: AuditLogParams): Promise<void> {
    const { eventType, userId, metadata, ipAddress, userAgent } = params;

    try {
      // FIXED: Cast metadata to unknown then to any to satisfy Supabase Json type
      await this.supabase
        .from('audit_logs')
        .insert({
          event_type: eventType,
          user_id: userId || null,
          event_metadata: (metadata || {}) as Json, // Cast to satisfy Supabase Json type
          ip_address: ipAddress,
          user_agent: userAgent,
        });
    } catch (error) {
      // Don't throw - audit logging should never break the main flow
      console.error('Audit log error:', error);
    }
  }
}

const auditService = new AuditService();

// Export as function for convenience
export const auditLog = (params: AuditLogParams) => auditService.log(params);