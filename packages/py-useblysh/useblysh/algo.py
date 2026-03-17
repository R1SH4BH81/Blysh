import numpy as np
from PIL import Image
import math

# Base83 characters
CHARACTERS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~"

def encode_base83(value, length):
    result = ""
    for i in range(1, length + 1):
        digit = (int(value) // (83 ** (length - i))) % 83
        result += CHARACTERS[digit]
    return result

def decode_base83(str_value):
    value = 0
    for char in str_value:
        digit = CHARACTERS.index(char)
        value = value * 83 + digit
    return value

def srgb_to_linear(value):
    v = value / 255.0
    if v <= 0.04045:
        return v / 12.92
    else:
        return ((v + 0.055) / 1.055) ** 2.4

def linear_to_srgb(value):
    v = max(0, min(1, value))
    if v <= 0.0031308:
        return int(v * 12.92 * 255 + 0.5)
    else:
        return int((1.055 * (v ** (1 / 2.4)) - 0.055) * 255 + 0.5)

def sign_pow(value, exp):
    return math.copysign(pow(abs(value), exp), value)

def encode(image: Image.Image, components_x=4, components_y=3):
    if components_x < 1 or components_x > 9 or components_y < 1 or components_y > 9:
        raise ValueError("Components must be between 1 and 9")

    # Downsample to 32x32 for DCT
    img = image.convert("RGB").resize((32, 32), Image.Resampling.LANCZOS)
    pixels = np.array(img)
    
    width, height = img.size
    
    # Convert to linear RGB
    linear_pixels = np.vectorize(srgb_to_linear)(pixels)
    
    def get_basis_function(i, j):
        def basis(x, y):
            return math.cos(math.pi * i * x / width) * math.cos(math.pi * j * y / height)
        return basis

    factors = []
    for j in range(components_y):
        for i in range(components_x):
            basis = get_basis_function(i, j)
            
            r, g, b = 0, 0, 0
            normalisation = (1 if i == 0 else 2) * (1 if j == 0 else 2)
            
            for y in range(height):
                for x in range(width):
                    val = basis(x, y)
                    r += val * linear_pixels[y, x, 0]
                    g += val * linear_pixels[y, x, 1]
                    b += val * linear_pixels[y, x, 2]
            
            scale = normalisation / (width * height)
            factors.append([r * scale, g * scale, b * scale])

    dc = factors[0]
    ac = factors[1:]

    # Encode DC
    def encode_dc(value):
        rounded_r = linear_to_srgb(value[0])
        rounded_g = linear_to_srgb(value[1])
        rounded_b = linear_to_srgb(value[2])
        return (rounded_r << 16) + (rounded_g << 8) + rounded_b

    # Encode AC
    def encode_ac(value, maximum_value):
        quant_r = max(0, min(18, int(sign_pow(value[0] / maximum_value, 0.5) * 9 + 9.5)))
        quant_g = max(0, min(18, int(sign_pow(value[1] / maximum_value, 0.5) * 9 + 9.5)))
        quant_b = max(0, min(18, int(sign_pow(value[2] / maximum_value, 0.5) * 9 + 9.5)))
        return quant_r * 19 * 19 + quant_g * 19 + quant_b

    res = ""
    # Size flag: (components_x - 1) + (components_y - 1) * 9
    res += encode_base83((components_x - 1) + (components_y - 1) * 9, 1)
    
    # Max AC value
    if len(ac) > 0:
        max_ac = max([max(map(abs, f)) for f in ac])
        quant_max_ac = max(0, min(82, int(max_ac * 166 - 0.5)))
        res += encode_base83(quant_max_ac, 1)
        actual_max_ac = (quant_max_ac + 1) / 166
    else:
        res += encode_base83(0, 1)
        actual_max_ac = 1

    res += encode_base83(encode_dc(dc), 4)
    
    for factor in ac:
        res += encode_base83(encode_ac(factor, actual_max_ac), 2)
        
    return res
