# Guia: Com afegir imatges al cos del blog

## Resum
Ara pots afegir imatges dins del contingut dels teus posts del blog, a més de la imatge principal. Aquestes imatges es redimensionaran automàticament per veure's bé en dispositius mòbils i escriptori.

## Com afegir imatges a Sanity Studio

1. **Accedeix a l'Studio**: Ves a `https://tudominio.com/studio` o `http://localhost:3000/studio`

2. **Edita o crea un post**: 
   - Ves a "Blog Posts" al menú lateral
   - Selecciona un post existent o crea'n un de nou

3. **Afegeix una imatge al cos (Body)**:
   - Dins del camp "Body" de qualsevol idioma (Català, Castellà, Anglès, etc.)
   - Col·loca el cursor en una línia nova (prem Enter després d'un paràgraf)
   - Veuràs un botó **"+" (inserir bloc)** al costat esquerre de la línia buida
   - Fes clic al botó "+" 
   - Selecciona **"Imatge"** del menú desplegable
   - Arrossega una imatge o fes clic a "Select" per escollir des del teu ordinador

4. **Configura la imatge**:
   - **Text alternatiu** (OBLIGATORI): Descriu la imatge per a accessibilitat i SEO
     - Exemple: "Estudiants al pati de l'escola durant l'esbarjo"
   - **Peu de foto** (OPCIONAL): Text que apareixerà sota la imatge
     - Exemple: "Alumnes de 3r de primària durant l'activitat de lectura"
   - **Hotspot**: Fes clic a "Edit hotspot" per seleccionar la part més important de la imatge (es centrarà en mòbils)

5. **Publica el post**: Fes clic a "Publish" perquè els canvis siguin visibles al lloc web

## Consells per trobar el botó "+"

- El botó "+" només apareix quan el cursor està en una **línia buida**
- Si no el veus, prem **Enter** després d'un paràgraf per crear una línia nova
- El botó apareix a l'**esquerra** del text, al marge
- També pots utilitzar el shortcut: escriu `/` (barra) i veuràs el menú d'opcions

## Característiques tècniques

- **Redimensionament automàtic**: Les imatges s'ajusten automàticament a l'amplada del contingut
- **Optimització**: Es serveixen en mida màxima de 1200px d'amplada amb qualitat 85%
- **Responsive**: En mòbils ocupen el 100% de l'amplada, en tablets 80%, en escriptori màxim 1200px
- **SEO friendly**: El text alternatiu millora el posicionament als cercadors
- **Accessibilitat**: Lectors de pantalla poden descriure les imatges gràcies al text alternatiu

## Exemple d'ús

```
[Paràgraf de text del blog...]

[IMATGE: Foto de l'esdeveniment amb descripció "Esdeveniment anual de l'AFA 2025"]

[Més text del blog...]
```

## Notes importants

- ✅ Sempre afegeix text alternatiu descriptiu
- ✅ Utilitza imatges de bona qualitat (mínim 1200px d'amplada)
- ✅ Formats recomanats: JPG per a fotos, PNG per a gràfics amb transparència
- ⚠️ Les imatges molt grans s'optimitzaran automàticament
- ⚠️ El peu de foto és opcional, però ajuda a donar context

## Solució de problemes

**No veig el botó "+"**: 
- Assegura't que el cursor està en una línia buida (prem Enter)
- Prova a escriure `/` (barra) per veure el menú d'opcions

**La imatge no apareix**: 
- Verifica que hagis publicat el post després d'afegir la imatge
- Assegura't que el text alternatiu estigui complet

**La imatge es veu pixelada**: 
- Puja una imatge de major resolució (mínim 1200px d'amplada)

**Vull canviar la imatge**: 
- A l'Studio, fes clic a la imatge i selecciona "Remove" per eliminar-la
- Després afegeix una nova imatge seguint els passos anteriors
