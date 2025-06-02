import { getUserByUsername, createUser, hashPassword } from './db';

export async function initializeAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Check if admin already exists
  const existingAdmin = getUserByUsername.get(adminUsername);
  
  if (!existingAdmin) {
    // Create admin user
    const hashedPassword = await hashPassword(adminPassword);
    createUser.run({
      username: adminUsername,
      password: hashedPassword,
      is_admin: 1
    });
    console.log('Admin user created successfully');
  }
}

// Initialize admin on module load
initializeAdmin().catch(console.error);