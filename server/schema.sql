CREATE DATABASE IF NOT EXISTS scribblepark;
USE scribblepark;

CREATE TABLE IF NOT EXISTS creations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    classification VARCHAR(50) NOT NULL DEFAULT 'flower',
    creator_name VARCHAR(50),
    image MEDIUMBLOB NOT NULL,
    mime_type VARCHAR(50) NOT NULL DEFAULT 'image/png',
    position_x FLOAT NOT NULL,
    position_y FLOAT NOT NULL DEFAULT 0,
    position_z FLOAT NOT NULL,
    scale FLOAT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
