-- Add seed data for testing

-- Add test users with bcrypt encoded passwords (password is 'password')
INSERT INTO users (email, password, first_name, last_name, phone_number, role_id)
VALUES 
    ('admin@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Admin', 'User', '555-123-4567', 3),
    ('provider1@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'John', 'Provider', '555-234-5678', 2),
    ('provider2@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Jane', 'Provider', '555-345-6789', 2),
    ('client1@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Alice', 'Client', '555-456-7890', 1),
    ('client2@example.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Bob', 'Client', '555-567-8901', 1);

-- Add user roles
INSERT INTO admins (id, super_admin)
VALUES ((SELECT id FROM users WHERE email = 'admin@example.com'), TRUE);

INSERT INTO providers (id, title, description)
VALUES 
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 'Senior Therapist', 'Experienced therapist specializing in massage therapy and wellness treatments.'),
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 'Hair Stylist', 'Professional hair stylist with 10+ years of experience in cutting, coloring, and styling.');

INSERT INTO clients (id)
VALUES 
    ((SELECT id FROM users WHERE email = 'client1@example.com')),
    ((SELECT id FROM users WHERE email = 'client2@example.com'));

-- Add services
INSERT INTO services (name, description, duration_minutes, price, provider_id)
VALUES 
    ('Swedish Massage', 'Relaxing full body massage that works the soft tissues and muscles to help restore health.', 60, 80.00, (SELECT id FROM users WHERE email = 'provider1@example.com')),
    ('Deep Tissue Massage', 'Massage therapy focusing on realigning deeper layers of muscles and connective tissue.', 60, 100.00, (SELECT id FROM users WHERE email = 'provider1@example.com')),
    ('Hot Stone Massage', 'Massage therapy that uses smooth, heated stones to warm up tight muscles.', 90, 120.00, (SELECT id FROM users WHERE email = 'provider1@example.com')),
    ('Haircut', 'Professional haircut tailored to your preferences and face shape.', 45, 50.00, (SELECT id FROM users WHERE email = 'provider2@example.com')),
    ('Hair Coloring', 'Professional hair coloring service using premium products.', 120, 120.00, (SELECT id FROM users WHERE email = 'provider2@example.com')),
    ('Hair Styling', 'Professional hair styling for special occasions.', 60, 70.00, (SELECT id FROM users WHERE email = 'provider2@example.com'));

-- Add availability for providers
-- Provider 1 availability (Monday to Friday, 9 AM to 5 PM)
INSERT INTO availability (provider_id, day_of_week, start_time, end_time, recurring)
VALUES 
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 1, '09:00:00', '17:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 2, '09:00:00', '17:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 3, '09:00:00', '17:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 4, '09:00:00', '17:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider1@example.com'), 5, '09:00:00', '17:00:00', TRUE);

-- Provider 2 availability (Tuesday to Saturday, 10 AM to 6 PM)
INSERT INTO availability (provider_id, day_of_week, start_time, end_time, recurring)
VALUES 
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 2, '10:00:00', '18:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 3, '10:00:00', '18:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 4, '10:00:00', '18:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 5, '10:00:00', '18:00:00', TRUE),
    ((SELECT id FROM users WHERE email = 'provider2@example.com'), 6, '10:00:00', '18:00:00', TRUE);

-- Add some sample appointments
-- Get status IDs
SET @PENDING_STATUS = (SELECT id FROM appointment_statuses WHERE name = 'PENDING');
SET @CONFIRMED_STATUS = (SELECT id FROM appointment_statuses WHERE name = 'CONFIRMED');
SET @COMPLETED_STATUS = (SELECT id FROM appointment_statuses WHERE name = 'COMPLETED');

-- Add appointments for next week (adjust dates as needed)
INSERT INTO appointments (client_id, provider_id, service_id, start_time, end_time, status_id, notes)
VALUES 
    ((SELECT id FROM users WHERE email = 'client1@example.com'),
     (SELECT id FROM users WHERE email = 'provider1@example.com'),
     (SELECT id FROM services WHERE name = 'Swedish Massage'),
     DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY) + INTERVAL 10 HOUR,
     DATE_ADD(CURRENT_DATE(), INTERVAL 1 DAY) + INTERVAL 11 HOUR,
     @CONFIRMED_STATUS,
     'First time client, please be extra attentive'),
     
    ((SELECT id FROM users WHERE email = 'client2@example.com'),
     (SELECT id FROM users WHERE email = 'provider1@example.com'),
     (SELECT id FROM services WHERE name = 'Deep Tissue Massage'),
     DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY) + INTERVAL 14 HOUR,
     DATE_ADD(CURRENT_DATE(), INTERVAL 2 DAY) + INTERVAL 15 HOUR,
     @CONFIRMED_STATUS,
     'Client mentioned back pain issues'),
     
    ((SELECT id FROM users WHERE email = 'client1@example.com'),
     (SELECT id FROM users WHERE email = 'provider2@example.com'),
     (SELECT id FROM services WHERE name = 'Haircut'),
     DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY) + INTERVAL 11 HOUR,
     DATE_ADD(CURRENT_DATE(), INTERVAL 3 DAY) + INTERVAL 11 HOUR + INTERVAL 45 MINUTE,
     @PENDING_STATUS,
     'Client wants to discuss new hairstyle options'); 