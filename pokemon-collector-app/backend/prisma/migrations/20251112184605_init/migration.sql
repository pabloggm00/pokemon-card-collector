-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateTable
CREATE TABLE "series" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sets" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "apiId" TEXT,
    "seriesId" INTEGER NOT NULL,
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "totalCards" INTEGER NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "symbolUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rarities" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "colorHex" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rarities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cards" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "name" CITEXT NOT NULL,
    "setId" INTEGER NOT NULL,
    "rarityId" INTEGER NOT NULL,
    "cardType" TEXT NOT NULL,
    "subtype" TEXT,
    "pokemonType" TEXT,
    "imageUrl" TEXT,
    "largeImageUrl" TEXT,
    "artist" TEXT,
    "hasNormalVariant" BOOLEAN NOT NULL DEFAULT false,
    "hasReverseVariant" BOOLEAN NOT NULL DEFAULT false,
    "hasHoloVariant" BOOLEAN NOT NULL DEFAULT false,
    "hasFirstEditionVariant" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collections" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SET',
    "setId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_cards" (
    "id" SERIAL NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "cardId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "ownedNormal" BOOLEAN NOT NULL DEFAULT false,
    "ownedReverse" BOOLEAN NOT NULL DEFAULT false,
    "ownedHolo" BOOLEAN NOT NULL DEFAULT false,
    "ownedFirstEdition" BOOLEAN NOT NULL DEFAULT false,
    "condition" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "series_code_key" ON "series"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sets_code_key" ON "sets"("code");

-- CreateIndex
CREATE UNIQUE INDEX "sets_apiId_key" ON "sets"("apiId");

-- CreateIndex
CREATE UNIQUE INDEX "rarities_code_key" ON "rarities"("code");

-- CreateIndex
CREATE INDEX "cards_name_idx" ON "cards"("name");

-- CreateIndex
CREATE INDEX "cards_setId_idx" ON "cards"("setId");

-- CreateIndex
CREATE INDEX "cards_rarityId_idx" ON "cards"("rarityId");

-- CreateIndex
CREATE UNIQUE INDEX "cards_setId_number_key" ON "cards"("setId", "number");

-- CreateIndex
CREATE INDEX "collection_cards_collectionId_idx" ON "collection_cards"("collectionId");

-- CreateIndex
CREATE INDEX "collection_cards_cardId_idx" ON "collection_cards"("cardId");

-- CreateIndex
CREATE UNIQUE INDEX "collection_cards_collectionId_cardId_key" ON "collection_cards"("collectionId", "cardId");

-- AddForeignKey
ALTER TABLE "sets" ADD CONSTRAINT "sets_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_setId_fkey" FOREIGN KEY ("setId") REFERENCES "sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cards" ADD CONSTRAINT "cards_rarityId_fkey" FOREIGN KEY ("rarityId") REFERENCES "rarities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collections" ADD CONSTRAINT "collections_setId_fkey" FOREIGN KEY ("setId") REFERENCES "sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_cards" ADD CONSTRAINT "collection_cards_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_cards" ADD CONSTRAINT "collection_cards_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
