import json
from cryptography.fernet import Fernet

def generate_key():
    """
    Generates a new Fernet key for encryption and decryption.
    Returns:
        bytes: The generated key.
    """
    return Fernet.generate_key()

def encrypt_data(key, *data_items):
    """
    Encrypts multiple data items using the provided key.
    Args:
        key (bytes): The encryption key.
        *data_items: Variable number of data items to encrypt.
    Returns:
        bytes: The encrypted data.
    """
    # Serialize the data items into a JSON-formatted string
    serialized_data = json.dumps(data_items)
    # Initialize the Fernet cipher with the provided key
    fernet = Fernet(key)
    # Encrypt the serialized data
    encrypted_data = fernet.encrypt(serialized_data.encode())
    return encrypted_data

def decrypt_data(key, encrypted_data):
    """
    Decrypts the encrypted data using the provided key.
    Args:
        key (bytes): The encryption key.
        encrypted_data (bytes): The data to decrypt.
    Returns:
        tuple: The decrypted data items.
    """
    # Initialize the Fernet cipher with the provided key
    fernet = Fernet(key)
    # Decrypt the data
    decrypted_data = fernet.decrypt(encrypted_data).decode()
    # Deserialize the JSON-formatted string back into Python data types
    data_items = json.loads(decrypted_data)
    return tuple(data_items)

# Example usage
if __name__ == "__main__":
    # Generate a new encryption key
    key = generate_key()
    print(f"Encryption Key: {key.decode()}")

    # Define the data items to encrypt
    data1 = "First piece of data"
    data2 = ["Second piece of data", 55]
    data3 = 666

    # Encrypt the data items
    encrypted = encrypt_data(key, data1, data2, data3)
    print(f"Encrypted data: {encrypted}")

    # Decrypt the data items
    decrypted = decrypt_data(key, encrypted)
    print(f"Decrypted data: {decrypted}")
