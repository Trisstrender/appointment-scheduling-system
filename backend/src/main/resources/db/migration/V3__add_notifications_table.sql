-- Create notifications table
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message VARCHAR(500) NOT NULL,
    `read` BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_id_read ON notifications(user_id, `read`);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Add some sample notifications for demo purposes
INSERT INTO notifications (user_id, type, title, message, `read`, created_at, data)
VALUES 
-- Client notifications
(3, 'APPOINTMENT_CONFIRMED', 'Appointment Confirmed', 'Your appointment for Swedish Massage on Friday at 2:00 PM has been confirmed.', false, NOW(), '{"appointmentId": 1, "serviceName": "Swedish Massage", "dateTime": "2023-06-23 14:00:00"}'),
(3, 'APPOINTMENT_REMINDER', 'Upcoming Appointment', 'Reminder: You have an appointment for Deep Tissue Massage tomorrow at 10:00 AM.', false, DATE_SUB(NOW(), INTERVAL 1 HOUR), '{"appointmentId": 2, "serviceName": "Deep Tissue Massage", "dateTime": "2023-06-20 10:00:00"}'),
(3, 'APPOINTMENT_CANCELLED', 'Appointment Cancelled', 'Your appointment for Hair Styling on Monday has been cancelled.', true, DATE_SUB(NOW(), INTERVAL 3 DAY), '{"appointmentId": 3, "serviceName": "Hair Styling", "dateTime": "2023-06-19 15:30:00"}'),

-- Provider notifications
(2, 'NEW_APPOINTMENT', 'New Appointment', 'New appointment request from John Client for Swedish Massage on Friday at 2:00 PM.', false, NOW(), '{"appointmentId": 1, "clientName": "John Client", "serviceName": "Swedish Massage", "dateTime": "2023-06-23 14:00:00"}'),
(2, 'APPOINTMENT_CANCELLED', 'Appointment Cancelled', 'An appointment for Hair Styling on Monday has been cancelled by the client.', false, DATE_SUB(NOW(), INTERVAL 2 DAY), '{"appointmentId": 3, "clientName": "John Client", "serviceName": "Hair Styling", "dateTime": "2023-06-19 15:30:00"}'); 