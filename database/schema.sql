-- Main tables for banking churn prediction system

-- Customers table
CREATE TABLE customers (
    customer_id VARCHAR(10) PRIMARY KEY,
    age INTEGER NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    income NUMERIC,
    account_age_months INTEGER,
    balance NUMERIC,
    num_products INTEGER,
    has_credit_card BOOLEAN,
    has_savings BOOLEAN,
    has_loan BOOLEAN,
    has_mortgage BOOLEAN,
    has_investment BOOLEAN,
    credit_score INTEGER,
    months_inactive INTEGER,
    transaction_count_12m INTEGER,
    contacted_support BOOLEAN,
    complaint_count INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Risk scores table
CREATE TABLE risk_scores (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(10) REFERENCES customers(customer_id),
    churn_probability NUMERIC NOT NULL,
    risk_category VARCHAR(10) CHECK (risk_category IN ('Low', 'Medium', 'High')),
    prediction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (customer_id, prediction_date)
);

-- Retention actions table
CREATE TABLE retention_actions (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(10) REFERENCES customers(customer_id),
    action_type VARCHAR(50) NOT NULL,
    description TEXT,
    estimated_impact VARCHAR(10),
    estimated_cost NUMERIC,
    applied BOOLEAN DEFAULT FALSE,
    applied_date TIMESTAMP,
    result_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer feedback table
CREATE TABLE customer_feedback (
    id SERIAL PRIMARY KEY,
    customer_id VARCHAR(10) REFERENCES customers(customer_id),
    feedback_text TEXT NOT NULL,
    sentiment_score NUMERIC,
    feedback_source VARCHAR(50),
    feedback_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer segments table
CREATE TABLE customer_segments (
    id SERIAL PRIMARY KEY,
    segment_name VARCHAR(50) NOT NULL,
    segment_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customer segment mappings
CREATE TABLE customer_segment_mappings (
    customer_id VARCHAR(10) REFERENCES customers(customer_id),
    segment_id INTEGER REFERENCES customer_segments(id),
    PRIMARY KEY (customer_id, segment_id)
);

-- Indexes for performance
CREATE INDEX idx_risk_scores_customer ON risk_scores(customer_id);
CREATE INDEX idx_risk_scores_category ON risk_scores(risk_category);
CREATE INDEX idx_retention_actions_customer ON retention_actions(customer_id);
CREATE INDEX idx_customer_feedback_customer ON customer_feedback(customer_id);
CREATE INDEX idx_customer_feedback_sentiment ON customer_feedback(sentiment_score);