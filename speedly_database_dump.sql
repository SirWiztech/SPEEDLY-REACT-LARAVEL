-- Speedly Full Database Dump
-- Generated: 2026-05-07 21:49:49
-- Database: speedly_new

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

DROP TABLE IF EXISTS `admin_activity_logs`;
CREATE TABLE `admin_activity_logs` (
  `id` char(36) NOT NULL,
  `admin_id` char(36) DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` char(36) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('01ed2cd6-1ce5-11f1-9868-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"offline\"}', '{\"driver_status\":\"online\"}', NULL, '2026-03-11 01:55:33');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('4490145a-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"offline\"}', '{\"driver_status\":\"online\"}', NULL, '2026-03-09 01:52:31');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('4c7a2dc9-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"online\"}', '{\"driver_status\":\"offline\"}', NULL, '2026-03-09 01:52:44');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('50706df9-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"offline\"}', '{\"driver_status\":\"online\"}', NULL, '2026-03-09 01:52:50');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('56d8789c-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"online\"}', '{\"driver_status\":\"offline\"}', NULL, '2026-03-09 01:53:01');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('5e09335a-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"offline\"}', '{\"driver_status\":\"online\"}', NULL, '2026-03-09 01:53:13');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('feb23e14-1ce4-11f1-9868-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"online\"}', '{\"driver_status\":\"offline\"}', NULL, '2026-03-11 01:55:27');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('78794f837ddecfae34a53ec370b9681d', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"online\"}', '{\"driver_status\":\"offline\"}', NULL, '2026-04-13 22:55:21');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('1b99ee8321a5f2e2f77dbdf4b785ed3a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'status_change', 'driver', 'b7d8127cac762a5399a5aa0d6af2de62', '{\"driver_status\":\"offline\"}', '{\"driver_status\":\"online\"}', NULL, '2026-04-13 22:55:25');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('f6d34695-79c4-2c62-5614-f29de846fce1', 'c1d76081-1370-11f1-8601-5820b173055a', 'login', 'system', NULL, NULL, NULL, '::1', '2026-04-13 23:01:30');
INSERT INTO `admin_activity_logs` (`id`, `admin_id`, `action`, `entity_type`, `entity_id`, `old_values`, `new_values`, `ip_address`, `created_at`) VALUES ('bccd5031-f17c-87c7-7912-87b114374b5c', 'c1d76081-1370-11f1-8601-5820b173055a', 'login', 'system', NULL, NULL, NULL, '::1', '2026-04-20 18:47:44');

DROP TABLE IF EXISTS `admin_sessions`;
CREATE TABLE `admin_sessions` (
  `id` char(36) NOT NULL,
  `admin_id` char(36) DEFAULT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_activity` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `cache`;
CREATE TABLE `cache` (
  `key` varchar(191) NOT NULL,
  `value` longtext NOT NULL,
  `expiration` int(11) NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `client_profiles`;
CREATE TABLE `client_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `membership_tier` varchar(50) DEFAULT 'basic',
  `total_rides` int(11) DEFAULT '0',
  `total_spent` decimal(12,2) DEFAULT '0.00',
  `average_rating` decimal(3,2) DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `home_address` text,
  `office_address` text,
  `preferred_payment_method` varchar(50) DEFAULT NULL,
  `ride_preferences` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f604a1-1373-11f1-8601-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'gold', '19', '18451.00', '4.50', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f6083a-1373-11f1-8601-5820b173055a', '02e3a9c8-1373-11f1-8601-5820b173055a', 'premium', '54', '51415.00', '4.70', NULL, NULL, NULL, NULL, NULL, NULL, '2025-09-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f608d4-1373-11f1-8601-5820b173055a', '02e3ac16-1373-11f1-8601-5820b173055a', 'premium', '18', '48477.00', '4.60', NULL, NULL, NULL, NULL, NULL, NULL, '2025-10-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60950-1373-11f1-8601-5820b173055a', '02e3ad5d-1373-11f1-8601-5820b173055a', 'gold', '15', '31306.00', '5.00', NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-27 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f609c3-1373-11f1-8601-5820b173055a', '02e3aea7-1373-11f1-8601-5820b173055a', 'premium', '6', '5011.00', '4.90', NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-27 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60a38-1373-11f1-8601-5820b173055a', '02e3b001-1373-11f1-8601-5820b173055a', 'basic', '19', '28994.00', '4.50', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-27 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60aae-1373-11f1-8601-5820b173055a', '02e3b115-1373-11f1-8601-5820b173055a', 'basic', '6', '44447.00', '4.90', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-06 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60b29-1373-11f1-8601-5820b173055a', '02e3b21e-1373-11f1-8601-5820b173055a', 'gold', '31', '31694.00', '4.10', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-13 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60ba7-1373-11f1-8601-5820b173055a', '02e3b314-1373-11f1-8601-5820b173055a', 'basic', '16', '17637.00', '4.60', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('02f60c2a-1373-11f1-8601-5820b173055a', '02e3b419-1373-11f1-8601-5820b173055a', 'premium', '28', '8007.00', '4.90', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-27 01:26:39', '2026-02-27 01:26:39');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('67fde3d1-1b52-11f1-aa1d-5820b173055a', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-09 01:53:30', '2026-03-09 01:53:30');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('abb98427-1373-11f1-8601-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-27 01:31:23', '2026-02-27 01:31:23');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('bb15df85-159e-11f1-8d1b-5820b173055a', '3225ab34-4925-dd5c-8dd8-15c24cceee55', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-01 19:44:51', '2026-03-01 19:44:51');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('cdfbefa8-1ae5-11f1-aa1d-5820b173055a', '6cf19188-bc03-6b31-3f53-a46d13570931', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 12:56:13', '2026-03-08 12:56:13');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('d953476f-137e-11f1-8601-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-27 02:51:23', '2026-02-27 02:51:23');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('4a2d1f9c-432f-11f1-9c4f-5820b173055a', 'c0bc1e3d48cb38cfa6e5ca6d22453cd6', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-28 19:22:23', '2026-04-28 19:22:23');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('cfc6ebe1-00ac-42f0-91a7-84d0417c97ef', '73e30d79-8853-41d3-9785-803b6447a038', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-07 19:45:52', '2026-05-07 19:45:52');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('a1aa2033-129a-4f7d-8f65-b7f3a68ba78c', 'eadfa069-5221-431a-8d16-c19d85b6aa12', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-07 19:47:18', '2026-05-07 19:47:18');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('99887408-d9bc-4542-928e-10342f43d300', 'b2e4d1cf-0853-4bc6-b7e3-94aa19c09794', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-07 19:47:41', '2026-05-07 19:47:41');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('609b4cc3-a09a-418d-b814-b36d2c7c2e17', 'd5de9b31-c55b-4280-9da2-4a95130f7f5d', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-07 19:50:07', '2026-05-07 19:50:07');
INSERT INTO `client_profiles` (`id`, `user_id`, `membership_tier`, `total_rides`, `total_spent`, `average_rating`, `emergency_contact_name`, `emergency_contact_phone`, `home_address`, `office_address`, `preferred_payment_method`, `ride_preferences`, `created_at`, `updated_at`) VALUES ('72e0a1bb-a993-441a-80e0-1373a553367f', '39076126-b04d-4d85-af88-5bd8720776d4', 'basic', '0', '0.00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-05-07 19:52:35', '2026-05-07 19:52:35');

DROP TABLE IF EXISTS `client_ratings`;
CREATE TABLE `client_ratings` (
  `id` char(36) NOT NULL,
  `ride_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `client_id` char(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `review` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `daily_revenue_summary`;
CREATE TABLE `daily_revenue_summary` (
  `id` char(36) NOT NULL,
  `date` date NOT NULL,
  `total_rides` int(11) DEFAULT '0',
  `completed_rides` int(11) DEFAULT '0',
  `cancelled_rides` int(11) DEFAULT '0',
  `total_revenue` decimal(12,2) DEFAULT '0.00',
  `platform_commission` decimal(12,2) DEFAULT '0.00',
  `driver_payouts` decimal(12,2) DEFAULT '0.00',
  `average_fare` decimal(10,2) DEFAULT NULL,
  `new_users` int(11) DEFAULT '0',
  `new_drivers` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `disputes`;
CREATE TABLE `disputes` (
  `id` char(36) NOT NULL,
  `dispute_number` varchar(20) NOT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `raised_by` char(36) DEFAULT NULL,
  `raised_against` char(36) DEFAULT NULL,
  `dispute_type` varchar(50) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `status` varchar(50) DEFAULT 'open',
  `priority` varchar(20) DEFAULT 'medium',
  `assigned_to` char(36) DEFAULT NULL,
  `resolution` text,
  `resolved_at` timestamp NULL DEFAULT NULL,
  `resolved_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `dispute_messages`;
CREATE TABLE `dispute_messages` (
  `id` char(36) NOT NULL,
  `dispute_id` char(36) DEFAULT NULL,
  `sender_id` char(36) DEFAULT NULL,
  `message` text NOT NULL,
  `attachment_url` text,
  `is_admin_reply` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `driver_approval_queue`;
CREATE TABLE `driver_approval_queue` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `reviewed_by` char(36) DEFAULT NULL,
  `review_notes` text,
  `status` varchar(50) DEFAULT 'pending',
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `driver_approval_queue` (`id`, `driver_id`, `reviewed_by`, `review_notes`, `status`, `reviewed_at`, `created_at`) VALUES ('1b81d2f9-1b4c-11f1-aa1d-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'c1d76081-1370-11f1-8601-5820b173055a', NULL, 'approved', '2026-03-09 01:29:52', '2026-03-09 01:08:25');

DROP TABLE IF EXISTS `driver_bank_details`;
CREATE TABLE `driver_bank_details` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `is_default` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `driver_earnings`;
CREATE TABLE `driver_earnings` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `commission` decimal(10,2) NOT NULL,
  `net_earnings` decimal(10,2) NOT NULL,
  `earnings_type` varchar(50) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `driver_kyc_documents`;
CREATE TABLE `driver_kyc_documents` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `document_type` varchar(50) NOT NULL,
  `document_url` text NOT NULL,
  `verification_status` varchar(50) DEFAULT 'pending',
  `rejection_reason` text,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `verified_at` timestamp NULL DEFAULT NULL,
  `verified_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `driver_kyc_documents` (`id`, `driver_id`, `document_type`, `document_url`, `verification_status`, `rejection_reason`, `uploaded_at`, `verified_at`, `verified_by`, `created_at`, `updated_at`) VALUES ('1b76533e-1b4c-11f1-aa1d-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'drivers_license_front', 'SERVER/uploads/kyc/license_front_1773014905_65efce0e78302741.PNG', 'approved', NULL, '2026-03-09 01:08:25', '2026-03-09 01:29:52', 'c1d76081-1370-11f1-8601-5820b173055a', '2026-03-09 01:28:51', '2026-03-09 01:29:52');
INSERT INTO `driver_kyc_documents` (`id`, `driver_id`, `document_type`, `document_url`, `verification_status`, `rejection_reason`, `uploaded_at`, `verified_at`, `verified_by`, `created_at`, `updated_at`) VALUES ('1b7930f3-1b4c-11f1-aa1d-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'selfie_with_id', 'SERVER/uploads/kyc/selfie_1773014905_89151eeb275eda17.PNG', 'approved', NULL, '2026-03-09 01:08:25', '2026-03-09 01:29:52', 'c1d76081-1370-11f1-8601-5820b173055a', '2026-03-09 01:28:51', '2026-03-09 01:29:52');

DROP TABLE IF EXISTS `driver_performance_summary`;
CREATE TABLE `driver_performance_summary` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `date` date NOT NULL,
  `rides_completed` int(11) DEFAULT '0',
  `rides_cancelled` int(11) DEFAULT '0',
  `total_earnings` decimal(10,2) DEFAULT '0.00',
  `average_rating` decimal(3,2) DEFAULT NULL,
  `online_minutes` int(11) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `driver_profiles`;
CREATE TABLE `driver_profiles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `license_number` varchar(50) NOT NULL,
  `license_expiry` date NOT NULL,
  `driver_status` varchar(50) DEFAULT 'offline',
  `verification_status` varchar(50) DEFAULT 'pending',
  `total_earnings` decimal(12,2) DEFAULT '0.00',
  `wallet_balance` decimal(12,2) DEFAULT '0.00',
  `completed_rides` int(11) DEFAULT '0',
  `cancelled_rides` int(11) DEFAULT '0',
  `average_rating` decimal(3,2) DEFAULT NULL,
  `total_reviews` int(11) DEFAULT '0',
  `acceptance_rate` decimal(5,2) DEFAULT NULL,
  `current_latitude` decimal(10,8) DEFAULT NULL,
  `current_longitude` decimal(11,8) DEFAULT NULL,
  `last_location_update` timestamp NULL DEFAULT NULL,
  `is_available` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('02fb78ad-1373-11f1-8601-5820b173055a', '02ea577a-1373-11f1-8601-5820b173055a', 'LIC2152', '2027-02-26', 'offline', 'approved', '0.00', '0.00', '181', '0', '4.57', '0', NULL, '6.50593873', '3.34255456', NULL, '0', '2025-06-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('02fb8fee-1373-11f1-8601-5820b173055a', '02ec1f57-1373-11f1-8601-5820b173055a', 'LIC2864', '2028-02-26', 'offline', 'approved', '0.00', '0.00', '39', '0', '4.65', '0', NULL, '6.49562780', '3.34531005', NULL, '1', '2025-07-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('02fb91dd-1373-11f1-8601-5820b173055a', '02ec22d9-1373-11f1-8601-5820b173055a', 'LIC4240', '2027-02-26', 'online', 'approved', '0.00', '0.00', '57', '0', '4.86', '0', NULL, '6.47630782', '3.42408690', NULL, '0', '2025-08-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('02fb92ba-1373-11f1-8601-5820b173055a', '02ec251d-1373-11f1-8601-5820b173055a', 'LIC6300', '2028-02-26', 'online', 'approved', '0.00', '0.00', '30', '0', '4.73', '0', NULL, '6.48833883', '3.36114582', NULL, '1', '2025-09-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('02fb937d-1373-11f1-8601-5820b173055a', '02ec26ac-1373-11f1-8601-5820b173055a', 'LIC9435', '2027-02-26', 'offline', 'approved', '0.00', '0.00', '77', '0', '4.89', '0', NULL, '6.48059013', '3.42474079', NULL, '1', '2025-10-27 00:26:39', '2026-02-27 01:26:39');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('7663e186-1344-11f1-8601-5820b173055a', '765c52e0-1344-11f1-8601-5820b173055a', 'LIC001', '2025-12-31', 'online', 'approved', '0.00', '0.00', '1242', '0', '4.80', '0', NULL, '6.52440000', '3.37920000', NULL, '1', '2026-02-26 19:53:27', '2026-02-26 19:53:27');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('76641ce3-1344-11f1-8601-5820b173055a', '765c8d68-1344-11f1-8601-5820b173055a', 'LIC002', '2025-12-31', 'online', 'approved', '0.00', '0.00', '892', '0', '5.00', '0', NULL, '6.52440000', '3.37920000', NULL, '1', '2026-02-26 19:53:27', '2026-02-26 19:53:27');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('76641eb5-1344-11f1-8601-5820b173055a', '765c8edf-1344-11f1-8601-5820b173055a', 'LIC003', '2025-12-31', 'online', 'approved', '0.00', '0.00', '2156', '0', '4.90', '0', NULL, '6.52440000', '3.37920000', NULL, '1', '2026-02-26 19:53:27', '2026-02-26 19:53:27');
INSERT INTO `driver_profiles` (`id`, `user_id`, `license_number`, `license_expiry`, `driver_status`, `verification_status`, `total_earnings`, `wallet_balance`, `completed_rides`, `cancelled_rides`, `average_rating`, `total_reviews`, `acceptance_rate`, `current_latitude`, `current_longitude`, `last_location_update`, `is_available`, `created_at`, `updated_at`) VALUES ('b7d8127cac762a5399a5aa0d6af2de62', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', '01567389', '2000-05-04', 'online', 'approved', '11190.88', '0.00', '3', '0', '5.00', '1', NULL, '4.77310000', '7.00850000', '2026-04-13 22:55:25', '1', '2026-03-09 00:16:39', '2026-04-19 20:24:14');

DROP TABLE IF EXISTS `driver_ratings`;
CREATE TABLE `driver_ratings` (
  `id` char(36) NOT NULL,
  `ride_id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `driver_id` char(36) NOT NULL,
  `rating` int(11) NOT NULL,
  `review` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `driver_ratings` (`id`, `ride_id`, `user_id`, `driver_id`, `rating`, `review`, `created_at`) VALUES ('fc368c29136be033e6bf7911c5988ab2', '5a03cb473f711c796b6d51dda1ff9a71', '9a84c531-dffe-203a-6251-31764611114e', 'b7d8127cac762a5399a5aa0d6af2de62', '5', 'Test review fromjjj debug page', '2026-03-11 01:38:52');

DROP TABLE IF EXISTS `driver_schedule`;
CREATE TABLE `driver_schedule` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `day_of_week` int(11) DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `driver_vehicles`;
CREATE TABLE `driver_vehicles` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `vehicle_model` varchar(100) NOT NULL,
  `vehicle_year` int(11) DEFAULT NULL,
  `vehicle_color` varchar(50) DEFAULT NULL,
  `plate_number` varchar(20) NOT NULL,
  `vehicle_type` varchar(50) DEFAULT 'sedan',
  `passenger_capacity` int(11) DEFAULT '4',
  `insurance_expiry` date DEFAULT NULL,
  `road_worthiness_expiry` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('6ea61433-1373-11f1-8601-5820b173055a', '02fb78ad-1373-11f1-8601-5820b173055a', 'Kia Optima', '2020', 'White', 'LAG312AB', 'economy', '4', NULL, NULL, '1', '2026-02-27 01:29:40', '2026-02-27 01:29:40');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('6ea61561-1373-11f1-8601-5820b173055a', '02fb8fee-1373-11f1-8601-5820b173055a', 'Honda Civic', '2023', 'Silver', 'LAG457AB', 'sedan', '4', NULL, NULL, '1', '2026-02-27 01:29:40', '2026-02-27 01:29:40');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('6ea615c8-1373-11f1-8601-5820b173055a', '02fb91dd-1373-11f1-8601-5820b173055a', 'Honda Civic', '2020', 'Silver', 'LAG449AB', 'sedan', '4', NULL, NULL, '1', '2026-02-27 01:29:40', '2026-02-27 01:29:40');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('6ea61623-1373-11f1-8601-5820b173055a', '02fb92ba-1373-11f1-8601-5820b173055a', 'Toyota Camry', '2021', 'Black', 'LAG306AB', 'economy', '4', NULL, NULL, '1', '2026-02-27 01:29:40', '2026-02-27 01:29:40');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('6ea6167e-1373-11f1-8601-5820b173055a', '02fb937d-1373-11f1-8601-5820b173055a', 'Kia Optima', '2023', 'Blue', 'LAG624AB', 'economy', '4', NULL, NULL, '1', '2026-02-27 01:29:40', '2026-02-27 01:29:40');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('b3a8ce65-1344-11f1-8601-5820b173055a', '7663e186-1344-11f1-8601-5820b173055a', 'Toyota Prius', '2022', 'Black', 'LAG123AB', 'economy', '4', NULL, NULL, '1', '2026-02-26 19:55:10', '2026-02-26 19:55:10');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('b3a8e1d1-1344-11f1-8601-5820b173055a', '76641ce3-1344-11f1-8601-5820b173055a', 'Honda Civic', '2023', 'White', 'LAG456CD', 'economy', '4', NULL, NULL, '1', '2026-02-26 19:55:10', '2026-02-26 19:55:10');
INSERT INTO `driver_vehicles` (`id`, `driver_id`, `vehicle_model`, `vehicle_year`, `vehicle_color`, `plate_number`, `vehicle_type`, `passenger_capacity`, `insurance_expiry`, `road_worthiness_expiry`, `is_active`, `created_at`, `updated_at`) VALUES ('b3a8e306-1344-11f1-8601-5820b173055a', '76641eb5-1344-11f1-8601-5820b173055a', 'Toyota Camry', '2022', 'Silver', 'LAG789EF', 'sedan', '4', NULL, NULL, '1', '2026-02-26 19:55:10', '2026-02-26 19:55:10');

DROP TABLE IF EXISTS `driver_withdrawals`;
CREATE TABLE `driver_withdrawals` (
  `id` char(36) NOT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `account_number` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `processed_by` char(36) DEFAULT NULL,
  `processed_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE `failed_jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(100) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `jobs`;
CREATE TABLE `jobs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(100) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) unsigned NOT NULL,
  `reserved_at` int(10) unsigned DEFAULT NULL,
  `available_at` int(10) unsigned NOT NULL,
  `created_at` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE `job_batches` (
  `id` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `login_history`;
CREATE TABLE `login_history` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `device_type` varchar(50) DEFAULT NULL,
  `login_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `logout_time` timestamp NULL DEFAULT NULL,
  `is_successful` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `migrations`;
CREATE TABLE `migrations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('1', '2026_04_25_000001_create_speedly_tables', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('2', '0001_01_01_000000_create_users_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('3', '0001_01_01_000001_create_cache_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('4', '0001_01_01_000002_create_jobs_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('5', '2025_08_14_170933_add_two_factor_columns_to_users_table', '1');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('6', '2026_05_01_000421_add_role_to_users_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('7', '2026_05_01_000433_create_client_profiles_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('8', '2026_05_01_000434_create_driver_profiles_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('9', '2026_05_01_000436_create_driver_vehicles_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('10', '2026_05_01_000438_create_driver_kyc_documents_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('11', '2026_05_01_000440_create_driver_approval_queue_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('12', '2026_05_01_000451_create_rides_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('13', '2026_05_01_000453_create_ride_cancellations_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('14', '2026_05_01_000456_create_wallet_transactions_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('15', '2026_05_01_000457_create_driver_withdrawals_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('16', '2026_05_01_000459_create_driver_bank_details_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('17', '2026_05_01_000512_create_notifications_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('18', '2026_05_01_000514_create_admin_activity_logs_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('19', '2026_05_01_000516_create_payment_gateway_transactions_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('20', '2026_05_01_000517_create_payment_sessions_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('21', '2026_05_01_000519_create_password_resets_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('22', '2026_05_01_000521_create_system_settings_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('23', '2026_05_01_000523_create_driver_ratings_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('24', '2026_05_01_000526_create_client_ratings_table', '2');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('25', '2026_05_07_193000_rename_password_hash_to_password', '3');
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES ('27', '2026_05_07_193417_create_personal_access_tokens_table', '4');

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `is_read` tinyint(1) DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('14042243f4a917c2901c0c25fe6fa8b3', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'ride_update', 'New Private Ride Request', '? New private ride request from Lagos Area (6.5401, 3.3443)...', NULL, '1', NULL, '2026-03-11 02:28:02');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('1bdb23d7102be407ec6916c3d86142bc', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'ride_update', 'New Private Ride Request', '? New private ride request from Mainland Area, Lagos (6.5359, ...', NULL, '1', NULL, '2026-03-15 19:29:16');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('4ad2e574fc54734348c44b00c82e2d37', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Completed', 'Your ride has been completed. Thank you for riding with Speedly!', NULL, '1', NULL, '2026-03-11 00:30:54');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('8021a897da68e019b89a6eca829245c1', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Accepted', 'Your ride has been accepted by a driver. They are on the way to pick you up.', NULL, '1', NULL, '2026-03-11 00:17:28');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('81db17cac41501e37ebce59f48b7fab7', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Completed', 'Your ride has been completed. Thank you for riding with Speedly! Please rate your driver.', NULL, '1', NULL, '2026-03-15 19:37:37');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('bd2ec393060d916ad76334c2045bc287', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'system', 'KYC Approved', 'Your KYC verification has been approved. You can now start accepting rides.', NULL, '1', NULL, '2026-03-09 01:29:52');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('cac0f7ec30bb58e91f2d3f24d5d2c4db', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Accepted', 'Your ride has been accepted by a driver. They are on the way to pick you up.', NULL, '1', NULL, '2026-03-15 19:34:22');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('dd9b9bba2b606fb6eaf438bf3287f53e', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'ride_update', 'Ride Cancelled', 'Your ride has been cancelled by the client. Reason: Cancelled by client', NULL, '1', NULL, '2026-03-14 23:52:46');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('1f55dccd-25ce-11f1-8dd7-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'payment', 'Deposit Successful', 'Your deposit of ?153.75 has been successful. New balance: ?153.75', NULL, '0', NULL, '2026-03-22 10:04:17');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('a64b287d-25d3-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?500.00 has been successful. New balance: ?500.00', NULL, '1', NULL, '2026-03-22 10:43:51');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('2de3f838-25d6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?600.00 has been successful. New balance: ?1,100.00', NULL, '1', NULL, '2026-03-22 11:01:58');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('3dfba0d6-25d7-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?1,000.00 has been successful. New balance: ?2,100.00', NULL, '1', NULL, '2026-03-22 11:09:34');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('374c7812-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?5,000.00 has been successful. New balance: ?7,100.00', NULL, '1', NULL, '2026-03-22 11:23:42');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('b6b51f41-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?10,000.00 has been successful. New balance: ?17,100.00', NULL, '1', NULL, '2026-03-22 11:27:16');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('c4081c29-25dd-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?20,000.00 has been successful. New balance: ?37,100.00', NULL, '1', NULL, '2026-03-22 11:56:16');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('3e29fee8-25e2-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?3,000.00 has been successful. New balance: ?40,100.00', NULL, '1', NULL, '2026-03-22 12:28:19');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('1ac33f7e-25f5-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?2,000.00 has been successful. New balance: ?42,100.00', NULL, '1', NULL, '2026-03-22 14:43:20');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('f739c5fd-25f6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?3,000.00 has been successful. New balance: ?45,100.00', NULL, '1', NULL, '2026-03-22 14:56:39');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('0821321c-25fa-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?100,000.00 has been successful. New balance: ?145,100.00', NULL, '1', NULL, '2026-03-22 15:18:36');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('6494c6dd-3334-11f1-9ca4-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'payment', 'Deposit Successful', 'Your deposit of ?100.00 has been successful. New balance: ?253.75', NULL, '0', NULL, '2026-04-08 11:19:06');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('1a4b6cae-3336-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?100.00 has been successful. New balance: ?145,200.00', NULL, '1', NULL, '2026-04-08 11:31:21');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('cb173ed8-3338-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?100.00 has been successful. New balance: ?145,300.00', NULL, '1', NULL, '2026-04-08 11:50:36');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('166bbc8a-3339-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'payment', 'Deposit Successful', 'Your deposit of ?100.00 has been successful. New balance: ?145,400.00', NULL, '1', NULL, '2026-04-08 11:52:43');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('c0486f2fd95ba672d416b79721229568', '02ec22d9-1373-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos Mainland...', NULL, '0', NULL, '2026-04-13 22:43:57');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('b09ea7f9711e406f0258e0fc3c5ba9b7', '02ec251d-1373-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos Mainland...', NULL, '0', NULL, '2026-04-13 22:43:57');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('f18e603a0a830e1e00cab6a4223ec748', '765c52e0-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos Mainland...', NULL, '0', NULL, '2026-04-13 22:43:57');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('dddee823cf8734e3da0fe1b19ba05a35', '765c8d68-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos Mainland...', NULL, '0', NULL, '2026-04-13 22:43:57');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('c19d3cc54f3b177cdac87f9459b68d16', '765c8edf-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos Mainland...', NULL, '0', NULL, '2026-04-13 22:43:57');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('7ab643bacdeac569645770df53e7769d', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'ride_update', 'New Private Ride Request', '? New private ride request from Lagos Mainland...', NULL, '1', NULL, '2026-04-13 22:46:14');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('46225576a8fe709d9657580550cb3198', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Accepted', 'Your ride has been accepted by a driver. They are on the way to pick you up.', NULL, '1', NULL, '2026-04-13 22:51:24');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('0650557ff51aa6d408f80c63b2e37850', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Completed', 'Your ride has been completed. Thank you for riding with Speedly! Please rate your driver.', NULL, '1', NULL, '2026-04-13 22:53:05');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('05621b70df518d4ffd02aa8d94fe2422', '4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'system', 'You are now Online', 'You are now online and can receive ride requests. Stay safe and drive carefully!', NULL, '1', NULL, '2026-04-13 22:55:25');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('72d70e2c989214988bf1a42275c7cf84', '02ec22d9-1373-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos, Nigeria...', NULL, '0', NULL, '2026-04-19 19:49:40');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('c7efc3230a427a6d7c1b02e1f3a1063e', '02ec251d-1373-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos, Nigeria...', NULL, '0', NULL, '2026-04-19 19:49:40');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('eb68e27bc8a46263e604464653ff5e48', '765c52e0-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos, Nigeria...', NULL, '0', NULL, '2026-04-19 19:49:40');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('7c2d342f10c1d019e5df803ce878b745', '765c8d68-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos, Nigeria...', NULL, '0', NULL, '2026-04-19 19:49:40');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('5e3b11d73c0ffb25dfb97cc4e7c9f685', '765c8edf-1344-11f1-8601-5820b173055a', 'ride_update', 'New Ride Available', '? New ride request near you from Lagos, Nigeria...', NULL, '0', NULL, '2026-04-19 19:49:40');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('0f3e9e225fa1d83e7906b246e7111d75', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Accepted', 'Your ride has been accepted by a driver. They are on the way to pick you up.', NULL, '0', NULL, '2026-04-19 20:24:03');
INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `data`, `is_read`, `read_at`, `created_at`) VALUES ('e01a2e58094778491531a3912e22ead3', '9a84c531-dffe-203a-6251-31764611114e', 'ride_update', 'Ride Completed', 'Your ride has been completed. Thank you for riding with Speedly! Please rate your driver.', NULL, '0', NULL, '2026-04-19 20:24:14');

DROP TABLE IF EXISTS `password_resets`;
CREATE TABLE `password_resets` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('2f07d6c09404fcbe97b4962a629efe19', '9a84c531-dffe-203a-6251-31764611114e', '7310175c708dc80c7232a8882c93e8d372486d67e266165e604be76718dd0958', '2026-03-16 01:24:42', NULL, '2026-03-16 00:24:42');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('e0174de5e015298e11372e842ea3ca65', '67036d54974cb0f61a5b8d71681e2f85', '237987', '2026-04-25 23:32:18', NULL, '2026-04-25 23:22:18');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('f63d222b2bbd1214cbe3a269d91f1503', 'd406d9fc406d183185e8f417aa011bd1', '748020', '2026-04-25 23:35:20', NULL, '2026-04-25 23:25:20');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('d03e6e9b7d3b417931a98fc8055f78db', '0dd0b90fedfc4f9c823f723203d24a2b', '642230', '2026-04-25 23:43:32', '2026-04-25 23:37:56', '2026-04-25 23:33:32');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('8d8e34fcb6aee2bde1eb0b1d9103d3c8', 'c0bc1e3d48cb38cfa6e5ca6d22453cd6', 'a0000401c26ca6debf59c6c652f97391b9757077171e37240649a42136fb15ae', '2026-04-26 01:25:05', NULL, '2026-04-26 00:25:05');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('bab2a3af9d98afdb8e71d987023b3cc8', 'c1d76081-1370-11f1-8601-5820b173055a', '029ae93b3eb6cbdc19d474155561bc7a61dd9ae52886b7d397a28a73cd3f44d7', '2026-04-26 01:25:56', NULL, '2026-04-26 00:25:56');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('eed3f053-1cee-473f-b1f7-f786a69ba927', 'd5de9b31-c55b-4280-9da2-4a95130f7f5d', '957610', '2026-05-07 20:00:08', NULL, '2026-05-07 19:50:08');
INSERT INTO `password_resets` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES ('6b584c9c-4859-406d-96e7-ac5ef7395846', '39076126-b04d-4d85-af88-5bd8720776d4', '692941', '2026-05-07 20:02:35', '2026-05-07 19:53:24', '2026-05-07 19:52:35');

DROP TABLE IF EXISTS `payment_gateway_transactions`;
CREATE TABLE `payment_gateway_transactions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `gateway_reference` varchar(100) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'NGN',
  `status` enum('pending','processing','success','failed','refunded') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `webhook_received` tinyint(1) DEFAULT '0',
  `webhook_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  KEY `gateway_reference` (`gateway_reference`),
  KEY `user_id` (`user_id`),
  KEY `status` (`status`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('040c12ac-25f5-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFF1D259E50-20260322144242', 'SPD-69BFF1D259E50-20260322144242', '2000.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69BFF1D259E50-20260322144242\",\"payment_reference\":\"SPD-69BFF1D259E50-20260322144242\",\"currency\":\"NGN\",\"amount\":2000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFF1D259E50-20260322144242\",\"payment_reference\":\"SPD-69BFF1D259E50-20260322144242\",\"currency\":\"NGN\",\"amount\":2000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 14:42:42', '2026-03-22 07:12:42', '2026-03-22 14:43:20');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('17523043-25d6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFBDEF894E0-20260322110119', 'SPD-69BFBDEF894E0-20260322110119', '600.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFBDEF894E0-20260322110119\",\"payment_reference\":\"SPD-69BFBDEF894E0-20260322110119\",\"currency\":\"NGN\",\"amount\":600,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFBDEF894E0-20260322110119\",\"payment_reference\":\"SPD-69BFBDEF894E0-20260322110119\",\"currency\":\"NGN\",\"amount\":600,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 11:01:20', NULL, '2026-03-22 11:01:58');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('1e379e39-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFC30383796-20260322112259', 'SPD-69BFC30383796-20260322112259', '5000.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFC30383796-20260322112259\",\"payment_reference\":\"SPD-69BFC30383796-20260322112259\",\"currency\":\"NGN\",\"amount\":5000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFC30383796-20260322112259\",\"payment_reference\":\"SPD-69BFC30383796-20260322112259\",\"currency\":\"NGN\",\"amount\":5000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 11:23:00', NULL, '2026-03-22 11:23:42');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('25776d89-25e2-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFD22A028BB-20260322122738', 'SPD-69BFD22A028BB-20260322122738', '3000.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69BFD22A028BB-20260322122738\",\"payment_reference\":\"SPD-69BFD22A028BB-20260322122738\",\"currency\":\"NGN\",\"amount\":3000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFD22A028BB-20260322122738\",\"payment_reference\":\"SPD-69BFD22A028BB-20260322122738\",\"currency\":\"NGN\",\"amount\":3000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 12:27:38', '2026-03-22 04:57:38', '2026-03-22 12:28:19');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('27f191dc-25d7-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFBFB8E0FDA-20260322110856', 'SPD-69BFBFB8E0FDA-20260322110856', '1000.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFBFB8E0FDA-20260322110856\",\"payment_reference\":\"SPD-69BFBFB8E0FDA-20260322110856\",\"currency\":\"NGN\",\"amount\":1000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFBFB8E0FDA-20260322110856\",\"payment_reference\":\"SPD-69BFBFB8E0FDA-20260322110856\",\"currency\":\"NGN\",\"amount\":1000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 11:08:57', NULL, '2026-03-22 11:09:34');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('4d07ab86-25d1-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFB5D4C0C95-20260322102644', 'SPD-69BFB5D4C0C95-20260322102644', '100.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 10:27:02', NULL, '2026-03-22 10:27:02');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('4e7e09a3-25ce-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFB0DE4A1DF-20260322100534', 'SPD-69BFB0DE4A1DF-20260322100534', '100.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 10:05:36', NULL, '2026-03-22 10:05:36');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('5276d567-25dd-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFCA117008A-20260322115305', 'SPD-69BFCA117008A-20260322115305', '111.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 11:53:06', NULL, '2026-03-22 11:53:06');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('6439c38c-3334-11f1-9ca4-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'TEST-69D62B9A40772-20260408111906', 'KORA_69d62b9a43854', '100.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"TEST-69D62B9A40772-20260408111906\",\"amount\":100,\"fee\":3.75,\"currency\":\"NGN\",\"payment_method\":\"bank_transfer\",\"status\":\"success\",\"payment_reference\":\"KORA_69d62b9a43854\",\"customer\":{\"name\":\"Test User\",\"email\":\"test@example.com\"}}', '1', '{\"reference\":\"TEST-69D62B9A40772-20260408111906\",\"amount\":100,\"fee\":3.75,\"currency\":\"NGN\",\"payment_method\":\"bank_transfer\",\"status\":\"success\",\"payment_reference\":\"KORA_69d62b9a43854\",\"customer\":{\"name\":\"Test User\",\"email\":\"test@example.com\"}}', '2026-04-08 11:19:06', '2026-04-08 11:49:06', '2026-04-08 11:19:06');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('6455fe97-3332-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'TEST-69D6283F6FB40-20260408110447', NULL, '100.00', 'NGN', 'pending', 'korapay_test', NULL, '0', NULL, '2026-04-08 11:04:47', '2026-04-08 11:34:47', '2026-04-08 11:04:47');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('8eeae539-25d3-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFB9AFD035F-20260322104311', 'SPD-69BFB9AFD035F-20260322104311', '500.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFB9AFD035F-20260322104311\",\"payment_reference\":\"SPD-69BFB9AFD035F-20260322104311\",\"currency\":\"NGN\",\"amount\":500,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFB9AFD035F-20260322104311\",\"payment_reference\":\"SPD-69BFB9AFD035F-20260322104311\",\"currency\":\"NGN\",\"amount\":500,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 10:43:12', NULL, '2026-03-22 10:43:51');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('983f869d-3338-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69D632A78195D-20260408114911', 'SPD-69D632A78195D-20260408114911', '100.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69D632A78195D-20260408114911\",\"payment_reference\":\"SPD-69D632A78195D-20260408114911\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\",\"virtual_bank_account_details\":{\"virtual_bank_account\":{\"account_name\":\"Korapay-SPE-CHKOUT\",\"account_number\":\"5206165529\"}},\"transaction_date\":\"2026-04-08 11:49:28\"}', '1', '{\"reference\":\"SPD-69D632A78195D-20260408114911\",\"payment_reference\":\"SPD-69D632A78195D-20260408114911\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\",\"virtual_bank_account_details\":{\"virtual_bank_account\":{\"account_name\":\"Korapay-SPE-CHKOUT\",\"account_number\":\"5206165529\"}},\"transaction_date\":\"2026-04-08 11:49:28\"}', '2026-04-08 11:49:11', '2026-04-08 12:19:11', '2026-04-08 11:50:36');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('a1517388-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFC3DFB0C20-20260322112639', 'SPD-69BFC3DFB0C20-20260322112639', '10000.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFC3DFB0C20-20260322112639\",\"payment_reference\":\"SPD-69BFC3DFB0C20-20260322112639\",\"currency\":\"NGN\",\"amount\":10000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFC3DFB0C20-20260322112639\",\"payment_reference\":\"SPD-69BFC3DFB0C20-20260322112639\",\"currency\":\"NGN\",\"amount\":10000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 11:26:40', NULL, '2026-03-22 11:27:16');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('adc7a99d-25dd-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFCAAA91C6A-20260322115538', 'SPD-69BFCAAA91C6A-20260322115538', '20000.00', 'NGN', 'success', 'korapay', '{\"reference\":\"SPD-69BFCAAA91C6A-20260322115538\",\"payment_reference\":\"SPD-69BFCAAA91C6A-20260322115538\",\"currency\":\"NGN\",\"amount\":20000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFCAAA91C6A-20260322115538\",\"payment_reference\":\"SPD-69BFCAAA91C6A-20260322115538\",\"currency\":\"NGN\",\"amount\":20000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 11:55:39', NULL, '2026-03-22 11:56:16');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('b3325fea-25db-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'TEST-69BFC758B2999-20260322114128', 'TEST-69BFC758B2999-20260322114128', '500.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 11:41:29', NULL, '2026-03-22 11:41:29');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('b8dfd4ae-25ca-11f1-8dd7-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'TEST-69BFAADCA2DCC-20260322093956', 'TEST-69BFAADCA2DCC-20260322093956', '100.00', 'NGN', 'pending', 'korapay_test', NULL, '0', NULL, '2026-03-22 09:39:57', NULL, '2026-03-22 09:39:57');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('b986b5ee-25db-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'TEST-69BFC7635E9A3-20260322114139', 'TEST-69BFC7635E9A3-20260322114139', '500.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 11:41:39', NULL, '2026-03-22 11:41:39');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('e048f3d7-25f6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFF4F1552DF-20260322145601', 'SPD-69BFF4F1552DF-20260322145601', '3000.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69BFF4F1552DF-20260322145601\",\"payment_reference\":\"SPD-69BFF4F1552DF-20260322145601\",\"currency\":\"NGN\",\"amount\":3000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFF4F1552DF-20260322145601\",\"payment_reference\":\"SPD-69BFF4F1552DF-20260322145601\",\"currency\":\"NGN\",\"amount\":3000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 14:56:01', '2026-03-22 07:26:01', '2026-03-22 14:56:39');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('e4a8b142-3338-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69D63327B11B6-20260408115119', 'SPD-69D63327B11B6-20260408115119', '100.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69D63327B11B6-20260408115119\",\"payment_reference\":\"SPD-69D63327B11B6-20260408115119\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69D63327B11B6-20260408115119\",\"payment_reference\":\"SPD-69D63327B11B6-20260408115119\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-04-08 11:51:19', '2026-04-08 12:21:19', '2026-04-08 11:52:43');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('e5bb1f96-25dc-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFC95AE850A-20260322115002', 'SPD-69BFC95AE850A-20260322115002', '80800.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-03-22 11:50:03', NULL, '2026-03-22 11:50:03');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('ee4e1f20-25f9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69BFFA11580FB-20260322151753', 'SPD-69BFFA11580FB-20260322151753', '100000.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69BFFA11580FB-20260322151753\",\"payment_reference\":\"SPD-69BFFA11580FB-20260322151753\",\"currency\":\"NGN\",\"amount\":100000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69BFFA11580FB-20260322151753\",\"payment_reference\":\"SPD-69BFFA11580FB-20260322151753\",\"currency\":\"NGN\",\"amount\":100000,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 15:17:53', '2026-03-22 07:47:53', '2026-03-22 15:18:36');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('f3f8ea19-3331-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69D627827C6C6-20260408110138', 'SPD-69D627827C6C6-20260408110138', '100.00', 'NGN', 'pending', 'korapay', NULL, '0', NULL, '2026-04-08 11:01:38', '2026-04-08 11:31:38', '2026-04-08 11:01:39');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('f42e6f52-3334-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'SPD-69D62C8BB81D4-20260408112307', 'SPD-69D62C8BB81D4-20260408112307', '100.00', 'NGN', 'success', 'bank_transfer', '{\"reference\":\"SPD-69D62C8BB81D4-20260408112307\",\"payment_reference\":\"SPD-69D62C8BB81D4-20260408112307\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"SPD-69D62C8BB81D4-20260408112307\",\"payment_reference\":\"SPD-69D62C8BB81D4-20260408112307\",\"currency\":\"NGN\",\"amount\":100,\"fee\":1.61,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-04-08 11:23:07', '2026-04-08 11:53:07', '2026-04-08 11:31:21');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('fccba50a-25c9-11f1-8dd7-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'TEST-69BFA9A0BB210-20260322093440', 'TEST-69BFA9A0BB210-20260322093440', '500.00', 'NGN', 'pending', 'korapay_test', NULL, '0', NULL, '2026-03-22 09:34:41', NULL, '2026-03-22 09:34:41');
INSERT INTO `payment_gateway_transactions` (`id`, `user_id`, `transaction_reference`, `gateway_reference`, `amount`, `currency`, `status`, `payment_method`, `gateway_response`, `webhook_received`, `webhook_data`, `created_at`, `expires_at`, `updated_at`) VALUES ('ffda4346-25cd-11f1-8dd7-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'TEST-69BFB05C4C9D5-20260322100324', 'TEST-69BFB05C4C9D5-20260322100324', '100.00', 'NGN', 'success', 'korapay_test', '{\"reference\":\"TEST-69BFB05C4C9D5-20260322100324\",\"payment_reference\":\"TEST-69BFB05C4C9D5-20260322100324\",\"currency\":\"NGN\",\"amount\":153.75,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '1', '{\"reference\":\"TEST-69BFB05C4C9D5-20260322100324\",\"payment_reference\":\"TEST-69BFB05C4C9D5-20260322100324\",\"currency\":\"NGN\",\"amount\":153.75,\"fee\":53.75,\"payment_method\":\"bank_transfer\",\"status\":\"success\"}', '2026-03-22 10:03:24', NULL, '2026-03-22 10:04:07');

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `method_type` varchar(50) NOT NULL,
  `provider` varchar(50) DEFAULT NULL,
  `account_last4` varchar(4) DEFAULT NULL,
  `card_expiry` date DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `payment_sessions`;
CREATE TABLE `payment_sessions` (
  `id` char(36) NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `session_id` varchar(64) NOT NULL,
  `user_id` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `idx_transaction_reference` (`transaction_reference`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('040ceb15-25f5-11f1-8dd7-5820b173055a', 'SPD-69BFF1D259E50-20260322144242', '7062d96ab74d6add420c94f0c9b7d8c3', '9a84c531-dffe-203a-6251-31764611114e', '2026-03-22 14:42:42', '2026-03-22 07:12:42');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('257918b0-25e2-11f1-8dd7-5820b173055a', 'SPD-69BFD22A028BB-20260322122738', 'e8b8a75374997e545830d1384d47161a', '9a84c531-dffe-203a-6251-31764611114e', '2026-03-22 12:27:38', '2026-03-22 04:57:38');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('9840b32e-3338-11f1-9ca4-5820b173055a', 'SPD-69D632A78195D-20260408114911', 'ce650103cc8877b0894d0facf74eb5d6', '9a84c531-dffe-203a-6251-31764611114e', '2026-04-08 11:49:11', '2026-04-08 12:19:11');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('e049e370-25f6-11f1-8dd7-5820b173055a', 'SPD-69BFF4F1552DF-20260322145601', '7930fcf3e17ef2e6a94e709557efdce4', '9a84c531-dffe-203a-6251-31764611114e', '2026-03-22 14:56:01', '2026-03-22 07:26:01');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('e72bfde2-3338-11f1-9ca4-5820b173055a', 'SPD-69D63327B11B6-20260408115119', 'ac1ed50428052062aea0246183b09a11', '9a84c531-dffe-203a-6251-31764611114e', '2026-04-08 11:51:23', '2026-04-08 12:21:23');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('ee4f298c-25f9-11f1-8dd7-5820b173055a', 'SPD-69BFFA11580FB-20260322151753', 'e5b71285e6bd132a3ab4faa8326e8f95', '9a84c531-dffe-203a-6251-31764611114e', '2026-03-22 15:17:53', '2026-03-22 07:47:53');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('f3fa4b74-3331-11f1-9ca4-5820b173055a', 'SPD-69D627827C6C6-20260408110138', '78e021e274e4826b19d6a224b6bde6fa', '9a84c531-dffe-203a-6251-31764611114e', '2026-04-08 11:01:38', '2026-04-08 11:31:38');
INSERT INTO `payment_sessions` (`id`, `transaction_reference`, `session_id`, `user_id`, `created_at`, `expires_at`) VALUES ('f42fde94-3334-11f1-9ca4-5820b173055a', 'SPD-69D62C8BB81D4-20260408112307', '2e4ad1d76bebab31458adf7329a0aafb', '9a84c531-dffe-203a-6251-31764611114e', '2026-04-08 11:23:07', '2026-04-08 11:53:07');

DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` char(36) NOT NULL,
  `transaction_reference` varchar(100) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `commission` decimal(10,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'NGN',
  `payment_method` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `gateway_response` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `personal_access_tokens`;
CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `promo_codes`;
CREATE TABLE `promo_codes` (
  `id` char(36) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text,
  `discount_type` varchar(20) DEFAULT NULL,
  `discount_value` decimal(10,2) NOT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `min_ride_value` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT '0',
  `valid_from` timestamp NULL DEFAULT NULL,
  `valid_until` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `promo_usage`;
CREATE TABLE `promo_usage` (
  `id` char(36) NOT NULL,
  `promo_id` char(36) DEFAULT NULL,
  `user_id` char(36) DEFAULT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT NULL,
  `used_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `push_tokens`;
CREATE TABLE `push_tokens` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `device_type` varchar(20) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_used` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `remember_tokens`;
CREATE TABLE `remember_tokens` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('36e09bee-1b4c-11f1-aa1d-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'd716f4c63a82b28e2a43f194285ef8369f2178a88be76e3a7266a1779e6f7bf0', '2026-04-08 09:09:11', '2026-03-09 01:09:11');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('4a706812-1b40-11f1-aa1d-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', '9d77d2fcf4178fac4009d465256a508ef2fd11a06f54425f57d0558438866462', '2026-04-08 07:43:49', '2026-03-08 23:43:49');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('56b0ed40-1b48-11f1-aa1d-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'd575bbddced529118e2f418846f1a45d9b3c250f8d0f75926d0eff96482327a0', '2026-04-08 08:41:26', '2026-03-09 00:41:26');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('5ae69a26-1596-11f1-8d1b-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'a86008d29a0e405c7bb114738b92e1a39481f05ca989d065777b63f20e5d972b', '2026-04-01 02:44:53', '2026-03-01 18:44:53');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('6d54fe0e-1b45-11f1-aa1d-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'bf808fc851b7acdda62483e50ecfef64f14f8097b90bf61dbaa0294ba38cb3ee', '2026-04-08 08:20:36', '2026-03-09 00:20:36');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('af02bdf1-1ccb-11f1-9868-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', '2115f8cb445f5270d03b5a0a2fe9d64e9bfe2d9bf902f4262365df831bb55a6f', '2026-04-10 06:54:16', '2026-03-10 22:54:16');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('d4b70fbb-1370-11f1-8601-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'c27c0e9c8bca99b8f4c8106ae8d23834d632a53ad530bd0c12d5fefde68a8aec', '2026-03-29 09:11:03', '2026-02-27 01:11:03');
INSERT INTO `remember_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES ('ee10074c-166d-11f1-acc8-5820b173055a', 'c1d76081-1370-11f1-8601-5820b173055a', 'f592f8dd2d6e7a3948bdaa751019263e389d735c298140e94bd4a9293d113736', '2026-04-02 04:28:02', '2026-03-02 20:28:02');

DROP TABLE IF EXISTS `rides`;
CREATE TABLE `rides` (
  `id` char(36) NOT NULL,
  `ride_number` varchar(20) NOT NULL,
  `client_id` char(36) DEFAULT NULL,
  `driver_id` char(36) DEFAULT NULL,
  `pickup_address` text NOT NULL,
  `pickup_latitude` decimal(10,8) NOT NULL,
  `pickup_longitude` decimal(11,8) NOT NULL,
  `destination_address` text NOT NULL,
  `destination_latitude` decimal(10,8) NOT NULL,
  `destination_longitude` decimal(11,8) NOT NULL,
  `ride_type` enum('economy','comfort') NOT NULL DEFAULT 'economy',
  `distance_km` decimal(6,2) DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `base_fare` decimal(10,2) DEFAULT NULL,
  `distance_fare` decimal(10,2) DEFAULT NULL,
  `time_fare` decimal(10,2) DEFAULT NULL,
  `surge_multiplier` decimal(3,2) DEFAULT '1.00',
  `service_fee` decimal(10,2) DEFAULT NULL,
  `tax` decimal(10,2) DEFAULT NULL,
  `total_fare` decimal(10,2) NOT NULL,
  `platform_commission` decimal(10,2) DEFAULT NULL,
  `driver_payout` decimal(10,2) DEFAULT NULL,
  `status` enum('pending','accepted','driver_assigned','driver_arrived','ongoing','completed','cancelled_by_client','cancelled_by_driver','cancelled_by_admin') DEFAULT 'pending',
  `payment_status` varchar(50) DEFAULT 'pending',
  `actual_pickup_time` timestamp NULL DEFAULT NULL,
  `actual_dropoff_time` timestamp NULL DEFAULT NULL,
  `scheduled_time` timestamp NULL DEFAULT NULL,
  `client_rating` int(11) DEFAULT NULL,
  `driver_rating` int(11) DEFAULT NULL,
  `client_review` text,
  `driver_review` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('189f185b15d83fc10982d181a7e80df5', 'SPD15E6CA260311', 'd953476f-137e-11f1-8601-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'Lagos Area (6.5401, 3.3443)', '6.54012585', '3.34430695', 'Mainland Area, Lagos (6.5350, 3.3514)', '6.53502372', '3.35140992', '', '1.00', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '1500.00', '300.00', '1200.00', 'cancelled_by_client', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-11 02:28:01', '2026-03-14 23:52:46', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('5a03cb473f711c796b6d51dda1ff9a71', 'SPD835E26260309', 'd953476f-137e-11f1-8601-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'Lagos Area (6.5469, 3.3623)', '6.54694758', '3.36233139', 'Lagos Area (6.5487, 3.3662)', '6.54866721', '3.36617280', '', '1.00', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '1500.00', '300.00', '1200.00', 'completed', 'paid', NULL, NULL, NULL, '5', '5', 'Test review fromjjj debug page', 'Was so lovely', '2026-03-09 01:58:32', '2026-03-11 01:38:54', '2026-03-11 00:30:54');
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('6a1eeaa67dff8b10e936621cc911d0ce', 'SPD9BF6D0260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', NULL, 'Lagos Area (6.5401, 3.3443)', '6.54012585', '3.34430695', 'Mainland Area, Lagos (6.5159, 3.3898)', '6.51590798', '3.38979721', '', '5.70', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '6201.52', '1240.30', '4961.21', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 19:38:33', '2026-03-10 22:35:41', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('70d504066f0e36630857d2bd8c01aa8d', 'SPD35256B260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', NULL, '6.517784, 3.353577', '6.51778406', '3.35357666', '6.548994, 3.392887', '6.54899408', '3.39288712', '', '5.56', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '6059.05', '1211.81', '4847.24', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 14:26:43', '2026-03-10 22:35:41', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('894e55a1206702fe80aa87a7565bf02f', 'SPD5BFAE7260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', '7663e186-1344-11f1-8601-5820b173055a', 'Mainland Area, Lagos (6.5178, 3.3536)', '6.51778406', '3.35357666', 'Lagos Area (6.5038, 3.3071)', '6.50379861', '3.30705643', '', '5.37', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '5869.58', '1173.92', '4695.66', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 23:04:05', '2026-03-08 23:04:05', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('9761de144b00c8d811bf43d2c1c7c63e', 'SPDC539A9260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', '76641eb5-1344-11f1-8601-5820b173055a', 'Mainland Area, Lagos (6.5359, 3.3920)', '6.53586223', '3.39202881', 'Mainland Area, Lagos (6.5390, 3.3859)', '6.53898416', '3.38591386', '', '1.00', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '1500.00', '300.00', '1200.00', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 23:01:32', '2026-03-08 23:01:32', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('9a27a8f4dbf79e2d63bb24d28a79b5ed', 'SPD8EA78E260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', NULL, 'Lagos Area (6.5340, 3.3497)', '6.53396490', '3.34969331', 'Mainland Area, Lagos (6.5321, 3.3620)', '6.53211021', '3.36198807', '', '1.37', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '1873.81', '374.76', '1499.04', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 22:24:24', '2026-03-09 19:08:59', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('a0adeddd791fd3472cb5d78c32509810', 'SPDC035C1260315', 'd953476f-137e-11f1-8601-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'Mainland Area, Lagos (6.5359, 3.3920)', '6.53586223', '3.39202881', 'Lagos Area (6.5469, 3.3623)', '6.54694758', '3.36233139', '', '3.50', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '4004.63', '800.93', '3203.70', 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-15 19:29:16', '2026-03-15 19:37:37', '2026-03-15 19:37:37');
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('ba6724f5693b6bdf553cac6365618023', 'SPD99C2CF260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', '02fb92ba-1373-11f1-8601-5820b173055a', 'Lagos Area (6.5469, 3.3623)', '6.54694758', '3.36233139', 'Lagos Area (6.5538, 3.3567)', '6.55376921', '3.35666656', '', '1.00', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '1500.00', '300.00', '1200.00', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 22:32:09', '2026-03-08 22:32:09', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('f1c1f21b9c17b00d50d2f44b11b30189', 'SPD4654CB260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', '76641ce3-1344-11f1-8601-5820b173055a', 'Lagos Area (6.4995, 3.3418)', '6.49951335', '3.34179688', 'Mainland Area, Lagos (6.5357, 3.3736)', '6.53567036', '3.37355424', '', '5.34', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '5836.04', '1167.21', '4668.83', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 22:21:56', '2026-03-08 22:21:56', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('f57e01ab5475de827b6100478d676284', 'SPD851065260308', 'cdfbefa8-1ae5-11f1-aa1d-5820b173055a', NULL, 'Location (6.5178, 3.3536)', '6.51778406', '3.35357666', 'Location (6.4891, 3.3783)', '6.48913053', '3.37829590', '', '4.20', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '4696.38', '939.28', '3757.10', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-03-08 13:28:24', '2026-03-09 19:08:59', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('7e97529af0d6746c48be9adffe19a3d1', 'SPDD727C8260413', 'd953476f-137e-11f1-8601-5820b173055a', NULL, 'Lagos Mainland', '6.51778406', '3.35357666', 'Lagos Mainland', '6.51590798', '3.38979721', 'economy', '4.01', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '4506.95', '901.39', '3605.56', 'pending', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-13 22:43:57', '2026-04-13 22:43:57', NULL);
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('02d777066d0d76c7659d856a098dbad6', 'SPD621163260413', 'd953476f-137e-11f1-8601-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'Lagos Mainland', '6.51778406', '3.35357666', 'Lagos Mainland', '6.51590798', '3.38979721', 'economy', '4.01', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '4506.95', '901.39', '3605.56', 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-13 22:46:14', '2026-04-13 22:53:05', '2026-04-13 22:53:05');
INSERT INTO `rides` (`id`, `ride_number`, `client_id`, `driver_id`, `pickup_address`, `pickup_latitude`, `pickup_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `ride_type`, `distance_km`, `duration_minutes`, `base_fare`, `distance_fare`, `time_fare`, `surge_multiplier`, `service_fee`, `tax`, `total_fare`, `platform_commission`, `driver_payout`, `status`, `payment_status`, `actual_pickup_time`, `actual_dropoff_time`, `scheduled_time`, `client_rating`, `driver_rating`, `client_review`, `driver_review`, `created_at`, `updated_at`, `completed_at`) VALUES ('50ac936717511d03f4ae4d0dec314687', 'SPD482B83260419', 'd953476f-137e-11f1-8601-5820b173055a', 'b7d8127cac762a5399a5aa0d6af2de62', 'Lagos, Nigeria', '6.51501968', '3.40620850', 'Lagos Mainland', '6.49714686', '3.36490631', 'economy', '4.98', NULL, NULL, NULL, NULL, '1.00', NULL, NULL, '5477.02', '1095.40', '4381.62', 'completed', 'paid', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-19 19:49:40', '2026-04-19 20:24:14', '2026-04-19 20:24:14');

DROP TABLE IF EXISTS `ride_cancellations`;
CREATE TABLE `ride_cancellations` (
  `id` char(36) NOT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `cancelled_by` char(36) DEFAULT NULL,
  `reason` varchar(255) NOT NULL,
  `detailed_reason` text,
  `cancelled_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ride_cancellations` (`id`, `ride_id`, `cancelled_by`, `reason`, `detailed_reason`, `cancelled_at`) VALUES ('a045bc6ce0af35d0540d0c528fab8b7c', '189f185b15d83fc10982d181a7e80df5', '9a84c531-dffe-203a-6251-31764611114e', 'Cancelled by client', NULL, '2026-03-14 23:52:46');

DROP TABLE IF EXISTS `ride_declines`;
CREATE TABLE `ride_declines` (
  `id` char(36) NOT NULL,
  `ride_id` char(36) NOT NULL,
  `driver_id` char(36) NOT NULL,
  `auto_decline` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('15a7463d-1ce5-11f1-9868-5820b173055a', '9a27a8f4dbf79e2d63bb24d28a79b5ed', 'b7d8127cac762a5399a5aa0d6af2de62', '1', '2026-03-11 01:56:06');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('32de034e-1ce5-11f1-9868-5820b173055a', '9a27a8f4dbf79e2d63bb24d28a79b5ed', 'b7d8127cac762a5399a5aa0d6af2de62', '1', '2026-03-11 01:56:55');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('46193001-1cd9-11f1-9868-5820b173055a', '9a27a8f4dbf79e2d63bb24d28a79b5ed', 'b7d8127cac762a5399a5aa0d6af2de62', '1', '2026-03-11 00:31:33');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('77fe7ca3-1cdb-11f1-9868-5820b173055a', '9a27a8f4dbf79e2d63bb24d28a79b5ed', 'b7d8127cac762a5399a5aa0d6af2de62', '1', '2026-03-11 00:47:16');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('d00f94b6-209b-11f1-96a8-5820b173055a', '6a1eeaa67dff8b10e936621cc911d0ce', 'b7d8127cac762a5399a5aa0d6af2de62', '0', '2026-03-15 19:21:40');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('d256336f-209b-11f1-96a8-5820b173055a', '70d504066f0e36630857d2bd8c01aa8d', 'b7d8127cac762a5399a5aa0d6af2de62', '0', '2026-03-15 19:21:44');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('d4ce87c5-209b-11f1-96a8-5820b173055a', 'f57e01ab5475de827b6100478d676284', 'b7d8127cac762a5399a5aa0d6af2de62', '0', '2026-03-15 19:21:48');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('f0aca12d-1cdc-11f1-9868-5820b173055a', '9a27a8f4dbf79e2d63bb24d28a79b5ed', 'b7d8127cac762a5399a5aa0d6af2de62', '1', '2026-03-11 00:57:48');
INSERT INTO `ride_declines` (`id`, `ride_id`, `driver_id`, `auto_decline`, `created_at`) VALUES ('9bbe36e8-3783-11f1-9ca4-5820b173055a', '7e97529af0d6746c48be9adffe19a3d1', 'b7d8127cac762a5399a5aa0d6af2de62', '0', '2026-04-13 22:54:55');

DROP TABLE IF EXISTS `ride_tracking`;
CREATE TABLE `ride_tracking` (
  `id` char(36) NOT NULL,
  `ride_id` char(36) DEFAULT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `speed_kmh` decimal(5,2) DEFAULT NULL,
  `heading` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `saved_locations`;
CREATE TABLE `saved_locations` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `location_name` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `location_type` varchar(50) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE `sessions` (
  `id` varchar(191) NOT NULL,
  `user_id` bigint(20) unsigned DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES ('mzxSOsPMlG3XYRt5j8dvmFlmwa2my2cVqDFnio0P', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJRNWowM2JBSnYxcWxjcmlpWkw4MDhrelkxbDlhMnNEMVN5bTZCVFdkIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC92ZXJpZnktb3RwP2VtYWlsPWNpcmNsZW9mZGV2ZWxvcGVyczElNDBnbWFpbC5jb20iLCJyb3V0ZSI6InZlcmlmeS5vdHAifSwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', '1778189648');

DROP TABLE IF EXISTS `support_tickets`;
CREATE TABLE `support_tickets` (
  `id` char(36) NOT NULL,
  `ticket_number` varchar(20) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `priority` varchar(20) DEFAULT 'normal',
  `status` varchar(50) DEFAULT 'open',
  `assigned_to` char(36) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `system_settings`;
CREATE TABLE `system_settings` (
  `id` char(36) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  `setting_type` varchar(50) DEFAULT 'string',
  `description` text,
  `updated_by` char(36) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a549154-1293-11f1-8601-5820b173055a', 'base_fare', '500', 'integer', 'Base fare in Naira', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54b3b9-1293-11f1-8601-5820b173055a', 'rate_per_km', '150', 'integer', 'Rate per kilometer in Naira', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54b64a-1293-11f1-8601-5820b173055a', 'surge_multiplier', '1.5', 'decimal', 'Surge pricing multiplier', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54b797-1293-11f1-8601-5820b173055a', 'platform_commission', '20', 'integer', 'Platform commission percentage', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54b8b4-1293-11f1-8601-5820b173055a', 'currency_symbol', '?', 'string', 'Currency symbol', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54b9ca-1293-11f1-8601-5820b173055a', 'currency_code', 'NGN', 'string', 'Currency code', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54bb2b-1293-11f1-8601-5820b173055a', 'enable_surge_pricing', 'true', 'boolean', 'Enable surge pricing', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a54bc7b-1293-11f1-8601-5820b173055a', 'require_driver_approval', 'true', 'boolean', 'Require admin approval for drivers', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a5715b3-1293-11f1-8601-5820b173055a', 'maintenance_mode', 'false', 'boolean', 'Maintenance mode status', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('5a57191d-1293-11f1-8601-5820b173055a', 'session_timeout', '30', 'integer', 'Session timeout in minutes', NULL, '2026-02-25 22:45:51');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('76b82ec3-24a6-11f1-8206-5820b173055a', 'korapay_secret_key', 'sk_live_iNy8ZzXw5hVVEXVsuYPKePFtftVTi45gy5hvQNQ8', 'string', 'KoraPay Secret Key', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('76b83242-24a6-11f1-8206-5820b173055a', 'korapay_public_key', 'pk_live_WCw3DA9YYywyQbV7dj1kYB1kQJpw4h7aXRZXP1mS', 'string', 'KoraPay Public Key', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('76b8338f-24a6-11f1-8206-5820b173055a', 'korapay_environment', 'live', 'string', 'KoraPay Environment (sandbox/live)', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('76b8349b-24a6-11f1-8206-5820b173055a', 'korapay_webhook_secret', '', 'string', 'KoraPay Webhook Secret for signature verification', NULL, '2026-03-20 22:47:59');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('7b77ff20-251f-11f1-8dd7-5820b173055a', 'korapay_secret_key', 'sk_live_iNy8ZzXw5hVVEXVsuYPKePFtftVTi45gy5hvQNQ8', 'string', 'KoraPay Secret Key', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('7b7c8a7c-251f-11f1-8dd7-5820b173055a', 'korapay_public_key', 'pk_live_WCw3DA9YYywyQbV7dj1kYB1kQJpw4h7aXRZXP1mS', 'string', 'KoraPay Public Key', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('7b80c18b-251f-11f1-8dd7-5820b173055a', 'korapay_environment', 'live', 'string', 'KoraPay Environment (sandbox/live)', NULL, '2026-04-08 10:33:43');
INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `updated_by`, `updated_at`) VALUES ('7b88e31a-251f-11f1-8dd7-5820b173055a', 'korapay_webhook_secret', '', 'string', 'KoraPay Webhook Secret', NULL, '2026-03-21 13:14:17');

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'client',
  `profile_picture_url` text,
  `date_of_birth` date DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `is_verified` tinyint(1) DEFAULT '0',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e38ec2-1373-11f1-8601-5820b173055a', 'john_doe', 'john.doe@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347012345678', 'John Doe', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-08-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3a9c8-1373-11f1-8601-5820b173055a', 'jane_smith', 'jane.smith@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347023456789', 'Jane Smith', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-09-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3ac16-1373-11f1-8601-5820b173055a', 'mike_wilson', 'mike.wilson@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347034567890', 'Mike Wilson', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-10-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3ad5d-1373-11f1-8601-5820b173055a', 'sarah_brown', 'sarah.brown@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347045678901', 'Sarah Brown', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-11-27 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3aea7-1373-11f1-8601-5820b173055a', 'david_lee', 'david.lee@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347056789012', 'David Lee', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-12-27 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3b001-1373-11f1-8601-5820b173055a', 'emma_davis', 'emma.davis@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347067890123', 'Emma Davis', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-01-27 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3b115-1373-11f1-8601-5820b173055a', 'chris_taylor', 'chris.taylor@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347078901234', 'Chris Taylor', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-06 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3b21e-1373-11f1-8601-5820b173055a', 'lisa_anderson', 'lisa.anderson@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347089012345', 'Lisa Anderson', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-13 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3b314-1373-11f1-8601-5820b173055a', 'kevin_white', 'kevin.white@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347090123456', 'Kevin White', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-20 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02e3b419-1373-11f1-8601-5820b173055a', 'amy_martin', 'amy.martin@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347101234567', 'Amy Martin', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-27 01:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02ea577a-1373-11f1-8601-5820b173055a', 'driver_robert', 'robert.driver@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347112345678', 'Robert Johnson', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-06-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02ec1f57-1373-11f1-8601-5820b173055a', 'driver_maria', 'maria.driver@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347123456789', 'Maria Garcia', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-07-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02ec22d9-1373-11f1-8601-5820b173055a', 'driver_james', 'james.driver@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347134567890', 'James Brown', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-08-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02ec251d-1373-11f1-8601-5820b173055a', 'driver_patricia', 'patricia.driver@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347145678901', 'Patricia Miller', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-09-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('02ec26ac-1373-11f1-8601-5820b173055a', 'driver_michael', 'michael.driver@example.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2347156789012', 'Michael Davis', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2025-10-27 00:26:39', '2026-02-27 01:26:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('13059205-7029-a23e-bd04-290e3f5acfe0', 'edgematr', 'edgematrix@gmail.com', '$2y$10$yhv9Gn9udB0uSh6LWlKG1.VRTi4mVoAqjA/hXVqVJQZb9QedPb5fW', NULL, NULL, '+2341641937473', 'ytyrwr', 'driver', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-03-01 19:41:51', '2026-03-01 19:41:51', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('3225ab34-4925-dd5c-8dd8-15c24cceee55', 'edgem', 'edgematrixdriver@gmail.com', '$2y$10$5bvE1xp8Y.6gl6/QloFs5.x6xc6uPD5aj/3a3gQjcDABSNCwh1fbi', NULL, NULL, '+2340367558450', 'ytyrwr', 'driver', NULL, NULL, NULL, '1', '0', NULL, '2026-03-08 23:21:10', '2026-03-01 19:43:48', '2026-03-08 23:21:10', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('4fb5e6d0-713d-cbce-caa5-3bf1025c809b', 'expert', 'edgematrixdriver2026@gmail.com', '$2y$10$QtyzM.yMqhf.qA3GeiLrSu6MUnYq8TZIM2aPmR4viGxhdSTa/9q0.', NULL, NULL, '+2341777667425', 'Driver1', 'driver', NULL, NULL, NULL, '1', '0', NULL, '2026-04-19 20:23:28', '2026-03-08 23:39:09', '2026-04-19 20:23:28', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('6cf19188-bc03-6b31-3f53-a46d13570931', 'Client', 'edgematrix2021@gmail.com', '$2y$10$sV.sH.nbvmvJomHGF/jr../FQNFpJjFwfXjhcNJS8e60pQb0OS1uO', NULL, NULL, '+2340066286319', 'Speedly', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-03-08 23:02:42', '2026-03-08 12:05:19', '2026-03-08 23:02:42', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('765c52e0-1344-11f1-8601-5820b173055a', 'michael_chen', 'michael@example.com', '$2y$10$YourHashedPasswordHere', NULL, NULL, '+2348012345678', 'Michael Chen', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-26 19:53:27', '2026-02-26 19:53:27', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('765c8d68-1344-11f1-8601-5820b173055a', 'sarah_johnson', 'sarah@example.com', '$2y$10$YourHashedPasswordHere', NULL, NULL, '+2348023456789', 'Sarah Johnson', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-26 19:53:27', '2026-02-26 19:53:27', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('765c8edf-1344-11f1-8601-5820b173055a', 'james_wilson', 'james@example.com', '$2y$10$YourHashedPasswordHere', NULL, NULL, '+2348034567890', 'James Wilson', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-02-26 19:53:27', '2026-02-26 19:53:27', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('9a84c531-dffe-203a-6251-31764611114e', 'bitopla', 'bybit2478@gmail.com', '$2y$10$S2cmQ0n/EI5HvpEuc5IuIughCrJzJSzLZv/muLQI7/XrYo31WcPSq', NULL, NULL, '+2342203280519', 'bamisit', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-04-29 22:53:14', '2026-02-27 02:49:15', '2026-04-29 22:53:14', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('c1d76081-1370-11f1-8601-5820b173055a', 'edgematrix', 'edgematrix2026@gmail.com', '$2y$10$scIaKbk.CrOy/3EgmiVbQO/.h5mCSgtOpJGTKdGt8BiRWdXdc.ZCq', NULL, NULL, '+2348000000000', 'Edge Matrix Admin', 'admin', NULL, NULL, NULL, '1', '1', NULL, '2026-04-20 18:47:43', '2026-02-27 01:10:31', '2026-04-20 18:47:43', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('eba9db74-25d0-11f1-8dd7-5820b173055a', 'test_korapay', 'test_korapay@example.com', 'test_hash', NULL, NULL, '08012345678', 'Test KoraPay User', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-03-22 10:24:19', '2026-03-22 10:24:19', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('32675e140c8948aa1863a18c4ac935bc', 'client001', 'ojimabojames@gmail.com', '$2y$12$1ATd3tavofmU/nWMgai/Ie9itVqLPVJu9fSAyhvnjylqRd7z/kfdy', NULL, NULL, '+2348100466960', 'James', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-04-26 00:11:39', '2026-04-25 23:16:57', '2026-04-26 00:11:39', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('67036d54974cb0f61a5b8d71681e2f85', 'client002', 'ojimabojames1@gmail.com', '$2y$12$fzymNJqUe7FY4fn.nVZEmOPszCuF41ad4djosHANODDJg6lCdJMw2', NULL, NULL, '+2349100892923', 'James', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-04-25 23:19:28', '2026-04-25 23:19:28', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('d406d9fc406d183185e8f417aa011bd1', 'matrix', 'edgematrix2028@gmail.com', '$2y$12$zUjFWrTvioKS/bTNWRALCeyqw.XE3VMa9CUJ6lEDfveRcQtBmipaa', NULL, NULL, '+2349029382938', 'edge', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-04-25 23:25:12', '2026-04-25 23:25:12', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('0dd0b90fedfc4f9c823f723203d24a2b', 'bamisi', 'edgematrix2023@gmail.com', '$2y$12$U1/847RZ4w5zsDRJb.lW7eG2.REl3B5aGF810OgnRqvW8hv/ASho6', NULL, NULL, '+2349078926783', 'bamisi oduma', 'client', NULL, NULL, NULL, '1', '1', '2026-04-25 23:37:56', NULL, '2026-04-25 23:33:24', '2026-04-25 23:37:56', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('c0bc1e3d48cb38cfa6e5ca6d22453cd6', 'desmond', 'edgematrix2025@gmail.com', '$2y$12$yR8OiRGuWH.nR5k82OVdieOBwDIEKyt3D8qQbIAWIG1yLg.OOSYIS', NULL, NULL, '+2349076543234', 'desmond', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-04-29 10:29:37', '2026-04-25 23:57:37', '2026-04-29 10:29:37', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('4a8f417e8b667bfc4b749a1f7aff95a1', 'testuser2', 'test2@example.com', '$2y$12$3sAp1pXrK6tdB7QQLPPjv.HxmxnqPgsOxlzWMGCCfFDJl3yOCTqkW', NULL, NULL, '+2348012345679', 'Test User', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-04-28 19:02:29', '2026-04-28 18:54:50', '2026-04-28 19:02:29', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('f96966af06624a6bffe9d8070361bcc7', 'testuser3', 'test3@example.com', '$2y$12$ObWrXPJYRStj7C9ZmMQkwOuWE6DA/D8tnk70diJMwy3cRoLj3laYO', NULL, NULL, '+2348012345680', 'Test User3', 'client', NULL, NULL, NULL, '1', '1', NULL, '2026-04-28 19:18:37', '2026-04-28 19:08:37', '2026-04-28 19:18:37', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('f89d3d7a768a59249b23553422736c0c', 'driver1', 'bybit248@gmail.com', '$2y$12$X4zeGZfO9P8zzg/GarCmnu4tkDmaQU41IAowd7g7.ryOBW5iZF31e', NULL, NULL, '+2349038374738', ' Jobitech Driver', 'driver', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-04-29 13:43:12', '2026-04-29 13:43:12', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('8ac01902-81d9-4c91-b17c-ad7c34b47c68', 'james10', 'ojimab89ojames@gmail.com', '$2y$12$RGRrUE38wGJ.w03GyKv6yuuJg6djiDxwTBjrDjdNdp/3f7apjxDtu', NULL, NULL, '+2348100466960', 'James Ojimabo', 'client', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-05-07 19:44:05', '2026-05-07 19:44:05', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('73e30d79-8853-41d3-9785-803b6447a038', 'james12', 'ojim78abojames@gmail.com', '$2y$12$2QI371IkkwbtPtrvmlAx3eXl6O.5msmC2ILcTyiV6aXjfBXzZHEdC', NULL, NULL, '+2348100466960', 'James Ojimabo', 'client', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-05-07 19:45:52', '2026-05-07 19:45:52', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('eadfa069-5221-431a-8d16-c19d85b6aa12', 'James15', 'ojimab242ojames@gmail.com', '$2y$12$XB.Ltz4iXfNAMEIvbWO7euUHuUzkAlGwNJqCGvj0c9O0f/uRhcyTK', NULL, NULL, '+2348100466960', 'James Ojimabo', 'client', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-05-07 19:47:18', '2026-05-07 19:47:18', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('b2e4d1cf-0853-4bc6-b7e3-94aa19c09794', 'James18', 'ojima8b242ojames@gmail.com', '$2y$12$PuZ4yPgWqsiyVE4Ny34CrO18XiOopWUUc4TzvjIdJ4GW.6HPUpqkG', NULL, NULL, '+2348100466960', 'James Ojimabo', 'client', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-05-07 19:47:41', '2026-05-07 19:47:41', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('d5de9b31-c55b-4280-9da2-4a95130f7f5d', 'james234', 'ojim678abojames@gmail.com', '$2y$12$HhKdK438d5zmFen72Y8X3.MudpRybPwDWMPY4EiYdZbcQBeSqaOIa', NULL, NULL, '+2348100466960', 'James Ojimabo', 'client', NULL, NULL, NULL, '1', '0', NULL, NULL, '2026-05-07 19:50:07', '2026-05-07 19:50:07', NULL);
INSERT INTO `users` (`id`, `username`, `email`, `password`, `reset_token`, `reset_expires`, `phone_number`, `full_name`, `role`, `profile_picture_url`, `date_of_birth`, `gender`, `is_active`, `is_verified`, `email_verified_at`, `last_login`, `created_at`, `updated_at`, `deleted_at`) VALUES ('39076126-b04d-4d85-af88-5bd8720776d4', 'Client003', 'circleofdevelopers1@gmail.com', '$2y$12$jKrSEPcqBkj7pFr0/zKsVeFv.1VwbiDFaUUZez9A2X4HEkY8Surmq', NULL, NULL, '+2348100466960', 'Client Testing', 'client', NULL, NULL, NULL, '1', '1', NULL, NULL, '2026-05-07 19:52:35', '2026-05-07 19:53:24', NULL);

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `role` varchar(50) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE `user_settings` (
  `id` char(36) NOT NULL,
  `user_id` char(36) NOT NULL,
  `dark_mode` tinyint(1) DEFAULT '0',
  `notifications_enabled` tinyint(1) DEFAULT '1',
  `email_notifications` tinyint(1) DEFAULT '1',
  `sms_notifications` tinyint(1) DEFAULT '0',
  `language` varchar(10) DEFAULT 'en',
  `currency` varchar(10) DEFAULT 'NGN',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `user_settings` (`id`, `user_id`, `dark_mode`, `notifications_enabled`, `email_notifications`, `sms_notifications`, `language`, `currency`, `created_at`, `updated_at`) VALUES ('7113313e9282b08b1f1f7238ff900cfe', 'c0bc1e3d48cb38cfa6e5ca6d22453cd6', '0', '1', '1', '0', 'en', 'NGN', '2026-04-26 10:41:55', '2026-04-26 10:41:55');

DROP TABLE IF EXISTS `wallet_transactions`;
CREATE TABLE `wallet_transactions` (
  `id` char(36) NOT NULL,
  `user_id` char(36) DEFAULT NULL,
  `transaction_type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `balance_before` decimal(10,2) NOT NULL,
  `balance_after` decimal(10,2) NOT NULL,
  `reference` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'pending',
  `description` text,
  `ride_id` char(36) DEFAULT NULL,
  `payment_method_id` char(36) DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reference` (`reference`),
  KEY `ride_id` (`ride_id`),
  KEY `payment_method_id` (`payment_method_id`),
  KEY `idx_wallet_transactions_user_id` (`user_id`),
  KEY `idx_wallet_transactions_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('082109d3-25fa-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '100000.00', '45100.00', '145100.00', 'SPD-69BFFA11580FB-20260322151753', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFFA11580FB-20260322151753 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 15:18:36');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('166bad71-3339-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '100.00', '145300.00', '145400.00', 'SPD-69D63327B11B6-20260408115119', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69D63327B11B6-20260408115119 (Fee: ?1.61)', NULL, NULL, NULL, '2026-04-08 11:52:43');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('17851254a070ff170a7889dc9a129a15', '9a84c531-dffe-203a-6251-31764611114e', 'ride_payment', '5477.02', '136386.10', '130909.08', 'RIDE_69e523c496a5d_20260419194940', 'completed', 'Payment for ride #SPD482B83260419', '50ac936717511d03f4ae4d0dec314687', NULL, NULL, '2026-04-19 19:49:40');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('19601046-25ce-11f1-8dd7-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'deposit', '153.75', '0.00', '153.75', 'TEST-69BFB05C4C9D5-20260322100324', 'completed', 'Wallet deposit via KoraPay - Reference: TEST-69BFB05C4C9D5-20260322100324', NULL, NULL, NULL, '2026-03-22 10:04:07');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('1a4ae46c-3336-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '100.00', '145100.00', '145200.00', 'SPD-69D62C8BB81D4-20260408112307', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69D62C8BB81D4-20260408112307 (Fee: ?1.61)', NULL, NULL, NULL, '2026-04-08 11:31:21');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('1ac30796-25f5-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '2000.00', '40100.00', '42100.00', 'SPD-69BFF1D259E50-20260322144242', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFF1D259E50-20260322144242 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 14:43:20');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('2de3c419-25d6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '600.00', '500.00', '1100.00', 'SPD-69BFBDEF894E0-20260322110119', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFBDEF894E0-20260322110119 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 11:01:58');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('374c3d70-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '5000.00', '2100.00', '7100.00', 'SPD-69BFC30383796-20260322112259', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFC30383796-20260322112259 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 11:23:42');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('3dfb695e-25d7-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '1000.00', '1100.00', '2100.00', 'SPD-69BFBFB8E0FDA-20260322110856', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFBFB8E0FDA-20260322110856 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 11:09:34');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('3e298c55-25e2-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '3000.00', '37100.00', '40100.00', 'SPD-69BFD22A028BB-20260322122738', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFD22A028BB-20260322122738 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 12:28:19');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('6493c255-3334-11f1-9ca4-5820b173055a', '02e38ec2-1373-11f1-8601-5820b173055a', 'deposit', '100.00', '153.75', '253.75', 'TEST-69D62B9A40772-20260408111906', 'completed', 'Wallet deposit via KoraPay - Reference: TEST-69D62B9A40772-20260408111906 (Fee: ?3.75)', NULL, NULL, NULL, '2026-04-08 11:19:06');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('6b3b5cc8fc5a788f652a1a67c3455542', '9a84c531-dffe-203a-6251-31764611114e', 'ride_payment', '4506.95', '145400.00', '140893.05', 'RIDE_69dd639d8bd42_20260413224357', 'completed', 'Payment for ride #SPDD727C8260413', '7e97529af0d6746c48be9adffe19a3d1', NULL, NULL, '2026-04-13 22:43:57');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('a64b018e-25d3-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '500.00', '0.00', '500.00', 'SPD-69BFB9AFD035F-20260322104311', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFB9AFD035F-20260322104311 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 10:43:51');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('b6b49cad-25d9-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '10000.00', '7100.00', '17100.00', 'SPD-69BFC3DFB0C20-20260322112639', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFC3DFB0C20-20260322112639 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 11:27:16');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('c407e647-25dd-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '20000.00', '17100.00', '37100.00', 'SPD-69BFCAAA91C6A-20260322115538', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFCAAA91C6A-20260322115538 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 11:56:16');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('cb172b35-3338-11f1-9ca4-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '100.00', '145200.00', '145300.00', 'SPD-69D632A78195D-20260408114911', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69D632A78195D-20260408114911 (Fee: ?1.61)', NULL, NULL, NULL, '2026-04-08 11:50:36');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('d02e37ee22302d1537e21142b35e9573', '9a84c531-dffe-203a-6251-31764611114e', 'ride_payment', '4506.95', '140893.05', '136386.10', 'RIDE_69dd6426263e6_20260413224614', 'completed', 'Payment for ride #SPD621163260413', '02d777066d0d76c7659d856a098dbad6', NULL, NULL, '2026-04-13 22:46:14');
INSERT INTO `wallet_transactions` (`id`, `user_id`, `transaction_type`, `amount`, `balance_before`, `balance_after`, `reference`, `status`, `description`, `ride_id`, `payment_method_id`, `metadata`, `created_at`) VALUES ('f739a484-25f6-11f1-8dd7-5820b173055a', '9a84c531-dffe-203a-6251-31764611114e', 'deposit', '3000.00', '42100.00', '45100.00', 'SPD-69BFF4F1552DF-20260322145601', 'completed', 'Wallet deposit via KoraPay - Reference: SPD-69BFF4F1552DF-20260322145601 (Fee: ?53.75)', NULL, NULL, NULL, '2026-03-22 14:56:39');

COMMIT;
