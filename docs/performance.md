# Performance Considerations

The system must handle 10,000 employees seamlessly. While 10,000 rows is trivial for a relational database, improper application design can cause noticeable UI lag and memory bloat.

## 1. Data Loading (Avoiding Memory Bloat)
- **Pagination is Mandatory:** The backend will *never* return all 10,000 employees in a single request. 
- The `GET /api/employees` endpoint defaults to limits (e.g., 50 items per page).
- The frontend will utilize infinite scrolling or classic pagination via RTK Query.

## 2. Search and Filtering
- Search operations on 10,000 records must be optimized.
- **Database Indexes:** B-Tree indexes will be applied to heavily queried columns:
  - `tenantId` + `lastName`
  - `tenantId` + `department`
- `LIKE %search%` queries will be avoided on large text fields. Prefix searches (`LIKE search%`) or basic full-text search will be used to leverage indexes.

## 3. Analytics Queries
- Calculating average salaries across departments for 10,000 employees in real-time is feasible but requires optimization.
- **Approach:** Perform aggregations at the database level (`GROUP BY`, `AVG()`) rather than pulling raw data into Node.js to reduce network I/O and memory consumption.
- If real-time aggregation becomes a bottleneck, we will introduce a materialized view or cache, though this is likely unnecessary for 10k rows.

## 4. Current Salary Resolution
- Fetching an employee directory often requires showing the *current* salary.
- Instead of joining the entire compensation history table for every row, we will either:
  - Use a window function / subquery to fetch only the latest effective salary.
  - Store a denormalized `currentSalary` on the `Employee` table that updates via triggers/hooks when a new compensation is added (Read-Heavy optimization). For the MVP, a smart query will suffice.
