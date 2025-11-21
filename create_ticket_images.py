"""
Create placeholder lottery ticket design images for the comparison survey
"""
from PIL import Image, ImageDraw, ImageFont
import os

# Create directory for images if it doesn't exist
os.makedirs('config/media', exist_ok=True)

# Design A: Classic Luxury (Gold and Black)
def create_design_a():
    # Create image with gold background
    width, height = 800, 500
    img = Image.new('RGB', (width, height), color='#000000')  # Black background
    draw = ImageDraw.Draw(img)

    # Draw gold border
    border_width = 20
    draw.rectangle(
        [(border_width, border_width), (width - border_width, height - border_width)],
        outline='#FFD700',
        width=border_width
    )

    # Draw inner gold rectangle
    draw.rectangle(
        [(60, 60), (width - 60, height - 60)],
        fill='#FFD700'
    )

    # Try to use a font, fall back to default if not available
    try:
        title_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf', 72)
        subtitle_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman.ttf', 36)
        tagline_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf', 28)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        tagline_font = ImageFont.load_default()

    # Add title text
    title = "GOLDEN FORTUNE"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 120), title, fill='#000000', font=title_font)

    # Add price
    price = "$10"
    price_bbox = draw.textbbox((0, 0), price, font=subtitle_font)
    price_width = price_bbox[2] - price_bbox[0]
    price_x = (width - price_width) // 2
    draw.text((price_x, 220), price, fill='#8B4513', font=subtitle_font)

    # Add tagline
    tagline = "Discover Your Fortune"
    tagline_bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    tagline_x = (width - tagline_width) // 2
    draw.text((tagline_x, 280), tagline, fill='#000000', font=tagline_font)

    # Add prize info
    prize = "TOP PRIZE: $1,000,000"
    prize_bbox = draw.textbbox((0, 0), prize, font=tagline_font)
    prize_width = prize_bbox[2] - prize_bbox[0]
    prize_x = (width - prize_width) // 2
    draw.text((prize_x, 360), prize, fill='#8B0000', font=tagline_font)

    # Draw decorative coins (circles)
    for i in range(3):
        x = 150 + i * 200
        draw.ellipse([(x - 30, 420), (x + 30, 480)], fill='#DAA520', outline='#000000', width=3)

    # Save image
    img.save('config/media/design_a_classic_luxury.png')
    print("✓ Created Design A: Classic Luxury (config/media/design_a_classic_luxury.png)")

# Design B: Modern Glamour (Silver and Charcoal)
def create_design_b():
    # Create image with charcoal background
    width, height = 800, 500
    img = Image.new('RGB', (width, height), color='#1E1E1E')  # Charcoal background
    draw = ImageDraw.Draw(img)

    # Draw silver border
    border_width = 20
    draw.rectangle(
        [(border_width, border_width), (width - border_width, height - border_width)],
        outline='#C0C0C0',
        width=border_width
    )

    # Draw inner silver rectangle with gradient effect
    draw.rectangle(
        [(60, 60), (width - 60, height - 60)],
        fill='#E8E8E8'
    )

    # Try to use a font, fall back to default if not available
    try:
        title_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 72)
        subtitle_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 36)
        tagline_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf', 28)
    except:
        try:
            title_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 72)
            subtitle_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 36)
            tagline_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 28)
        except:
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
            tagline_font = ImageFont.load_default()

    # Add title text
    title = "GOLDEN FORTUNE"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    draw.text((title_x, 120), title, fill='#1E1E1E', font=title_font)

    # Add price
    price = "$10"
    price_bbox = draw.textbbox((0, 0), price, font=subtitle_font)
    price_width = price_bbox[2] - price_bbox[0]
    price_x = (width - price_width) // 2
    draw.text((price_x, 220), price, fill='#4A4A4A', font=subtitle_font)

    # Add tagline
    tagline = "Shine With Fortune"
    tagline_bbox = draw.textbbox((0, 0), tagline, font=tagline_font)
    tagline_width = tagline_bbox[2] - tagline_bbox[0]
    tagline_x = (width - tagline_width) // 2
    draw.text((tagline_x, 280), tagline, fill='#1E1E1E', font=tagline_font)

    # Add prize info
    prize = "TOP PRIZE: $1,000,000"
    prize_bbox = draw.textbbox((0, 0), prize, font=tagline_font)
    prize_width = prize_bbox[2] - prize_bbox[0]
    prize_x = (width - prize_width) // 2
    draw.text((prize_x, 360), prize, fill='#8B0000', font=tagline_font)

    # Draw decorative diamonds (rotated squares)
    for i in range(3):
        x = 150 + i * 200
        y = 450
        size = 25
        points = [
            (x, y - size),
            (x + size, y),
            (x, y + size),
            (x - size, y)
        ]
        draw.polygon(points, fill='#00CED1', outline='#1E1E1E', width=2)

    # Save image
    img.save('config/media/design_b_modern_glamour.png')
    print("✓ Created Design B: Modern Glamour (config/media/design_b_modern_glamour.png)")

if __name__ == '__main__':
    create_design_a()
    create_design_b()
    print("\n✓ Both lottery ticket design images created successfully!")
    print("  - Design A: config/media/design_a_classic_luxury.png")
    print("  - Design B: config/media/design_b_modern_glamour.png")
