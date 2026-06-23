const users = new Map();
let nextId = 1;

function clone(value) {
    return value ? JSON.parse(JSON.stringify(value)) : value;
}

function matches(user, query) {
    if (!query) return true;

    if (query.$or) {
        return query.$or.some(condition => matches(user, condition));
    }

    return Object.entries(query).every(([key, value]) => String(user[key]) === String(value));
}

function applySet(user, update) {
    if (update?.$unset) {
        Object.keys(update.$unset).forEach(key => {
            delete user[key];
        });
    }

    if (!update?.$set) return user;

    Object.entries(update.$set).forEach(([key, value]) => {
        user[key] = value;
    });

    return user;
}

function sanitize(user, fields) {
    const result = clone(user);
    if (!result) return result;

    if (fields === '-password') {
        delete result.password;
    }

    if (fields && fields !== '-password') {
        const selected = {};
        fields.split(/\s+/).filter(Boolean).forEach(field => {
            selected[field] = result[field];
        });
        selected._id = result._id;
        return selected;
    }

    return result;
}

function chain(value) {
    let selectedFields = null;

    const query = {
        select(fields) {
            selectedFields = fields;
            return query;
        },
        lean() {
            return Promise.resolve(sanitize(value, selectedFields));
        },
        then(resolve, reject) {
            const result = selectedFields ? sanitize(value, selectedFields) : value;
            return Promise.resolve(result).then(resolve, reject);
        },
        catch(reject) {
            const result = selectedFields ? sanitize(value, selectedFields) : value;
            return Promise.resolve(result).catch(reject);
        }
    };

    return query;
}

class InMemoryUser {
    constructor(data) {
        Object.assign(this, data);
        this._id = this._id || String(nextId++);
    }

    async save() {
        users.set(String(this._id), clone(this));
        return this;
    }

    static reset() {
        users.clear();
        nextId = 1;
    }

    static all() {
        return Array.from(users.values()).map(clone);
    }

    static async findOne(query) {
        const user = Array.from(users.values()).find(candidate => matches(candidate, query));
        return user ? new InMemoryUser(clone(user)) : null;
    }

    static findById(id) {
        const user = users.get(String(id));
        return chain(user ? new InMemoryUser(clone(user)) : null);
    }

    static findByIdAndUpdate(id, update) {
        const user = users.get(String(id));
        if (!user) {
            return chain(null);
        }

        applySet(user, update);
        users.set(String(id), clone(user));
        return chain(new InMemoryUser(clone(user)));
    }
}

module.exports = InMemoryUser;
