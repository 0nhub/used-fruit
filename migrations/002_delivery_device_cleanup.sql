-- Removing a device (logout/account deletion) must not be prevented by its
-- historical push receipts. The durable per-message outbox remains intact.
ALTER TABLE notification_deliveries DROP CONSTRAINT notification_deliveries_device_id_fkey;
ALTER TABLE notification_deliveries ADD CONSTRAINT notification_deliveries_device_id_fkey
  FOREIGN KEY (device_id) REFERENCES device_tokens(id) ON DELETE CASCADE;
