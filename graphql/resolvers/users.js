const User = require('../../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { UserInputError } = require('apollo-server');

const { validateRegisterInput, validateLoginInput } = require('../../utils/validators');

const { SECRETKEY } = require('../../config');

function generateToken(user){
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username
    }, SECRETKEY, { expiresIn: '1h'});
}

module.exports = {
    Mutation: {
        async register(_, { registerInput: { username, email, password, confirmPassword }}, context, info) {
            // Validate user data
            const { valid, errors } = validateRegisterInput( username, email, password, confirmPassword );

            if ( !valid ) {
                throw new UserInputError('Errors', {
                    errors
                })
            }

            // Check User existence
            const user = await User.findOne({ username });

            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }

            // Hash password and create auth token
            password = await bcrypt.hash(password, 12);

            const newUser = new User ({
                email, 
                username,
                password,
                createdAt: new Date().toISOString()
            });

            const res = await newUser.save();

            const token = generateToken(res)

            return {
                ...res._doc,
                id: res._id,
                token
            };
        },

        async login(_, { username, password }, context, info ) {
            const { errors, valid } = validateLoginInput( username, password );

            if (!valid) {
                throw new UserInputError('Errors', { errors })
            }

            const user = await User.findOne({ username });

            if (!user) {
                errors.general = 'User does not exist';
                throw new UserInputError('User does not exist', { errors })
            }

            // Compare passwords
            const match = bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Incorrect credentials';
                throw new UserInputError('Incorrect credentials', { errors })
            }

            const token = generateToken(user)

            return {
                ...user._doc,
                id: user._id,
                token
            };
        }
    }
}