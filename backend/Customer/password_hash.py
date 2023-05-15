import bcrypt

def hash_password(password):
    encoded = password.encode('utf-8')
    hashed = bcrypt.hashpw(encoded, bcrypt.gensalt())

    return hashed.decode('utf-8')

def check_password(password, hashed):
    encoded = password.encode('utf-8')
    hash_encoded = hashed.encode('utf-8')
    return bcrypt.checkpw(encoded, hash_encoded)
