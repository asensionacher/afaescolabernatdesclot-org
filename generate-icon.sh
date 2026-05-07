    # 1. Generar icon.webp (512x512 para Next.js)
    convert /home/asensionacher/repos/afaescolabernatdesclot-org/public/logo-small.png -resize 512x512 -background none -gravity center -extent 512x512 src/app/icon.webp
    # 2. Generar apple-icon.webp (180x180 es el tamaño estándar de Apple)
    convert /home/asensionacher/repos/afaescolabernatdesclot-org/public/logo-small.png -resize 180x180 -background none -gravity center -extent 180x180 src/app/apple-icon.webp
    # 3. Generar favicon.ico (32x32 y 16x16 multi-resolución)
    convert /home/asensionacher/repos/afaescolabernatdesclot-org/public/logo-small.png -resize 32x32 -background none -gravity center -extent 32x32 favicon-32.png
    convert /home/asensionacher/repos/afaescolabernatdesclot-org/public/logo-small.png -resize 16x16 -background none -gravity center -extent 16x16 favicon-16.png
    convert favicon-32.png favicon-16.png src/app/favicon.ico
    rm favicon-32.png favicon-16.png
    # 4. Generar logo.webp para el sitio (tamaño original o 800px ancho)
    convert /home/asensionacher/repos/afaescolabernatdesclot-org/public/logo-small.png -resize 800x -background none public/logo.webp
    # 5. También actualizar el favicon en public (por compatibilidad)
    cp src/app/favicon.ico public/favicon.ico