import urllib.request
import re
from collections import Counter

try:
    req = urllib.request.Request(
        'https://www.mictech.edu.in/',
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')
    colors = re.findall(r'#[0-9a-fA-F]{6}', html)
    print('Colors:', Counter(colors).most_common(20))
    
    fonts = re.findall(r'family=([^&''""]+)', html)
    print('Fonts:', set(fonts))
except Exception as e:
    print(e)
