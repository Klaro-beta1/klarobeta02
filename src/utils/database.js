const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DatabaseService {
  constructor() {
    const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database.sqlite');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  // Generate API key
  generateApiKey() {
    return `klaro_${uuidv4().replace(/-/g, '')}`;
  }

  async init() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Clients table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS clients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            apiKey TEXT UNIQUE NOT NULL,
            domain TEXT NOT NULL,
            plan TEXT DEFAULT 'tier1',
            email TEXT,
            status TEXT DEFAULT 'active',
            createdAt TEXT NOT NULL,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Queries table for analytics
        this.db.run(`
          CREATE TABLE IF NOT EXISTS queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            apiKey TEXT NOT NULL,
            query TEXT NOT NULL,
            url TEXT NOT NULL,
            userAgent TEXT,
            responseTime INTEGER,
            timestamp TEXT NOT NULL,
            FOREIGN KEY (apiKey) REFERENCES clients (apiKey)
          )
        `);

        // Page data cache table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS page_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL,
            title TEXT,
            content TEXT,
            lastUpdated TEXT NOT NULL
          )
        `);

        // Create indexes for better performance
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_clients_apikey ON clients (apiKey)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_queries_apikey ON queries (apiKey)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_queries_timestamp ON queries (timestamp)`);
        this.db.run(`CREATE INDEX IF NOT EXISTS idx_page_data_url ON page_data (url)`);

        resolve();
      });
    });
  }

  // Client management
  async createClient(clientData) {
    return new Promise((resolve, reject) => {
      const { domain, plan, email, name, status = 'active' } = clientData;
      
      // Generate API key
      const apiKey = this.generateApiKey();
      const createdAt = new Date().toISOString();
      
      this.db.run(
        `INSERT INTO clients (apiKey, domain, plan, email, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
        [apiKey, domain, plan || 'free', email, status, createdAt],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              api_key: apiKey,
              domain,
              plan: plan || 'free',
              email,
              name,
              status,
              created_at: createdAt
            });
          }
        }
      );
    });
  }

  async getClient(apiKey) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM clients WHERE apiKey = ?`,
        [apiKey],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  async getAllClients({ page = 1, limit = 50, search = '' }) {
    return new Promise((resolve, reject) => {
      const offset = (page - 1) * limit;
      let whereClause = '';
      let params = [];

      if (search) {
        whereClause = 'WHERE domain LIKE ? OR email LIKE ? OR apiKey LIKE ?';
        params = [`%${search}%`, `%${search}%`, `%${search}%`];
      }

      // Get total count
      this.db.get(
        `SELECT COUNT(*) as total FROM clients ${whereClause}`,
        params,
        (err, countRow) => {
          if (err) {
            reject(err);
            return;
          }

          // Get paginated results
          this.db.all(
            `SELECT * FROM clients ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
            [...params, limit, offset],
            (err, rows) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  data: rows,
                  total: countRow.total,
                  pagination: {
                    page,
                    limit,
                    totalPages: Math.ceil(countRow.total / limit)
                  }
                });
              }
            }
          );
        }
      );
    });
  }

  async updateClient(apiKey, updates) {
    return new Promise((resolve, reject) => {
      const fields = Object.keys(updates);
      const values = Object.values(updates);
      const setClause = fields.map(field => `${field} = ?`).join(', ');

      this.db.run(
        `UPDATE clients SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE apiKey = ?`,
        [...values, apiKey],
        function(err) {
          if (err) {
            reject(err);
          } else if (this.changes === 0) {
            resolve(null); // No rows updated
          } else {
            // Return updated client
            resolve({ apiKey, ...updates });
          }
        }
      );
    });
  }

  async deleteClient(apiKey) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM clients WHERE apiKey = ?`,
        [apiKey],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.changes > 0);
          }
        }
      );
    });
  }

  // Query logging and analytics
  async logQuery(queryData) {
    return new Promise((resolve, reject) => {
      const { apiKey, query, url, userAgent, responseTime, timestamp } = queryData;
      
      this.db.run(
        `INSERT INTO queries (apiKey, query, url, userAgent, responseTime, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
        [apiKey, query, url, userAgent, responseTime, timestamp],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getClientUsage(apiKey) {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      this.db.all(
        `SELECT 
          COUNT(*) as totalQueries,
          COUNT(CASE WHEN timestamp >= ? THEN 1 END) as monthlyQueries,
          MAX(timestamp) as lastActive
         FROM queries WHERE apiKey = ?`,
        [startOfMonth, apiKey],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows[0] || { totalQueries: 0, monthlyQueries: 0, lastActive: null });
          }
        }
      );
    });
  }

  async getClientAnalytics(apiKey, timeframe = '30d') {
    return new Promise((resolve, reject) => {
      let dateFilter = '';
      const now = new Date();
      
      switch (timeframe) {
        case '7d':
          dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '30d':
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
          break;
        case '90d':
          dateFilter = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
          break;
        default:
          dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      }

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      this.db.all(
        `SELECT 
          COUNT(*) as totalQueries,
          COUNT(CASE WHEN timestamp >= ? THEN 1 END) as queriesThisMonth,
          AVG(responseTime) as averageResponseTime,
          query,
          COUNT(query) as queryCount
         FROM queries 
         WHERE apiKey = ? AND timestamp >= ?
         GROUP BY query
         ORDER BY queryCount DESC
         LIMIT 10`,
        [startOfMonth, apiKey, dateFilter],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          // Get recent queries
          this.db.all(
            `SELECT query, url, timestamp FROM queries 
             WHERE apiKey = ? AND timestamp >= ?
             ORDER BY timestamp DESC LIMIT 20`,
            [apiKey, dateFilter],
            (err, recentRows) => {
              if (err) {
                reject(err);
              } else {
                const analytics = rows[0] || { totalQueries: 0, queriesThisMonth: 0, averageResponseTime: 0 };
                resolve({
                  ...analytics,
                  topQueries: rows.map(r => ({ query: r.query, count: r.queryCount })),
                  recentQueries: recentRows,
                  dailyStats: [] // TODO: Implement daily stats
                });
              }
            }
          );
        }
      );
    });
  }

  async getRecentQueries(apiKey, limit = 20) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT query, url, timestamp FROM queries 
         WHERE apiKey = ? 
         ORDER BY timestamp DESC LIMIT ?`,
        [apiKey, limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Page data caching
  async savePageData(url, data) {
    return new Promise((resolve, reject) => {
      const content = JSON.stringify(data);
      const lastUpdated = new Date().toISOString();

      this.db.run(
        `INSERT OR REPLACE INTO page_data (url, title, content, lastUpdated) VALUES (?, ?, ?, ?)`,
        [url, data.title || '', content, lastUpdated],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(this.lastID);
          }
        }
      );
    });
  }

  async getPageData(url) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM page_data WHERE url = ?`,
        [url],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            try {
              const data = JSON.parse(row.content);
              resolve({
                ...data,
                lastUpdated: row.lastUpdated
              });
            } catch (e) {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  // System statistics
  async getSystemStats() {
    return new Promise((resolve, reject) => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      this.db.all(
        `SELECT 
          (SELECT COUNT(*) FROM clients) as totalClients,
          (SELECT COUNT(*) FROM clients WHERE status = 'active') as activeClients,
          (SELECT COUNT(*) FROM queries) as totalQueries,
          (SELECT COUNT(*) FROM queries WHERE timestamp >= ?) as queriesThisMonth,
          (SELECT COUNT(*) FROM queries WHERE timestamp >= ?) as queriesThisWeek,
          (SELECT COUNT(*) FROM queries WHERE timestamp >= ?) as queriesToday`,
        [startOfMonth, startOfWeek, startOfDay],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }

          const stats = rows[0];

          // Get plan distribution
          this.db.all(
            `SELECT plan, COUNT(*) as count FROM clients GROUP BY plan`,
            (err, planRows) => {
              if (err) {
                reject(err);
                return;
              }

              // Get top domains
              this.db.all(
                `SELECT c.domain, COUNT(q.id) as queryCount 
                 FROM clients c 
                 LEFT JOIN queries q ON c.apiKey = q.apiKey 
                 GROUP BY c.domain 
                 ORDER BY queryCount DESC 
                 LIMIT 10`,
                (err, domainRows) => {
                  if (err) {
                    reject(err);
                  } else {
                    const planDistribution = {};
                    planRows.forEach(row => {
                      planDistribution[row.plan] = row.count;
                    });

                    resolve({
                      ...stats,
                      averageQueriesPerClient: stats.totalClients > 0 ? 
                        Math.round(stats.totalQueries / stats.totalClients) : 0,
                      planDistribution,
                      topDomains: domainRows
                    });
                  }
                }
              );
            }
          );
        }
      );
    });
  }

  async getRecentActivity(limit = 50) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          'query' as type,
          q.query as description,
          c.domain,
          q.timestamp
         FROM queries q
         JOIN clients c ON q.apiKey = c.apiKey
         ORDER BY q.timestamp DESC
         LIMIT ?`,
        [limit],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  // Close database connection
  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
        resolve();
      });
    });
  }
}

module.exports = { DatabaseService };