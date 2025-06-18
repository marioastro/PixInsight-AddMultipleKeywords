# AddMultipleKeywords — Batch FITS Keyword Editor for PixInsight

## Introduzione

AddMultipleKeywords è uno script per PixInsight che permette di inserire e modificare in batch keyword FITS personalizzate su immagini `.fits` e `.xisf`.

Grazie a un'interfaccia grafica intuitiva, è possibile visualizzare l’anteprima dei metadati, gestire preset e validare i valori delle keyword (ad esempio il formato ISO per `DATE-OBS`).

---

## Funzionalità principali

- Modifica e inserimento batch di keyword FITS personalizzate
- Supporto per immagini `.fits` e `.xisf`
- Interfaccia grafica con anteprima metadati
- Salvataggio e caricamento di preset keyword
- Validazione dei campi (es. formato ISO 8601 per `DATE-OBS`)
- Log delle operazioni e salvataggio diretto nei file

---

## Requisiti

- PixInsight versione 1.8.9 o superiore
- Immagini in formato `.fits` o `.xisf`

---

## Installazione

1. Apri PixInsight
2. Vai su:  
   `Resources > Updates > Manage Repositories > Add`
3. Inserisci il seguente URL del repository:  
   `https://raw.githubusercontent.com/marioastro/PixInsight-AddMultipleKeywords/main/`
4. Conferma e torna su:  
   `Resources > Updates > Check for Updates`
5. Installa lo script dalla lista

---

## Uso

1. Avvia lo script da:  
   `Script > Utilities > Add Multiple Keywords`
2. Seleziona la cartella contenente i file `.fits` o `.xisf`
3. Visualizza l’anteprima delle keyword del primo file
4. Aggiungi/modifica keyword personalizzate o usa preset salvati
5. Salva o carica preset per riutilizzo
6. Clicca "Apply to All Files" per applicare le modifiche

---

## Esempio pratico

Supponiamo di voler aggiungere la keyword `OBSERVER` con valore `Mario Sandri` a tutte le immagini di una cartella:

- Seleziona la cartella contenente le immagini
- Clicca “+ Add Keyword”
- Inserisci `OBSERVER` nel campo nome e `Mario Sandri` nel valore
- Premi “Apply to All Files”

---

## Contatti e supporto

- Autore: Mario Sandri  
- Sito web: [https://www.astronomiavallidelnoce.it](https://www.astronomiavallidelnoce.it)  
- Repository GitHub: [https://github.com/marioastro/PixInsight-AddMultipleKeywords](https://github.com/marioastro/PixInsight-AddMultipleKeywords)  
- Forum PixInsight e mailing list ufficiale

---

*Grazie per l'attenzione e buon lavoro con PixInsight!*

