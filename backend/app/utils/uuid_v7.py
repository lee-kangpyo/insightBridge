import os
import time
import uuid

def generate_uuid_v7() -> str:
    """
    Generate a UUID v7 as per RFC 9562.
    UUID v7 is time-ordered and suitable for primary keys.
    """
    # 1. 48-bit timestamp (milliseconds)
    ms = int(time.time() * 1000)
    
    # 2. 74 bits of randomness
    rand_a = os.urandom(2)
    rand_b = os.urandom(8)
    
    # 3. Construct the byte array
    # [48 bits ms] [4 bits version] [12 bits rand_a] [2 bits variant] [62 bits rand_b]
    
    # ms to 6 bytes
    b = ms.to_bytes(6, byteorder='big')
    
    # Version 7: set bits 48-51 to 0111 (0x7)
    # rand_a: bits 52-63
    v_rand_a = (0x7000 | (int.from_bytes(rand_a, 'big') & 0x0FFF)).to_bytes(2, 'big')
    
    # Variant 2 (RFC 4122): set bits 64-65 to 10 (0x8)
    # rand_b: bits 66-127
    v_rand_b = (0x8000000000000000 | (int.from_bytes(rand_b, 'big') & 0x3FFFFFFFFFFFFFFF)).to_bytes(8, 'big')
    
    final_bytes = b + v_rand_a + v_rand_b
    return str(uuid.UUID(bytes=final_bytes))
