import * as admin from "firebase-admin";
import {apiServiceFactory} from "./api";
import {triggerMarketItemEntryFactory} from "./contributors";
import {triggerSendApplicantEmailFactory} from "./email";
import {historicalCloudFunctionsGenerator} from "./historical";

admin.initializeApp();
const firestore = admin.firestore();


const historicalCurrencyExchangeNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Currency Exchange"
);
const historicalEngravingRecipeNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Engraving Recipe"
);
const historicalEnhancementMaterialNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Enhancement Material"
);
const historicalTraderNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Trader"
);
const historicalCombatSuppliesNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Combat Supplies"
);
const historicalAdventurersTomeNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Adventurer's Tome"
);
const historicalCookingNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Cooking"
);
const historicalGemChestNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Gem Chest"
);
const historicalMountNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Mount"
);
const historicalPetsNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Pets"
);
const historicalSailingNAE = historicalCloudFunctionsGenerator(
    firestore,
    "North America East",
    "Sailing"
);

const historicalCurrencyExchangeNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Currency Exchange"
);
const historicalEngravingRecipeNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Engraving Recipe"
);
const historicalEnhancementMaterialNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Enhancement Material"
);
const historicalTraderNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Trader"
);
const historicalCombatSuppliesNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Combat Supplies"
);
const historicalAdventurersTomeNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Adventurer's Tome"
);
const historicalCookingNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Cooking"
);
const historicalGemChestNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Gem Chest"
);
const historicalMountNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Mount"
);
const historicalPetsNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Pets"
);
const historicalSailingNAW = historicalCloudFunctionsGenerator(
    firestore,
    "North America West",
    "Sailing"
);

const historicalCurrencyExchangeEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Currency Exchange"
);
const historicalEngravingRecipeEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Engraving Recipe"
);
const historicalEnhancementMaterialEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Enhancement Material"
);
const historicalTraderEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Trader"
);
const historicalCombatSuppliesEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Combat Supplies"
);
const historicalAdventurersTomeEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Adventurer's Tome"
);
const historicalCookingEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Cooking"
);
const historicalGemChestEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Gem Chest"
);
const historicalMountEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Mount"
);
const historicalPetsEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Pets"
);
const historicalSailingEUC = historicalCloudFunctionsGenerator(
    firestore,
    "Europe Central",
    "Sailing"
);

const historicalCurrencyExchangeEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Currency Exchange"
);
const historicalEngravingRecipeEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Engraving Recipe"
);
const historicalEnhancementMaterialEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Enhancement Material"
);
const historicalTraderEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Trader"
);
const historicalCombatSuppliesEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Combat Supplies"
);
const historicalAdventurersTomeEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Adventurer's Tome"
);
const historicalCookingEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Cooking"
);
const historicalGemChestEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Gem Chest"
);
const historicalMountEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Mount"
);
const historicalPetsEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Pets"
);
const historicalSailingEUW = historicalCloudFunctionsGenerator(
    firestore,
    "Europe West",
    "Sailing"
);

const historicalCurrencyExchangeSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Currency Exchange"
);
const historicalEngravingRecipeSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Engraving Recipe"
);
const historicalEnhancementMaterialSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Enhancement Material"
);
const historicalTraderSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Trader"
);
const historicalCombatSuppliesSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Combat Supplies"
);
const historicalAdventurersTomeSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Adventurer's Tome"
);
const historicalCookingSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Cooking"
);
const historicalGemChestSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Gem Chest"
);
const historicalMountSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Mount"
);
const historicalPetsSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Pets"
);
const historicalSailingSA = historicalCloudFunctionsGenerator(
    firestore,
    "South America",
    "Sailing"
);

const triggerSendApplicantEmail = triggerSendApplicantEmailFactory(firestore);

const apiService = apiServiceFactory(firestore);

const triggerMarketItemEntry = triggerMarketItemEntryFactory(firestore);

export {
  triggerSendApplicantEmail,
  apiService,
  triggerMarketItemEntry,
  historicalCurrencyExchangeNAE,
  historicalEngravingRecipeNAE,
  historicalEnhancementMaterialNAE,
  historicalTraderNAE,
  historicalCombatSuppliesNAE,
  historicalAdventurersTomeNAE,
  historicalCookingNAE,
  historicalGemChestNAE,
  historicalMountNAE,
  historicalPetsNAE,
  historicalSailingNAE,
  historicalCurrencyExchangeNAW,
  historicalEngravingRecipeNAW,
  historicalEnhancementMaterialNAW,
  historicalTraderNAW,
  historicalCombatSuppliesNAW,
  historicalAdventurersTomeNAW,
  historicalCookingNAW,
  historicalGemChestNAW,
  historicalMountNAW,
  historicalPetsNAW,
  historicalSailingNAW,
  historicalCurrencyExchangeEUC,
  historicalEngravingRecipeEUC,
  historicalEnhancementMaterialEUC,
  historicalTraderEUC,
  historicalCombatSuppliesEUC,
  historicalAdventurersTomeEUC,
  historicalCookingEUC,
  historicalGemChestEUC,
  historicalMountEUC,
  historicalPetsEUC,
  historicalSailingEUC,
  historicalCurrencyExchangeEUW,
  historicalEngravingRecipeEUW,
  historicalEnhancementMaterialEUW,
  historicalTraderEUW,
  historicalCombatSuppliesEUW,
  historicalAdventurersTomeEUW,
  historicalCookingEUW,
  historicalGemChestEUW,
  historicalMountEUW,
  historicalPetsEUW,
  historicalSailingEUW,
  historicalCurrencyExchangeSA,
  historicalEngravingRecipeSA,
  historicalEnhancementMaterialSA,
  historicalTraderSA,
  historicalCombatSuppliesSA,
  historicalAdventurersTomeSA,
  historicalCookingSA,
  historicalGemChestSA,
  historicalMountSA,
  historicalPetsSA,
  historicalSailingSA,
};
