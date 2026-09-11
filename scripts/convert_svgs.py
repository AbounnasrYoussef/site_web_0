#!/usr/bin/env python3
import os
import sys
import re
import xml.etree.ElementTree as ET

def to_pascal_case(name: str) -> str:
    """Convert snake_case or kebab-case to PascalCase."""
    return ''.join(word.capitalize() for word in re.split(r'[-_]', name))

def has_complex_colors(root: ET.Element) -> bool:
    """Check if SVG uses gradients, filters, or URL fills (e.g., Google icons)."""
    for elem in root.iter():
        # Detect gradient definitions
        if 'linearGradient' in elem.tag or 'radialGradient' in elem.tag:
            return True
        # Detect URL references in fill/stroke
        if 'url(' in elem.attrib.get('fill', '') or 'url(' in elem.attrib.get('stroke', ''):
            return True
    return False

def make_monochromatic(root: ET.Element) -> None:
    """Intelligently convert shapes to currentColor based on whether they are outline or filled."""
    shape_tags = ['path', 'rect', 'circle', 'polygon', 'ellipse', 'line']
    for elem in root.iter():
        if elem.tag == 'svg':
            continue
        if elem.tag in shape_tags:
            has_stroke = 'stroke' in elem.attrib
            current_fill = elem.attrib.get('fill', '')
            
            # Determine if this element is intended to be an "outline"
            # (it has a stroke, and either no fill or fill="none")
            is_outline = has_stroke and (current_fill == '' or current_fill == 'none')
            
            if is_outline:
                # Preserve it as a pure outline
                elem.attrib['fill'] = 'none'
                elem.attrib['stroke'] = 'currentColor'
            else:
                # Treat it as a solid filled shape
                elem.attrib['fill'] = 'currentColor'
                if has_stroke:
                    elem.attrib['stroke'] = 'currentColor'

def extract_viewbox(raw_content: str) -> str:
    """Extract viewBox from raw SVG string. Fallback to width/height or default."""
    viewbox_match = re.search(r'viewBox="([^"]+)"', raw_content)
    if viewbox_match:
        return viewbox_match.group(1)
    
    width_match = re.search(r'width="([^"]+)"', raw_content)
    height_match = re.search(r'height="([^"]+)"', raw_content)
    if width_match and height_match:
        return f"0 0 {width_match.group(1)} {height_match.group(1)}"
    
    return "0 0 24 24"

def get_unique_filename(file_path: str) -> str:
    """Append (1), (2), ... if the file already exists."""
    if not os.path.exists(file_path):
        return file_path
    base, ext = os.path.splitext(file_path)
    counter = 1
    while os.path.exists(f"{base} ({counter}){ext}"):
        counter += 1
    return f"{base} ({counter}){ext}"

def fix_react_attributes(tsx_content: str) -> str:
    """Convert kebab-case SVG attributes to camelCase for React compatibility."""
    replacements = {
        'stroke-width="': 'strokeWidth="',
        'stroke-linecap="': 'strokeLinecap="',
        'stroke-linejoin="': 'strokeLinejoin="',
        'stroke-opacity="': 'strokeOpacity="',
        'fill-rule="': 'fillRule="',
        'clip-rule="': 'clipRule="',
        'xmlns:xlink="': 'xmlnsXlink="',
    }
    for old, new in replacements.items():
        tsx_content = tsx_content.replace(old, new)
    return tsx_content

def convert_svg_to_tsx(svg_path: str, output_path: str) -> None:
    with open(svg_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    # Get viewBox directly from the raw string
    viewbox = extract_viewbox(raw_content)
    
    # Remove xmlns to avoid namespace pollution
    stripped_content = re.sub(r'xmlns="[^"]+"', '', raw_content)
    
    # Parse into ElementTree
    root = ET.fromstring(stripped_content)
    
    # Determine if this is a complex icon (gradients/urls) or a simple mono icon
    is_complex = has_complex_colors(root)
    
    # Transform tags only if it is NOT complex
    if not is_complex:
        make_monochromatic(root)
    
    # Extract the inner children as strings (without the root <svg> tag)
    inner_elements = []
    for child in root:
        child_str = ET.tostring(child, encoding='unicode')
        # Remove any leftover namespace declarations from children
        child_str = re.sub(r'xmlns="[^"]+"', '', child_str)
        inner_elements.append(child_str)
    
    inner_content = "\n      ".join(inner_elements)
    
    # Determine component name
    base_name = os.path.splitext(os.path.basename(svg_path))[0]
    component_name = to_pascal_case(base_name) + "Icon"
    
    # Decide whether to add 'fill="none"' to the root <svg> (only for simple icons)
    fill_attr = 'fill="none"' if not is_complex else ""

    # Build TSX content with exact spacing matching your examples
    tsx_content = f"""import * as React from 'react'

export default function {component_name}(
  props: React.SVGProps<SVGSVGElement>
) {{
  return (
    <svg
      viewBox="{viewbox}"
      xmlns="http://www.w3.org/2000/svg"
      {fill_attr}
      {{...props}}
    >
      {inner_content}
    </svg>
  )
}}
"""
    # Fix all kebab-case attributes for React
    tsx_content = fix_react_attributes(tsx_content)

    # Write the result
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(tsx_content)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python convert_svgs.py file1.svg file2.svg ...")
        print("Example: python convert_svgs.py *.svg")
        sys.exit(1)

    for arg in sys.argv[1:]:
        if not arg.lower().endswith('.svg'):
            print(f"Skipping non-SVG file: {arg}")
            continue
        
        try:
            # Generate the output filename
            base_name = os.path.splitext(os.path.basename(arg))[0]
            output_name = to_pascal_case(base_name) + "Icon.tsx"
            output_dir = os.path.dirname(arg)
            output_path = get_unique_filename(os.path.join(output_dir, output_name))
            
            convert_svg_to_tsx(arg, output_path)
            print(f"✅ Converted: {arg} -> {output_path}")
        except Exception as e:
            print(f"❌ Error processing {arg}: {e}")