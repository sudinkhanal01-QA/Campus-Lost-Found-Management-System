// backend/config/db.js
const mongoose = require('mongoose');
const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs'); // Import bcrypt for password hashing

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Check for and create default admin user if not exists
        const adminEmail = 'admin@example.com';
        const adminUsername = 'admin';
        const adminPassword = 'adminpass'; // CHANGE THIS IN PRODUCTION!

        let adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            adminUser = new User({
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });
            await adminUser.save();
            console.log('Default admin user created: admin@example.com (password: adminpass)');
            console.warn('IMPORTANT: Please change the default admin password immediately!');
        }

    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
