-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS stores;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    address TEXT CHECK (length(address) <= 400),
    role VARCHAR(20) NOT NULL DEFAULT 'normal_user' CHECK (role IN ('system_admin', 'normal_user', 'store_owner')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create stores table
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60) NOT NULL CHECK (length(name) >= 20 AND length(name) <= 60),
    email VARCHAR(255) UNIQUE NOT NULL,
    address TEXT CHECK (length(address) <= 400),
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ratings table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, store_id) -- Prevent duplicate ratings from same user for same store
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_stores_name ON stores(name);
CREATE INDEX idx_stores_owner ON stores(owner_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
CREATE INDEX idx_ratings_user_store ON ratings(user_id, store_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ratings_updated_at BEFORE UPDATE ON ratings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default system administrator
INSERT INTO users (name, email, password, address, role) VALUES 
('System Administrator User', 'admin@system.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/VGOxUQJ6P7QJjEUCS', '123 Admin Street, Admin City, Admin State', 'system_admin');
-- Default password is 'Admin123!' (hashed with bcrypt)

-- Create a view for store ratings statistics
CREATE VIEW store_ratings_view AS
SELECT 
    s.id,
    s.name,
    s.email,
    s.address,
    COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) as average_rating,
    COUNT(r.rating) as total_ratings
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
GROUP BY s.id, s.name, s.email, s.address;

-- Create a view for user statistics
CREATE VIEW user_stats_view AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'normal_user') as normal_users_count,
    (SELECT COUNT(*) FROM users WHERE role = 'store_owner') as store_owners_count,
    (SELECT COUNT(*) FROM users WHERE role = 'system_admin') as admin_users_count,
    (SELECT COUNT(*) FROM users) as total_users_count,
    (SELECT COUNT(*) FROM stores) as total_stores_count,
    (SELECT COUNT(*) FROM ratings) as total_ratings_count;