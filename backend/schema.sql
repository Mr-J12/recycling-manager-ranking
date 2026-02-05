-- 1. Create Tables
CREATE TABLE candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    years_experience INT,
    bio TEXT,
    skills JSON -- Storing array of skills like ["Six Sigma", "OSHA"]
);

CREATE TABLE evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT,
    crisis_management_score INT CHECK (crisis_management_score BETWEEN 0 AND 10),
    sustainability_score INT CHECK (sustainability_score BETWEEN 0 AND 10),
    team_motivation_score INT CHECK (team_motivation_score BETWEEN 0 AND 10),
    ai_feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE
);

-- 2. Rankings View (Auto-updates)
-- Weighted Average: Crisis (30%), Sustainability (40%), Motivation (30%)
CREATE VIEW candidate_rankings AS
SELECT 
    c.id,
    c.name,
    c.years_experience,
    e.crisis_management_score,
    e.sustainability_score,
    e.team_motivation_score,
    ROUND(
        (e.crisis_management_score * 0.3) + 
        (e.sustainability_score * 0.4) + 
        (e.team_motivation_score * 0.3), 2
    ) as total_score
FROM candidates c
JOIN evaluations e ON c.id = e.candidate_id
ORDER BY total_score DESC;