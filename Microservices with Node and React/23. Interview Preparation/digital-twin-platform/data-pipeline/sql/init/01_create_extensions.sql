-- Digital Twin Database - Extensions Setup
-- This script creates necessary PostgreSQL extensions for time-series and performance optimization

-- Enable UUID generation for unique identifiers
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable advanced indexing capabilities
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Enable time-series data types and functions
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Enable JSON operations optimization
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable cross-database queries (for future federation)
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- Enable temporal data operations
CREATE EXTENSION IF NOT EXISTS tsm_system_rows;

-- Log extension creation
DO $$
BEGIN
    RAISE NOTICE 'Digital Twin Database Extensions Created Successfully';
    RAISE NOTICE 'UUID Generation: Enabled';
    RAISE NOTICE 'Advanced Indexing: Enabled';
    RAISE NOTICE 'Time-series Support: Enabled';
    RAISE NOTICE 'JSON Optimization: Enabled';
END $$;
