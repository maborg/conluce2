import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as zlib from 'zlib';

interface Societa {
  nome: string;
  percentualeProprieta: number;
  amministratori: string[];
  sindaci: string[];
}

function leggiElencoSocieta(file: string): Societa[] {
  const data = fs.readFileSync(file);
  const decompressedData = zlib.gunzipSync(data);
  const html = decompressedData.toString('utf-8');
  const $ = cheerio.load(html);
  const societa: Societa[] = [];

  $('table tr').each((index, element) => {
    if (index !== 0) {
      const riga = $(element);
      const nome = riga.find('td:nth-child(1)').text().trim();
      const percentualeProprieta = parseFloat(riga.find('td:nth-child(2)').text().trim());
      const amministratori = riga.find('td:nth-child(3)').text().split(',').map((admin) => admin.trim());
      const sindaci = riga.find('td:nth-child(4)').text().split(',').map((sindaco) => sindaco.trim());

      const societaObj: Societa = {
        nome,
        percentualeProprieta,
        amministratori,
        sindaci,
      };

      societa.push(societaObj);
    }
  });

  return societa;
}

function salvaElencoSocietaInJSON(elenco: Societa[], file: string): void {
  const jsonData = JSON.stringify(elenco, null, 2);
  fs.writeFileSync(file, jsonData, 'utf-8');
}

// Esempio di utilizzo
const elencoSocieta = leggiElencoSocieta('azionariato.zip');
salvaElencoSocietaInJSON(elencoSocieta, 'elenco_societa.json');
