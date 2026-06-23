const bcrypt = require('bcrypt');
const User = require('../../models/User');

async function loginUser(username, password) {
    const user = await User.findOne({ username });
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return { success: false, message: 'Invalid password' };
    }

    return { success: true, user };
}

async function signupUser(username, password) {
    if (!username || !password) {
        return { status: 400, body: { message: 'Username and password are required' } };
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return { status: 400, body: { message: 'Username already exists' } };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();

    return { status: 201, body: { message: 'User created successfully' } };
}

module.exports = {
    loginUser,
    signupUser
};
