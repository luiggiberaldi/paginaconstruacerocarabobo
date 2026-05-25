import fs from 'fs';
import path from 'path';

const source = "C:\\Users\\luigg\\.gemini\\antigravity\\brain\\2a7237e1-2400-4675-b214-4ac7f8541912\\hero_steel_shot_1779638549323.png";
const dest = "c:\\Users\\luigg\\Desktop\\URO\\con worker 4000lines\\pagina-construacero\\public\\assets\\hero_steel_shot.png";

try {
  // Ensure the destination folder exists
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy the file
  fs.copyFileSync(source, dest);
  console.log('✅ Success! Image copied successfully from', source, 'to', dest);
} catch (err) {
  console.error('❌ Failed to copy image:', err);
}
