import unittest
import numpy as np
from PIL import Image
from useblysh.algo import encode, decode_base83, encode_base83

class TestAlgo(unittest.TestCase):
    def test_encode_decode_base83(self):
        val = 12345
        length = 4
        encoded = encode_base83(val, length)
        decoded = decode_base83(encoded)
        self.assertEqual(val, decoded)

    def test_encode_image(self):
        # Create a simple red image
        img = Image.new('RGB', (32, 32), color='red')
        hash_str = encode(img, components_x=4, components_y=3)
        self.assertIsInstance(hash_str, str)
        self.assertGreater(len(hash_str), 6)

    def test_invalid_components(self):
        img = Image.new('RGB', (32, 32), color='red')
        with self.assertRaises(ValueError):
            encode(img, components_x=0)
        with self.assertRaises(ValueError):
            encode(img, components_x=10)

if __name__ == '__main__':
    unittest.main()
