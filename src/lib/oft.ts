import { RPC_LIST } from "./bridges";

const FETCH_HEADERS: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };
const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const BALANCE_OF_SELECTOR = "0x70a08231";

function fetchWithTimeout(url: string, opts?: RequestInit, ms = 5000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

// CSV chain name → our RPC key
const CSV_CHAIN_MAP: Record<string, string> = {
  ETH: "ethereum",
  BASE: "base",
  ARBI: "arbitrum",
  OP: "optimism",
  MATIC: "polygon",
  CELO: "celo",
  SCROLL: "scroll",
  MODE: "mode",
};

// LZ chain name → our RPC key
const LZ_CHAIN_MAP: Record<string, string> = {
  ethereum: "ethereum",
  arbitrum: "arbitrum",
  base: "base",
  optimism: "optimism",
  polygon: "polygon",
  bsc: "bnb",
  scroll: "scroll",
  mode: "mode",
  celo: "celo",
  mantle: "mantle",
  avalanche: "avalanche",
  ink: "ink",
  hyperliquid: "hyperevm",
  blast: "blast",
  linea: "linea",
  zksync: "zksync",
  fraxtal: "fraxtal",
  manta: "manta",
  metis: "metis",
  kava: "kava",
  zircuit: "zircuit",
  swell: "swell",
  morph: "morph",
  sei: "sei",
  bera: "berachain",
  worldchain: "worldchain",
  unichain: "unichain",
};

function getRpcs(rpcKey: string): string[] | null {
  return RPC_LIST[rpcKey] ?? null;
}

interface Destination {
  chain: string;
  address: string;
  decimals: number;
  type?: "evm" | "solana";
}

interface AdapterConfig {
  chain: string;
  symbol: string;
  name: string;
  tokenAddress: string;
  adapterAddress: string;
  decimals: number;
  sourceType?: "solana";
  destinations: Destination[];
}

// Hardcoded adapter config: source chain, token, adapter, and all OFT destinations
const ADAPTERS: AdapterConfig[] = [
  { chain: "BASE", symbol: "PORTAL", name: "Portal", tokenAddress: "0x0ffebc403f2d3dd9ea5501ca03916e98967acb2d", adapterAddress: "0x6d6bf0f1568Bb44Ec7F93Ac50c49db13A107a5f3", decimals: 18, destinations: [] },
  { chain: "ETH", symbol: "MAVIA", name: "Mavia", tokenAddress: "0x24fcfc492c1393274b6bcd568ac9e225bec93584", adapterAddress: "0xE6C2B672B3eB64A1F460AdcD9676a3B6c67abD4D", decimals: 18, destinations: [
    { chain: "base", address: "0x24fcfc492c1393274b6bcd568ac9e225bec93584", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "UB", name: "UB", tokenAddress: "0x6944e1df6bf5972305f9ab25df47ef10de01bcc8", adapterAddress: "0xaFc34e2eD3037D5d52209Ed27A93d6df46C07C35", decimals: 18, destinations: [
    { chain: "bsc", address: "0x40b8129b786d766267a7a118cf8c07e31cdb6fde", decimals: 18 },
    { chain: "base", address: "0x51d9eef6d49e2782f99d43f659d4f0cb493c28cc", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ACU", name: "ACU", tokenAddress: "0x216b3643ff8b7bb30d8a48e9f1bd550126202add", adapterAddress: "0x4aD11F4D6b4626E426fBE88e8F1c78F469cA33bE", decimals: 18, destinations: [
    { chain: "base", address: "0xc5fed7c8ccc75d8a72b601a66dffd7a489073f0b", decimals: 18 },
    { chain: "bsc", address: "0x6ef2ffb38d64afe18ce782da280b300e358cfeaf", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "SIGN", name: "Sign", tokenAddress: "0x868fced65edbf0056c4163515dd840e9f287a4c3", adapterAddress: "0x3a0E6B220897d3Bf7E015c1973510e0F4BB576A9", decimals: 18, destinations: [
    { chain: "base", address: "0x868fced65edbf0056c4163515dd840e9f287a4c3", decimals: 18 },
    { chain: "bsc", address: "0x868fced65edbf0056c4163515dd840e9f287a4c3", decimals: 18 },
    { chain: "hyperliquid", address: "0xcf182b861e6ee812c215d1b9dce01b131110bf93", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "DAM", name: "Reservoir", tokenAddress: "0x0fedba9178b70e8b54e2af08ebffcf28a1e5a43b", adapterAddress: "0x40a341B76A766C56F54985285987Dfe52fEA237a", decimals: 18, destinations: [
    { chain: "bsc", address: "0xf9ca3fe094212ffa705742d3626a8ab96aababf8", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "TST", name: "TST", tokenAddress: "0x0828096494ad6252f0f853abfc5b6ec9dfe9fdad", adapterAddress: "0x93AD6C8B3a273E0B4aeeBd6CF03422C885217D3B", decimals: 18, destinations: [
    { chain: "bsc", address: "0x93ad6c8b3a273e0b4aeebd6cf03422c885217d3b", decimals: 18 },
    { chain: "polygon", address: "0x93ad6c8b3a273e0b4aeebd6cf03422c885217d3b", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "OPEN", name: "OPEN", tokenAddress: "0xa227cc36938f0c9e09ce0e64dfab226cad739447", adapterAddress: "0xb548A9D3E8A3fbd821BD52fB915d752BDc8Cf679", decimals: 18, destinations: [
    { chain: "bsc", address: "0xa227cc36938f0c9e09ce0e64dfab226cad739447", decimals: 18 },
  ] },
  { chain: "SOL", symbol: "AVA", name: "AVA", tokenAddress: "DKu9kykSfbN5LBfFXtNNDPaX35o4Fv6vJ9FKk7pZpump", adapterAddress: "JAVgARheZkMmEK9zLYrx6edVH1bF6EXJTTxvd6WTubJj", decimals: 6, sourceType: "solana", destinations: [
    { chain: "base", address: "0x80ca9edce4583b8043351a1046f18244b24ef869", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "C", name: "Chainbase", tokenAddress: "0xba12bc7b210e61e5d3110b997a63ea216e0e18f7", adapterAddress: "0x3AdE69D08aC3C7c0Cc3654eeEDbE899f109f7181", decimals: 18, destinations: [
    { chain: "bsc", address: "0xc32cc70741c3a8433dcbcb5ade071c299b55ffc8", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "SIDUS", name: "SIDUS", tokenAddress: "0x549020a9cb845220d66d3e9c6d9f9ef61c981102", adapterAddress: "0xDC402b5Bb2725F8761C600aaD79f06085Fa5fBc4", decimals: 18, destinations: [
    { chain: "bsc", address: "0xe62b7c22484f8b031930275d31f42b9a517fe038", decimals: 18 },
    { chain: "base", address: "0x34be5b8c30ee4fde069dc878989686abe9884470", decimals: 18 },
    { chain: "linea", address: "0xd96536b77ae5500fe850add2253bcf640e7824c1", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "VIRTUAL", name: "Virtuals Protocol", tokenAddress: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b", adapterAddress: "0xA5A1AFbfF720f79f1f7833aAfBdcEe87770BbC93", decimals: 18, destinations: [
    { chain: "solana", address: "3iQL8BFS2vE7mww4ehAqQHAsbmRNCrPxizWAT2Zfyr9y", decimals: 9, type: "solana" },
  ] },
  { chain: "ETH", symbol: "SWELL", name: "SWELL", tokenAddress: "0x0a6e7ba5042b38349e437ec6db6214aec7b35676", adapterAddress: "0x09341022ea237a4DB1644DE7CCf8FA0e489D85B7", decimals: 18, destinations: [
    { chain: "swell", address: "0x2826D136F5630adA89C1678b64A61620Aab77Aea", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "COMMON", name: "COMMON", tokenAddress: "0x4c87da04887a1f9f21f777e3a8dd55c3c9f84701", adapterAddress: "0x6426D675885b2d1D8b3c7c582D0ABD33d3433f64", decimals: 18, destinations: [
    { chain: "bsc", address: "0xa43ca4e5abdf9917eade63c2837eeee321897dad", decimals: 18 },
    { chain: "solana", address: "H1MHqq1dsExxeuYTd8JZzM51z33RvxjuM5sx2oB11WJ", decimals: 9, type: "solana" },
  ] },
  { chain: "ETH", symbol: "ALMANAK", name: "ALMANAK", tokenAddress: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", adapterAddress: "0xCD291a8B325E6aDb423a5F72E1Bc67de9d19256E", decimals: 18, destinations: [
    { chain: "bsc", address: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", decimals: 18 },
    { chain: "arbitrum", address: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", decimals: 18 },
    { chain: "base", address: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", decimals: 18 },
    { chain: "mantle", address: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "LBTC", name: "Lombard", tokenAddress: "0x8236a87084f8b84306f72007f36f2618a5634494", adapterAddress: "0xacB11Bc20B1945e59976e3307d2a805Faa126C31", decimals: 8, destinations: [
    { chain: "morph", address: "0x2e1871fc8ac793dcf2a74ce004ee21d913763565", decimals: 8 },
    { chain: "bera", address: "0x630e12d53d4e041b8c5451ad035ea841e08391d7", decimals: 8 },
  ] },
  { chain: "ETH", symbol: "TRVL", name: "TRVL", tokenAddress: "0xd47bdf574b4f76210ed503e0efe81b58aa061f3d", adapterAddress: "0x74aa9bB52B36a378a6E641B86d7acb76Dc9b3940", decimals: 18, destinations: [
    { chain: "base", address: "0x74aa9bb52b36a378a6e641b86d7acb76dc9b3940", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "OPG", name: "OPG", tokenAddress: "0xfbc2051ae2265686a469421b2c5a2d5462fbf5eb", adapterAddress: "0xacd4d6f4Ea54045e4cA21E23AE423700D95aEAA2", decimals: 18, destinations: [
    { chain: "bsc", address: "0x5feccd17c393caf1001d18164236a37e731fcb9d", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "MON", name: "Mon Protocol", tokenAddress: "0xc555d625828c4527d477e595ff1dd5801b4a600e", adapterAddress: "0x3c4A6a026B6545D06ca1Bc1111EF900942F826a9", decimals: 18, destinations: [
    { chain: "arbitrum", address: "0xfc87d55bc8bf441abfc24d04b2068a8f77bcfcc0", decimals: 18 },
    { chain: "base", address: "0xfc87d55bc8bf441abfc24d04b2068a8f77bcfcc0", decimals: 18 },
    { chain: "avalanche", address: "0xfc87d55bc8bf441abfc24d04b2068a8f77bcfcc0", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "PUFFER", name: "Puffer", tokenAddress: "0x4d1c297d39c5c1277964d0e3f8aa901493664530", adapterAddress: "0x3Ea9bb9fcDCC1C37cB09175aecdb488A97EDd83F", decimals: 18, destinations: [
    { chain: "base", address: "0x8da0bae597ac15fb0924713b1e3c1f624474f3e4", decimals: 18 },
    { chain: "bsc", address: "0x87d00066cf131ff54b72b134a217d5401e5392b6", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ILV", name: "ILV", tokenAddress: "0x767fe9edc9e0df98e07454847909b5e959d7ca0e", adapterAddress: "0xe66d89731986F0647bC0367C3cd1aA23368527A1", decimals: 18, destinations: [
    { chain: "base", address: "0xe66d89731986f0647bc0367c3cd1aa23368527a1", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ZRC", name: "Zircuit", tokenAddress: "0xfd418e42783382e86ae91e445406600ba144d162", adapterAddress: "0xB5EB63caAd0ca6e068114C42794AdA9B7757ebC1", decimals: 18, destinations: [
    { chain: "bsc", address: "0xdac991621fd8048d9f235324780abd6c3ad26421", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ENSO", name: "ENSO", tokenAddress: "0x699f088b5dddcafb7c4824db5b10b57b37cb0c66", adapterAddress: "0xB945577aC2aA9a602cA116C78e3a6B9e5315DD56", decimals: 18, destinations: [
    { chain: "bsc", address: "0xfeb339236d25d3e415f280189bc7c2fbab6ae9ef", decimals: 18 },
    { chain: "base", address: "0xfeb339236d25d3e415f280189bc7c2fbab6ae9ef", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "OL", name: "OPENLOOT", tokenAddress: "0x1f57da732a77636d913c9a75d685b26cc85dcc3a", adapterAddress: "0x3f160760535Eb715d5809a26cF55408A2d9844c1", decimals: 18, destinations: [
    { chain: "bsc", address: "0x3f160760535eb715d5809a26cf55408a2d9844c1", decimals: 18 },
    { chain: "base", address: "0x2e9604e0bc78f57313c31c70ce23cace3eac9523", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "TRIA", name: "TRIA", tokenAddress: "0x228bec415ade4b61d7caf0adf8c91eac587ba369", adapterAddress: "0xF1df8aA0B7955B23b10d80193A412AC5650D4791", decimals: 18, destinations: [
    { chain: "bsc", address: "0xb0b92de23baa85fb06208277e925ced53edab482", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "SCOR", name: "SCOR", tokenAddress: "0xd67ec255100ef200a439d09ff865fbaa2ad9c730", adapterAddress: "0xa58D58839a547cb21FB59cb5dA8c926dfb1E6842", decimals: 18, destinations: [
    { chain: "mantle", address: "0x8ddb986b11c039a6cc1dbcabd62bae911b348f33", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ZAMA", name: "ZAMA", tokenAddress: "0xa12cc123ba206d4031d1c7f6223d1c2ec249f4f3", adapterAddress: "0xa798B04149e7a61cc95B7D114AD420e8969eA268", decimals: 18, destinations: [
    { chain: "bsc", address: "0x6907a5986c4950bdaf2f81828ec0737ce787519f", decimals: 18 },
    { chain: "hyperliquid", address: "0x43CDD2CCBEB38EB62FDF54E17AFBABF450EBBB01", decimals: 18 },
    { chain: "solana", address: "4Zp52aF4hZi9fzH19xpbWKYKQvgLyCN67KFbrQDqeTKh", decimals: 9, type: "solana" },
  ] },
  { chain: "ETH", symbol: "YB", name: "YB", tokenAddress: "0x01791f726b4103694969820be083196cc7c045ff", adapterAddress: "0x162d38eF490906bfA6d8E5f6Fc09326a1D588f49", decimals: 18, destinations: [
    { chain: "bsc", address: "0xfb93ee8152dd0a0e6f4b49c66c06d800cf1db72d", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ROBO", name: "ROBO", tokenAddress: "0x32b4d049fe4c888d2b92eecaf729f44df6b1f36e", adapterAddress: "0x407A5fb66CB1b3d50004f7091c08A27B42ba6d6F", decimals: 18, destinations: [
    { chain: "bsc", address: "0x475cbf5919608e0c6af00e7bf87fab83bf3ef6e2", decimals: 18 },
    { chain: "base", address: "0x407a5fb66cb1b3d50004f7091c08a27b42ba6d6f", decimals: 18 },
  ] },
  { chain: "ARBI", symbol: "EGP1", name: "EGP1", tokenAddress: "0x7e7a7c916c19a45769f6bdaf91087f93c6c12f78", adapterAddress: "0x60770141B04F53b851fB56Ea108Bb065b0F1135B", decimals: 18, destinations: [
    { chain: "bsc", address: "0x69fe080de3e039ef2b07e3d16688fac1a0b3a2a0", decimals: 18 },
    { chain: "hyperliquid", address: "0x36f63b36346a5100dfabd17193d24af86819f450", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "AGI", name: "AGI", tokenAddress: "0x7da2641000cbb407c329310c461b2cb9c70c3046", adapterAddress: "0xB8870AAA8480E6C8A44235Ad5c737d0fc3F2852b", decimals: 18, destinations: [
    { chain: "bsc", address: "0x13b3e9751bbf4f25c0e177c6890424638d47de44", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "RLS", name: "RLS", tokenAddress: "0xb5f7b021a78f470d31d762c1dda05ea549904fbd", adapterAddress: "0x3Ea6BaC7d4138BcC126D0F17aE10122B3620abA6", decimals: 18, destinations: [
    { chain: "bsc", address: "0x14d8a498e579704bf224e73ff95c7b260302d8e9", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "F", name: "SynFutures", tokenAddress: "0x6e15a54b5ecac17e58dadeddbe8506a7560252f9", adapterAddress: "0xc9cCbd76c2353e593Cc975F13295e8289d04D3Bb", decimals: 18, destinations: [
    { chain: "bsc", address: "0xc9ccbd76c2353e593cc975f13295e8289d04d3bb", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "SPK", name: "Spark", tokenAddress: "0xc20059e0317de91738d13af027dfc4a50781b066", adapterAddress: "0xAfF2e841851700D1Fc101995Ee6b81Ae21Bb87D7", decimals: 18, destinations: [
    { chain: "bsc", address: "0xaff2e841851700d1fc101995ee6b81ae21bb87d7", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "ZENT", name: "ZENT", tokenAddress: "0xdbb7a34bf10169d6d2d0d02a6cbb436cf4381bfa", adapterAddress: "0xb3E01f50C16A08658f8008F1711B5b8e7BC72301", decimals: 18, destinations: [
    { chain: "bsc", address: "0x8c321c2e323bc26c01df0dc62311482a1256fdf5", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "PORTAL", name: "Portal", tokenAddress: "0x1bbe973bef3a977fc51cbed703e8ffdefe001fed", adapterAddress: "0x1700C9A8B7761dA105966EFC6b02900b6a62bB33", decimals: 18, destinations: [] },
  { chain: "ETH", symbol: "INSP", name: "Inspect", tokenAddress: "0x186ef81fd8e77eec8bffc3039e7ec41d5fc0b457", adapterAddress: "0x8D279274789CceC8af94a430A5996eAaCE9609A9", decimals: 18, destinations: [
    { chain: "bsc", address: "0x8d279274789ccec8af94a430a5996eaace9609a9", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "WBTC", name: "wBTC", tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", adapterAddress: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c", decimals: 8, destinations: [
    { chain: "bsc", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
    { chain: "avalanche", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
    { chain: "optimism", address: "0xc3f854b2970f8727d28527ece33176fac67fef48", decimals: 8 },
    { chain: "base", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
    { chain: "sei", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
    { chain: "bera", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
    { chain: "hyperliquid", address: "0x0555e30da8f98308edb960aa94c0db47230d2b9c", decimals: 8 },
  ] },
  { chain: "BASE", symbol: "ZORA", name: "ZORA", tokenAddress: "0x1111111111166b7fe7bd91427724b487980afc69", adapterAddress: "0x9D0b5812618357fd7d5997f7f017ae6e8A9dD3C5", decimals: 18, destinations: [] },
  { chain: "ETH", symbol: "FMC", name: "FMC", tokenAddress: "0x6bfdb6f4e65ead27118592a41eb927cea6956198", adapterAddress: "0x2d955a6765ec08121186A8f476183aF41C7aE5f6", decimals: 18, destinations: [
    { chain: "base", address: "0x6bfdb6f4e65ead27118592a41eb927cea6956198", decimals: 18 },
  ] },
  { chain: "CELO", symbol: "USDT", name: "USDT", tokenAddress: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e", adapterAddress: "0xf10E161027410128E63E75D0200Fb6d34b2db243", decimals: 6, destinations: [] },
  { chain: "ARBI", symbol: "USDT", name: "USDT", tokenAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", adapterAddress: "0x77652D5aba086137b595875263FC200182919B92", decimals: 6, destinations: [] },
  { chain: "ETH", symbol: "ENA", name: "Ethena", tokenAddress: "0x57e114b691db790c35207b2e685d4a43181e6061", adapterAddress: "0x58538e6A46E07434d7E7375Bc268D3cb839C0133", decimals: 18, destinations: [
    { chain: "avalanche", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "bsc", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "mode", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "arbitrum", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "blast", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "fraxtal", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "kava", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "scroll", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "metis", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "manta", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "optimism", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "mantle", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "linea", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "zksync", address: "0x686b311f82b407f0be842652a98e5619f64cc25f", decimals: 18 },
    { chain: "base", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
    { chain: "hyperliquid", address: "0x58538e6a46e07434d7e7375bc268d3cb839c0133", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "USDS", name: "USDS", tokenAddress: "0xdC035D45d973E3EC169d2276DDab16f1e407384F", adapterAddress: "0x1e1D42781FC170EF9da004Fb735f56F0276d01B8", decimals: 18, destinations: [
    { chain: "avalanche", address: "0x4fec40719fd9a8ae3f8e20531669dec5962d2619", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "PROVE", name: "Succinct", tokenAddress: "0x6bef15d938d4e72056ac92ea4bdd0d76b1c4ad29", adapterAddress: "0x32c5d5099a684A781864A2cdc53Db2F8a6b1dca0", decimals: 18, destinations: [
    { chain: "bsc", address: "0x7ddf164cecfddd0f992299d033b5a11279a15929", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "SAND", name: "The Sandbox Game", tokenAddress: "0x3845badade8e6dff049820680d1f14bd3903a5d0", adapterAddress: "0xac531Eb26Ca1d21b85126De8FB87E80E09002DcF", decimals: 18, destinations: [
    { chain: "base", address: "0xac531eb26ca1d21b85126de8fb87e80e09002dcf", decimals: 18 },
    { chain: "bsc", address: "0xac531eb26ca1d21b85126de8fb87e80e09002dcf", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "MOG", name: "MOG", tokenAddress: "0xaaee1a9723aadb7afa2810263653a34ba2c21c7a", adapterAddress: "0x377900904c573b02148025E1D8eA660808c8C757", decimals: 18, destinations: [
    { chain: "bsc", address: "0x1d0a4821fdef156b0d051d08a166de5df2788cf7", decimals: 18 },
    { chain: "solana", address: "26VfKb7jjtdEdvfovoBijScoZmJbWWasFZkgfUD5w7cy", decimals: 4, type: "solana" },
  ] },
  { chain: "ETH", symbol: "KERNEL", name: "KernelDAO", tokenAddress: "0x3f80b1c54ae920be41a77f8b902259d48cf24ccf", adapterAddress: "0x2A1D74de3027ccE18d31011518C571130a4cd513", decimals: 18, destinations: [
    { chain: "bsc", address: "0x9ecaf80c1303cca8791afbc0ad405c8a35e8d9f1", decimals: 18 },
    { chain: "arbitrum", address: "0x6e401189c8a68d05562c9bab7f674f910821eacf", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "MYTH", name: "MYTH", tokenAddress: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003", adapterAddress: "0x808692bc18AA1228B25678ce080D311224dF0371", decimals: 18, destinations: [
    { chain: "avalanche", address: "0x9b9fd410d5f01a6a60acf4678a5a99d8027fa5a7", decimals: 18 },
    { chain: "base", address: "0x9b9fd410d5f01a6a60acf4678a5a99d8027fa5a7", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "PLANET", name: "PLANET", tokenAddress: "0x2ad9addd0d97ec3cdba27f92bf6077893b76ab0b", adapterAddress: "0x94fbDC23C8BaaB054efe78dCEcf60074a9835005", decimals: 18, destinations: [] },
  { chain: "ETH", symbol: "PENDLE", name: "Pendle", tokenAddress: "0x808507121b80c02388fad14726482e061b8da827", adapterAddress: "0xd7E67c97cc48253B28737ec3981B0a7ad6D7E0E4", decimals: 18, destinations: [
    { chain: "bera", address: "0xff9c599d51c407a45d631c6e89cb047efb88aef6", decimals: 18 },
    { chain: "hyperliquid", address: "0xd6eb81136884713e843936843e286fd2a85a205a", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "BSB", name: "BSB", tokenAddress: "0xdb6ba5d510f114f9b2ea08bea7d30e32eee33411", adapterAddress: "0x468b08f3cb200412F44cAc7Ec0ae5A2109264435", decimals: 18, destinations: [
    { chain: "base", address: "0x0dc28efba8c6e0c14fa7391636b8bec86c4c83d6", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "ELSA", name: "ELSA", tokenAddress: "0x29cc30f9d113b356ce408667aa6433589cecbdca", adapterAddress: "0x92db5A14a520eeE59499261E83c27fA135f43bc8", decimals: 18, destinations: [
    { chain: "arbitrum", address: "0x29cc30f9d113b356ce408667aa6433589cecbdca", decimals: 18 },
  ] },
  { chain: "BASE", symbol: "FUN", name: "FUN", tokenAddress: "0x16ee7ecac70d1028e7712751e2ee6ba808a7dd92", adapterAddress: "0x36Ec7F931cc86FfCE44F938E66cB2dE9CDFC71b0", decimals: 18, destinations: [] },
  { chain: "ARBI", symbol: "EDU", name: "EDU", tokenAddress: "0xf8173a39c56a554837c4c7f104153a005d284d11", adapterAddress: "0x86355F02119bdBC28ED6A4D5E0cA327Ca7730fFF", decimals: 18, destinations: [] },
  { chain: "ETH", symbol: "OMNICAT", name: "OmniCat", tokenAddress: "0x9e20461bc2c4c980f62f1b279d71734207a6a356", adapterAddress: "0xa0aA943666B4309C1989E3a7ebe7dbe11de36212", decimals: 18, destinations: [
    { chain: "bsc", address: "0x9e20461bc2c4c980f62f1b279d71734207a6a356", decimals: 18 },
    { chain: "polygon", address: "0x9e20461bc2c4c980f62f1b279d71734207a6a356", decimals: 18 },
    { chain: "arbitrum", address: "0x9e20461bc2c4c980f62f1b279d71734207a6a356", decimals: 18 },
    { chain: "base", address: "0xc48e605c7b722a57277e087a6170b9e227e5ac0a", decimals: 18 },
  ] },
  { chain: "ETH", symbol: "USDQ", name: "USDQ", tokenAddress: "0xc83e27f270cce0a3a3a29521173a83f402c1768b", adapterAddress: "0x302275E3DbaA05917516D7138f2F900a71dD623D", decimals: 18, destinations: [
    { chain: "polygon", address: "0xa6f85fc340f326512899d30049531ea239ffb058", decimals: 18 },
  ] },
];

// Hardcoded OFT token config (pure OFTs with all chain deployments)
interface OftTokenConfig {
  symbol: string;
  name: string;
  deployments: Destination[];
}

const OFT_TOKENS: OftTokenConfig[] = [
  { symbol: "CORN", name: "Corn", deployments: [
    { chain: "ethereum", address: "0x44f49ff0da2498bcb1d3dc7c0f999578f67fd8c6", decimals: 18 },
  ] },
  { symbol: "FAR", name: "FARCANA", deployments: [
    { chain: "ethereum", address: "0xf9fa60ef4f23f00cce403cc4d2c11baf4880a0d6", decimals: 18 },
    { chain: "polygon", address: "0x1a53f62a8eeee5cea2aa822dd0c8b5ed1ff20159", decimals: 18 },
    { chain: "bsc", address: "0xdc816b6bd4786720e91eb17d4dabf0e1eef5ee91", decimals: 18 },
  ] },
  { symbol: "RDNT", name: "Radiant Capital", deployments: [
    { chain: "ethereum", address: "0x137ddb47ee24eaa998a535ab00378d6bfa84f893", decimals: 18 },
    { chain: "bsc", address: "0xf7de7e8a6bd59ed41a4b5fe50278b3b7f31384df", decimals: 18 },
    { chain: "arbitrum", address: "0x3082cc23568ea640225c2467653db90e9250aaa0", decimals: 18 },
    { chain: "base", address: "0xd722e55c1d9d9fa0021a5215cbb904b92b3dc5d4", decimals: 18 },
  ] },
  { symbol: "SOMI", name: "Somnia", deployments: [
    { chain: "ethereum", address: "0x1b0f6590d21dc02b92ad3a7d00f8884dc4f1aed9", decimals: 18 },
    { chain: "bsc", address: "0xa9616e5e23ec1582c2828b025becf3ef610e266f", decimals: 18 },
    { chain: "base", address: "0x47636b3188774a3e7273d85a537b9ba4ee7b2535", decimals: 18 },
  ] },
  { symbol: "AIXBT", name: "Virtuals Protocol", deployments: [
    { chain: "base", address: "0x0d37af9d8ae74f35f3a38bd2a08fcb29890ca6d2", decimals: 18 },
    { chain: "ethereum", address: "0x0d37af9d8ae74f35f3a38bd2a08fcb29890ca6d2", decimals: 18 },
  ] },
  { symbol: "CAKE", name: "PancakeSwap", deployments: [
    { chain: "bsc", address: "0xb274202daba6ae180c665b4fbe59857b7c3a8091", decimals: 18 },
    { chain: "ethereum", address: "0x152649ea73beab28c5b49b26eb48f7ead6d4c898", decimals: 18 },
    { chain: "arbitrum", address: "0x1b896893dfc86bb67cf57767298b9073d2c1ba2c", decimals: 18 },
    { chain: "base", address: "0x3055913c90fcc1a6ce9a358911721eeb942013a1", decimals: 18 },
    { chain: "zksync", address: "0x3a287a06c66f9e95a56327185ca2bdf5f031cecd", decimals: 18 },
  ] },
  { symbol: "DEGEN", name: "Degen", deployments: [
    { chain: "arbitrum", address: "0x9f07f8a82cb1af1466252e505b7b7ddee103bc91", decimals: 18 },
    { chain: "ethereum", address: "0xfee293840d23b0b2de8c55e1cf7a9f01c157767c", decimals: 18 },
    { chain: "base", address: "0xdb8e759859058952c34953c8469f464109826e52", decimals: 18 },
  ] },
  { symbol: "MOCA", name: "Moca Network", deployments: [
    { chain: "ethereum", address: "0x2b11834ed1feaed4b4b3a86a6f571315e25a884d", decimals: 18 },
    { chain: "base", address: "0x2b11834ed1feaed4b4b3a86a6f571315e25a884d", decimals: 18 },
  ] },
  { symbol: "PENGU", name: "Pudgy Penguins", deployments: [
    { chain: "bsc", address: "0x6418c0dd099a9fda397c766304cdd918233e8847", decimals: 18 },
    { chain: "ethereum", address: "0x6418c0dd099a9fda397c766304cdd918233e8847", decimals: 18 },
    { chain: "hyperliquid", address: "0xfa44c2634ff17cbe26dc3007d36bd61c79068c14", decimals: 18 },
  ] },
  { symbol: "ORDER", name: "Orderly Network", deployments: [
    { chain: "ethereum", address: "0x17435cc940e03aa52c349738c72c7aa44ffa6525", decimals: 18 },
    { chain: "optimism", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
    { chain: "base", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
    { chain: "arbitrum", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
    { chain: "polygon", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
    { chain: "avalanche", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
    { chain: "bsc", address: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", decimals: 18 },
  ] },
  { symbol: "SOPH", name: "Sophon", deployments: [
    { chain: "arbitrum", address: "0x31dba3c96481fde3cd81c2aaf51f2d8bf618c742", decimals: 18 },
    { chain: "polygon", address: "0xeb971fd26783f32694dbb392dd7289de23109148", decimals: 18 },
    { chain: "bsc", address: "0x31dba3c96481fde3cd81c2aaf51f2d8bf618c742", decimals: 18 },
    { chain: "base", address: "0x31dba3c96481fde3cd81c2aaf51f2d8bf618c742", decimals: 18 },
  ] },
  { symbol: "SYRUP", name: "Maple Finance", deployments: [
    { chain: "ethereum", address: "0x688aee022aa544f150678b8e5720b6b96a9e9a2f", decimals: 18 },
    { chain: "base", address: "0x688aee022aa544f150678b8e5720b6b96a9e9a2f", decimals: 18 },
  ] },
];

function getSolanaRpcs(): string[] {
  return [
    process.env.HELIUS_API_KEY ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}` : null,
    "https://solana-rpc.publicnode.com",
  ].filter(Boolean) as string[];
}

async function getSolanaTokenSupply(mint: string): Promise<{ supply: bigint; decimals: number } | null> {
  for (const rpc of getSolanaRpcs()) {
    try {
      const res = await fetchWithTimeout(rpc, {
        method: "POST",
        headers: FETCH_HEADERS,
        body: JSON.stringify({ jsonrpc: "2.0", method: "getTokenSupply", params: [mint], id: 1 }),
      });
      const json: any = await res.json();
      if (json.result?.value) {
        return { supply: BigInt(json.result.value.amount), decimals: json.result.value.decimals };
      }
    } catch {}
  }
  return null;
}

async function getSolanaTokenBalance(owner: string, mint: string): Promise<{ balance: bigint; decimals: number } | null> {
  for (const rpc of getSolanaRpcs()) {
    try {
      const res = await fetchWithTimeout(rpc, {
        method: "POST",
        headers: FETCH_HEADERS,
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getTokenAccountsByOwner",
          params: [owner, { mint }, { encoding: "jsonParsed" }],
          id: 1,
        }),
      }, 8000);
      const json: any = await res.json();
      if (json.result?.value?.length > 0) {
        let total = BigInt(0);
        let decimals = 0;
        for (const acct of json.result.value) {
          const info = acct.account.data.parsed.info;
          total += BigInt(info.tokenAmount.amount);
          decimals = info.tokenAmount.decimals;
        }
        return { balance: total, decimals };
      }
    } catch {}
  }
  return null;
}

async function evmCall(rpc: string, to: string, data: string): Promise<bigint | null> {
  try {
    const res = await fetchWithTimeout(rpc, {
      method: "POST",
      headers: FETCH_HEADERS,
      body: JSON.stringify({ jsonrpc: "2.0", method: "eth_call", params: [{ to, data }, "latest"], id: 1 }),
    });
    const json: any = await res.json();
    if (json.result && json.result !== "0x" && json.result !== "0x0") {
      return BigInt(json.result);
    }
  } catch {}
  return null;
}

async function getTotalSupply(rpcs: string[], token: string): Promise<bigint | null> {
  for (const rpc of rpcs) {
    const result = await evmCall(rpc, token, TOTAL_SUPPLY_SELECTOR);
    if (result !== null) return result;
  }
  return null;
}

async function getBalanceOf(rpcs: string[], token: string, holder: string): Promise<bigint | null> {
  const addr = holder.replace("0x", "").toLowerCase().padStart(64, "0");
  for (const rpc of rpcs) {
    const result = await evmCall(rpc, token, BALANCE_OF_SELECTOR + addr);
    if (result !== null) return result;
  }
  return null;
}

export interface OftAdapterResult {
  symbol: string;
  name: string;
  sourceChain: string;
  adapterAddress: string;
  tokenAddress: string;
  locked: number | null;
  totalMinted: number | null;
  delta: number | null;
  deltaPct: number | null;
  destinations: { chain: string; address: string; supply: number | null }[];
  status: "OK" | "ALERT" | "ERROR";
  timestamp: string;
}

export interface OftTokenResult {
  symbol: string;
  name: string;
  totalSupply: number | null;
  chainCount: number;
  successCount: number;
  chains: { chain: string; supply: number | null }[];
  status: "OK" | "ERROR";
  timestamp: string;
}

async function checkOneAdapter(cfg: AdapterConfig): Promise<OftAdapterResult | null> {
  if (cfg.destinations.length === 0) return null;

  let locked: number | null = null;

  if (cfg.sourceType === "solana") {
    const result = await getSolanaTokenBalance(cfg.adapterAddress, cfg.tokenAddress);
    locked = result !== null ? Number(result.balance) / (10 ** result.decimals) : null;
  } else {
    const rpcKey = CSV_CHAIN_MAP[cfg.chain];
    if (!rpcKey) return null;
    const sourceRpcs = getRpcs(rpcKey);
    if (!sourceRpcs) return null;
    const divisor = 10 ** cfg.decimals;
    const lockedRaw = await getBalanceOf(sourceRpcs, cfg.tokenAddress, cfg.adapterAddress);
    locked = lockedRaw !== null ? Number(lockedRaw) / divisor : null;
  }

  if (locked === null || locked === 0) return null;

  const destinations: { chain: string; address: string; supply: number | null }[] = [];
  let totalMinted = 0;
  let mintedSuccess = 0;

  if (cfg.destinations.length > 0) {
    const destResults = await Promise.all(cfg.destinations.map(async (dest) => {
      if (dest.type === "solana") {
        const result = await getSolanaTokenSupply(dest.address);
        const supply = result !== null ? Number(result.supply) / (10 ** result.decimals) : null;
        return { chain: dest.chain, address: dest.address, supply };
      }
      const destRpcKey = LZ_CHAIN_MAP[dest.chain];
      if (!destRpcKey) return { chain: dest.chain, address: dest.address, supply: null };
      const destRpcs = getRpcs(destRpcKey);
      if (!destRpcs) return { chain: dest.chain, address: dest.address, supply: null };
      const supplyRaw = await getTotalSupply(destRpcs, dest.address);
      const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** dest.decimals) : null;
      return { chain: dest.chain, address: dest.address, supply };
    }));
    for (const d of destResults) {
      destinations.push(d);
      if (d.supply !== null) { totalMinted += d.supply; mintedSuccess++; }
    }
  }

  const hasData = mintedSuccess > 0;
  const delta = hasData ? locked - totalMinted : null;
  const deltaPct = hasData && locked > 0 ? (delta! / locked) * 100 : null;
  const status = !hasData ? "ERROR" : (deltaPct !== null && deltaPct < -0.1) ? "ALERT" : "OK";

  return {
    symbol: cfg.symbol,
    name: cfg.name,
    sourceChain: cfg.chain,
    adapterAddress: cfg.adapterAddress,
    tokenAddress: cfg.tokenAddress,
    locked,
    totalMinted: mintedSuccess > 0 ? totalMinted : null,
    delta,
    deltaPct,
    destinations,
    status,
    timestamp: new Date().toISOString(),
  };
}

export async function checkOftAdapters(): Promise<OftAdapterResult[]> {
  const BATCH = 12;
  const results: OftAdapterResult[] = [];

  for (let i = 0; i < ADAPTERS.length; i += BATCH) {
    const batch = ADAPTERS.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(cfg => checkOneAdapter(cfg)));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}

async function checkOneOftToken(cfg: OftTokenConfig): Promise<OftTokenResult | null> {
  const chainResults = await Promise.all(cfg.deployments.map(async (dep) => {
    const rpcKey = LZ_CHAIN_MAP[dep.chain];
    if (!rpcKey) return { chain: dep.chain, supply: null };
    const rpcs = getRpcs(rpcKey);
    if (!rpcs) return { chain: dep.chain, supply: null };
    const supplyRaw = await getTotalSupply(rpcs, dep.address);
    const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** dep.decimals) : null;
    return { chain: dep.chain, supply };
  }));

  let totalSupply = 0;
  let successCount = 0;
  for (const c of chainResults) {
    if (c.supply !== null) { totalSupply += c.supply; successCount++; }
  }

  return {
    symbol: cfg.symbol,
    name: cfg.name,
    totalSupply: successCount > 0 ? totalSupply : null,
    chainCount: cfg.deployments.length,
    successCount,
    chains: chainResults,
    status: successCount > 0 ? "OK" : "ERROR",
    timestamp: new Date().toISOString(),
  };
}

export async function checkOftTokens(): Promise<OftTokenResult[]> {
  const BATCH = 12;
  const results: OftTokenResult[] = [];

  for (let i = 0; i < OFT_TOKENS.length; i += BATCH) {
    const batch = OFT_TOKENS.slice(i, i + BATCH);
    const batchResults = await Promise.all(batch.map(cfg => checkOneOftToken(cfg)));
    for (const r of batchResults) {
      if (r) results.push(r);
    }
  }

  return results;
}
