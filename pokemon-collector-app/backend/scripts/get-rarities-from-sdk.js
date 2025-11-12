const TCGdex = require('@tcgdex/sdk').default;

async function main() {
  const tcgdex = new TCGdex('en'); 
  const raritiesSet = new Set();

  console.log('Obteniendo todos los sets...');
  const sets = await tcgdex.set.list();
  let totalCards = 0;
  for (const set of sets) {
    const setData = await tcgdex.set.get(set.id);
    const cards = await Promise.all(setData.cards.map(cardResume => cardResume.getCard()));
    totalCards += cards.length;
    for (const card of cards) {
      if (card && card.rarity) {
        raritiesSet.add(card.rarity);
      }
    }
    console.log(`Set ${set.name}: ${cards.length} cartas procesadas.`);
  }

  console.log('\nRarezas únicas encontradas:');
  Array.from(raritiesSet).forEach(rarity => {
    console.log(rarity);
  });
  console.log(`\nTotal de cartas procesadas: ${totalCards}`);
}

main().catch(console.error);

/*
Rare
Uncommon
Common
Rare Holo
None
Ultra Rare
Rare Holo LV.X
Rare PRIME
LEGEND
Secret Rare
Holo Rare V
Holo Rare
Holo Rare VMAX
Amazing Rare
Shiny rare
Shiny rare V
Shiny rare VMAX
Classic Collection
Holo Rare VSTAR
Radiant Rare
Full Art Trainer
Double rare
Illustration rare
Special illustration rare
Hyper rare
Shiny Ultra Rare
ACE SPEC Rare
One Diamond
Two Diamond
Three Diamond
Four Diamond
One Star
Two Star
Three Star
Crown
One Shiny
Two Shiny
Black White Rare
Mega Hyper Rare

*/