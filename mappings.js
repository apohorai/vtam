// mappings.js
const asciiToEBCDIC = {
    ' ': 0x40, '!': 0x5A, '"': 0x7F, '#': 0x7B, '$': 0x5B, '%': 0x6C, '&': 0x50,
    "'": 0x7D, '(': 0x4D, ')': 0x5D, '*': 0x5C, '+': 0x4E, ',': 0x6B, '-': 0x60,
    '.': 0x4B, '/': 0x61, '0': 0xF0, '1': 0xF1, '2': 0xF2, '3': 0xF3, '4': 0xF4,
    '5': 0xF5, '6': 0xF6, '7': 0xF7, '8': 0xF8, '9': 0xF9, ':': 0x7A, ';': 0x5E,
    '<': 0x4C, '=': 0x7E, '>': 0x6E, '?': 0x6F, '@': 0x7C, 
    'A': 0xC1, 'B': 0xC2, 'C': 0xC3, 'D': 0xC4, 'E': 0xC5, 'F': 0xC6, 'G': 0xC7,
    'H': 0xC8, 'I': 0xC9, 'J': 0xD1, 'K': 0xD2, 'L': 0xD3, 'M': 0xD4, 'N': 0xD5,
    'O': 0xD6, 'P': 0xD7, 'Q': 0xD8, 'R': 0xD9, 'S': 0xE2, 'T': 0xE3, 'U': 0xE4,
    'V': 0xE5, 'W': 0xE6, 'X': 0xE7, 'Y': 0xE8, 'Z': 0xE9,
    'a': 0x81, 'b': 0x82, 'c': 0x83, 'd': 0x84, 'e': 0x85, 'f': 0x86, 'g': 0x87,
    'h': 0x88, 'i': 0x89, 'j': 0x91, 'k': 0x92, 'l': 0x93, 'm': 0x94, 'n': 0x95,
    'o': 0x96, 'p': 0x97, 'q': 0x98, 'r': 0x99, 's': 0xA2, 't': 0xA3, 'u': 0xA4,
    'v': 0xA5, 'w': 0xA6, 'x': 0xA7, 'y': 0xA8, 'z': 0xA9,
    '\t': 0x05, '\n': 0x25, '\r': 0x0D
  };
  
  const hexMapping = {
    '000000': '40', '000001': 'C1', '000010': 'C2', '000011': 'C3', '000100': 'C4', 
    '000101': 'C5', '000110': 'C6', '000111': 'C7', '001000': 'C8', '001001': 'C9',
    '001010': '4A', '001011': '4B', '001100': '4C', '001101': '4D', '001110': '4E', 
    '001111': '4F', '010000': '50', '010001': 'D1', '010010': 'D2', '010011': 'D3',
    '010100': 'D4', '010101': 'D5', '010110': 'D6', '010111': 'D7', '011000': 'D8', 
    '011001': 'D9', '011010': '5A', '011011': '5B', '011100': '5C', '011101': '5D', 
    '011110': '5E', '011111': '5F', '100000': '60', '100001': '61', '100010': 'E2', 
    '100011': 'E3', '100100': 'E4', '100101': 'E5', '100110': 'E6', '100111': 'E7',
    '101000': 'E8', '101001': 'E9', '101010': '6A', '101011': '6B', '101100': '6C', 
    '101101': '6D', '101110': '6E', '101111': '6F', '110000': 'F0', '110001': 'F1',
    '110010': 'F2', '110011': 'F3', '110100': 'F4', '110101': 'F5', '110110': 'F6', 
    '110111': 'F7', '111000': 'F8', '111001': 'F9', '111010': '7A', '111011': '7B', 
    '111100': '7C', '111101': '7D', '111110': '7E', '111111': '7F'
  };
  
