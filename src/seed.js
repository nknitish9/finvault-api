const bcrypt = require('bcryptjs');
const { db, initializeDatabase } = require('./config/database');
const { ROLES, RECORD_TYPES, CATEGORIES } = require('./utils/constants');

// Initialize schema if not exists
initializeDatabase();

const seedDatabase = async () => {
  console.log('Seeding database...');

  try {
    // Clear existing data (in a real app, you'd want to be more careful!)
    db.prepare('DELETE FROM financial_records').run();
    db.prepare('DELETE FROM users').run();

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Users
    console.log('Creating users...');
    const insertUser = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (@username, @email, @password_hash, @full_name, @role)
    `);

    const users = [
      { username: 'admin_user', email: 'admin@test.com', password_hash: passwordHash, full_name: 'Admin Boss', role: ROLES.ADMIN },
      { username: 'analyst_user', email: 'analyst@test.com', password_hash: passwordHash, full_name: 'Data Analyst', role: ROLES.ANALYST },
      { username: 'viewer_user', email: 'viewer@test.com', password_hash: passwordHash, full_name: 'Just Viewing', role: ROLES.VIEWER }
    ];

    const insertedUsers = users.map(user => {
      const info = insertUser.run(user);
      return { ...user, id: info.lastInsertRowid };
    });

    const adminId = insertedUsers.find(u => u.role === ROLES.ADMIN).id;

    // 2. Seed Financial Records
    console.log('Creating financial records...');
    const insertRecord = db.prepare(`
      INSERT INTO financial_records (user_id, type, category, amount, description, date)
      VALUES (@user_id, @type, @category, @amount, @description, @date)
    `);

    // Generate historic dates
    const today = new Date();
    const getRandomDate = (monthsAgo) => {
      const d = new Date(today);
      d.setMonth(d.getMonth() - Math.floor(Math.random() * monthsAgo));
      d.setDate(Math.floor(Math.random() * 28) + 1);
      return d.toISOString().split('T')[0];
    };

    const records = [];

    // Income records
    for (let i = 0; i < 20; i++) {
        records.push({
            user_id: adminId,
            type: RECORD_TYPES.INCOME,
            category: 'salary',
            amount: 5000 + Math.random() * 1000,
            description: 'Monthly Salary',
            date: getRandomDate(6)
        });
        records.push({
            user_id: adminId,
            type: RECORD_TYPES.INCOME,
            category: 'freelance',
            amount: 500 + Math.random() * 1500,
            description: 'Freelance work',
            date: getRandomDate(6)
        });
    }

    // Expense records
    for (let i = 0; i < 50; i++) {
        records.push({
            user_id: adminId,
            type: RECORD_TYPES.EXPENSE,
            category: CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)],
            amount: 50 + Math.random() * 400,
            description: 'Assorted expenses',
            date: getRandomDate(6)
        });
    }

    db.transaction(() => {
        for (const record of records) {
             insertRecord.run(record);
        }
    })();

    console.log('Database seeded successfully!');
    console.log('Test Accounts (Password: password123)');
    console.log('- Admin: admin@test.com');
    console.log('- Analyst: analyst@test.com');
    console.log('- Viewer: viewer@test.com');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
