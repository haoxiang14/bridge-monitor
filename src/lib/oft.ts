import { RPC_LIST } from "./bridges";

const FETCH_HEADERS: Record<string, string> = { "Content-Type": "application/json", "User-Agent": "bridge-monitor/1.0" };
const TOTAL_SUPPLY_SELECTOR = "0x18160ddd";
const BALANCE_OF_SELECTOR = "0x70a08231";

function fetchWithTimeout(url: string, opts?: RequestInit, ms = 8000): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timeout));
}

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

interface CsvAdapter {
  chain: string;
  symbol: string;
  tokenAddress: string;
  adapterAddress: string;
}

const CSV_ADAPTERS: CsvAdapter[] = [
  { chain: "BASE", symbol: "PORTAL", tokenAddress: "0x0ffebc403f2d3dd9ea5501ca03916e98967acb2d", adapterAddress: "0x6d6bf0f1568Bb44Ec7F93Ac50c49db13A107a5f3" },
  { chain: "ETH", symbol: "MAVIA", tokenAddress: "0x24fcfc492c1393274b6bcd568ac9e225bec93584", adapterAddress: "0xE6C2B672B3eB64A1F460AdcD9676a3B6c67abD4D" },
  { chain: "ETH", symbol: "UB", tokenAddress: "0x6944e1df6bf5972305f9ab25df47ef10de01bcc8", adapterAddress: "0xaFc34e2eD3037D5d52209Ed27A93d6df46C07C35" },
  { chain: "ETH", symbol: "ACU", tokenAddress: "0x216b3643ff8b7bb30d8a48e9f1bd550126202add", adapterAddress: "0x4aD11F4D6b4626E426fBE88e8F1c78F469cA33bE" },
  { chain: "ETH", symbol: "SIGN", tokenAddress: "0x868fced65edbf0056c4163515dd840e9f287a4c3", adapterAddress: "0x3a0E6B220897d3Bf7E015c1973510e0F4BB576A9" },
  { chain: "ETH", symbol: "DAM", tokenAddress: "0x0fedba9178b70e8b54e2af08ebffcf28a1e5a43b", adapterAddress: "0x40a341B76A766C56F54985285987Dfe52fEA237a" },
  { chain: "ETH", symbol: "TST", tokenAddress: "0x0828096494ad6252f0f853abfc5b6ec9dfe9fdad", adapterAddress: "0x93AD6C8B3a273E0B4aeeBd6CF03422C885217D3B" },
  { chain: "ETH", symbol: "OPEN", tokenAddress: "0xa227cc36938f0c9e09ce0e64dfab226cad739447", adapterAddress: "0xb548A9D3E8A3fbd821BD52fB915d752BDc8Cf679" },
  { chain: "ETH", symbol: "AVA", tokenAddress: "0xa6c0c097741d55ecd9a3a7def3a8253fd022ceb9", adapterAddress: "0xd9483EA7214FCfd89B4Fb8f513B544920E315A52" },
  { chain: "BASE", symbol: "C", tokenAddress: "0xba12bc7b210e61e5d3110b997a63ea216e0e18f7", adapterAddress: "0x3AdE69D08aC3C7c0Cc3654eeEDbE899f109f7181" },
  { chain: "ETH", symbol: "SIDUS", tokenAddress: "0x549020a9cb845220d66d3e9c6d9f9ef61c981102", adapterAddress: "0xDC402b5Bb2725F8761C600aaD79f06085Fa5fBc4" },
  { chain: "BASE", symbol: "VIRTUAL", tokenAddress: "0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b", adapterAddress: "0xA5A1AFbfF720f79f1f7833aAfBdcEe87770BbC93" },
  { chain: "ETH", symbol: "SWELL", tokenAddress: "0x0a6e7ba5042b38349e437ec6db6214aec7b35676", adapterAddress: "0x09341022ea237a4DB1644DE7CCf8FA0e489D85B7" },
  { chain: "BASE", symbol: "COMMON", tokenAddress: "0x4c87da04887a1f9f21f777e3a8dd55c3c9f84701", adapterAddress: "0x6426D675885b2d1D8b3c7c582D0ABD33d3433f64" },
  { chain: "ETH", symbol: "ALMANAK", tokenAddress: "0xdefa1d21c5f1cbeac00eeb54b44c7d86467cc3a3", adapterAddress: "0xCD291a8B325E6aDb423a5F72E1Bc67de9d19256E" },
  { chain: "ETH", symbol: "LBTC", tokenAddress: "0x8236a87084f8b84306f72007f36f2618a5634494", adapterAddress: "0xacB11Bc20B1945e59976e3307d2a805Faa126C31" },
  { chain: "ETH", symbol: "TRVL", tokenAddress: "0xd47bdf574b4f76210ed503e0efe81b58aa061f3d", adapterAddress: "0x74aa9bB52B36a378a6E641B86d7acb76Dc9b3940" },
  { chain: "BASE", symbol: "OPG", tokenAddress: "0xfbc2051ae2265686a469421b2c5a2d5462fbf5eb", adapterAddress: "0xacd4d6f4Ea54045e4cA21E23AE423700D95aEAA2" },
  { chain: "ETH", symbol: "MON", tokenAddress: "0xc555d625828c4527d477e595ff1dd5801b4a600e", adapterAddress: "0x3c4A6a026B6545D06ca1Bc1111EF900942F826a9" },
  { chain: "ETH", symbol: "PUFFER", tokenAddress: "0x4d1c297d39c5c1277964d0e3f8aa901493664530", adapterAddress: "0x3Ea9bb9fcDCC1C37cB09175aecdb488A97EDd83F" },
  { chain: "ETH", symbol: "ILV", tokenAddress: "0x767fe9edc9e0df98e07454847909b5e959d7ca0e", adapterAddress: "0xe66d89731986F0647bC0367C3cd1aA23368527A1" },
  { chain: "ETH", symbol: "ZRC", tokenAddress: "0xfd418e42783382e86ae91e445406600ba144d162", adapterAddress: "0xB5EB63caAd0ca6e068114C42794AdA9B7757ebC1" },
  { chain: "ETH", symbol: "ENSO", tokenAddress: "0x699f088b5dddcafb7c4824db5b10b57b37cb0c66", adapterAddress: "0xB945577aC2aA9a602cA116C78e3a6B9e5315DD56" },
  { chain: "ETH", symbol: "OL", tokenAddress: "0x1f57da732a77636d913c9a75d685b26cc85dcc3a", adapterAddress: "0x3f160760535Eb715d5809a26cF55408A2d9844c1" },
  { chain: "ETH", symbol: "TRIA", tokenAddress: "0x228bec415ade4b61d7caf0adf8c91eac587ba369", adapterAddress: "0xF1df8aA0B7955B23b10d80193A412AC5650D4791" },
  { chain: "BASE", symbol: "SCOR", tokenAddress: "0xd67ec255100ef200a439d09ff865fbaa2ad9c730", adapterAddress: "0xa58D58839a547cb21FB59cb5dA8c926dfb1E6842" },
  { chain: "ETH", symbol: "ZAMA", tokenAddress: "0xa12cc123ba206d4031d1c7f6223d1c2ec249f4f3", adapterAddress: "0xa798B04149e7a61cc95B7D114AD420e8969eA268" },
  { chain: "ETH", symbol: "YB", tokenAddress: "0x01791f726b4103694969820be083196cc7c045ff", adapterAddress: "0x162d38eF490906bfA6d8E5f6Fc09326a1D588f49" },
  { chain: "ETH", symbol: "ROBO", tokenAddress: "0x32b4d049fe4c888d2b92eecaf729f44df6b1f36e", adapterAddress: "0x407A5fb66CB1b3d50004f7091c08A27B42ba6d6F" },
  { chain: "ARBI", symbol: "EGP1", tokenAddress: "0x7e7a7c916c19a45769f6bdaf91087f93c6c12f78", adapterAddress: "0x60770141B04F53b851fB56Ea108Bb065b0F1135B" },
  { chain: "ETH", symbol: "AGI", tokenAddress: "0x7da2641000cbb407c329310c461b2cb9c70c3046", adapterAddress: "0xB8870AAA8480E6C8A44235Ad5c737d0fc3F2852b" },
  { chain: "ETH", symbol: "RLS", tokenAddress: "0xb5f7b021a78f470d31d762c1dda05ea549904fbd", adapterAddress: "0x3Ea6BaC7d4138BcC126D0F17aE10122B3620abA6" },
  { chain: "ETH", symbol: "F", tokenAddress: "0x6e15a54b5ecac17e58dadeddbe8506a7560252f9", adapterAddress: "0xc9cCbd76c2353e593Cc975F13295e8289d04D3Bb" },
  { chain: "ETH", symbol: "SPK", tokenAddress: "0xc20059e0317de91738d13af027dfc4a50781b066", adapterAddress: "0xAfF2e841851700D1Fc101995Ee6b81Ae21Bb87D7" },
  { chain: "ETH", symbol: "ZENT", tokenAddress: "0xdbb7a34bf10169d6d2d0d02a6cbb436cf4381bfa", adapterAddress: "0xb3E01f50C16A08658f8008F1711B5b8e7BC72301" },
  { chain: "ETH", symbol: "PORTAL", tokenAddress: "0x1bbe973bef3a977fc51cbed703e8ffdefe001fed", adapterAddress: "0x1700C9A8B7761dA105966EFC6b02900b6a62bB33" },
  { chain: "ETH", symbol: "INSP", tokenAddress: "0x186ef81fd8e77eec8bffc3039e7ec41d5fc0b457", adapterAddress: "0x8D279274789CceC8af94a430A5996eAaCE9609A9" },
  { chain: "ETH", symbol: "WBTC", tokenAddress: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", adapterAddress: "0x0555E30da8f98308EdB960aa94C0Db47230d2B9c" },
  { chain: "BASE", symbol: "ZORA", tokenAddress: "0x1111111111166b7fe7bd91427724b487980afc69", adapterAddress: "0x9D0b5812618357fd7d5997f7f017ae6e8A9dD3C5" },
  { chain: "ETH", symbol: "FMC", tokenAddress: "0x6bfdb6f4e65ead27118592a41eb927cea6956198", adapterAddress: "0x2d955a6765ec08121186A8f476183aF41C7aE5f6" },
  { chain: "CELO", symbol: "USDT", tokenAddress: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e", adapterAddress: "0xf10E161027410128E63E75D0200Fb6d34b2db243" },
  { chain: "ARBI", symbol: "USDT", tokenAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", adapterAddress: "0x77652D5aba086137b595875263FC200182919B92" },
  { chain: "ETH", symbol: "ENA", tokenAddress: "0x57e114b691db790c35207b2e685d4a43181e6061", adapterAddress: "0x58538e6A46E07434d7E7375Bc268D3cb839C0133" },
  { chain: "ETH", symbol: "USDS", tokenAddress: "0xdC035D45d973E3EC169d2276DDab16f1e407384F", adapterAddress: "0x1e1D42781FC170EF9da004Fb735f56F0276d01B8" },
  { chain: "ETH", symbol: "PROVE", tokenAddress: "0x6bef15d938d4e72056ac92ea4bdd0d76b1c4ad29", adapterAddress: "0x32c5d5099a684A781864A2cdc53Db2F8a6b1dca0" },
  { chain: "ETH", symbol: "SAND", tokenAddress: "0x3845badade8e6dff049820680d1f14bd3903a5d0", adapterAddress: "0xac531Eb26Ca1d21b85126De8FB87E80E09002DcF" },
  { chain: "ETH", symbol: "MOG", tokenAddress: "0xaaee1a9723aadb7afa2810263653a34ba2c21c7a", adapterAddress: "0x377900904c573b02148025E1D8eA660808c8C757" },
  { chain: "ETH", symbol: "KERNEL", tokenAddress: "0x3f80b1c54ae920be41a77f8b902259d48cf24ccf", adapterAddress: "0x2A1D74de3027ccE18d31011518C571130a4cd513" },
  { chain: "ETH", symbol: "MYTH", tokenAddress: "0xba41ddf06b7ffd89d1267b5a93bfef2424eb2003", adapterAddress: "0x808692bc18AA1228B25678ce080D311224dF0371" },
  { chain: "ETH", symbol: "PLANET", tokenAddress: "0x2ad9addd0d97ec3cdba27f92bf6077893b76ab0b", adapterAddress: "0x94fbDC23C8BaaB054efe78dCEcf60074a9835005" },
  { chain: "ETH", symbol: "PENDLE", tokenAddress: "0x808507121b80c02388fad14726482e061b8da827", adapterAddress: "0xd7E67c97cc48253B28737ec3981B0a7ad6D7E0E4" },
  { chain: "ETH", symbol: "BSB", tokenAddress: "0xdb6ba5d510f114f9b2ea08bea7d30e32eee33411", adapterAddress: "0x468b08f3cb200412F44cAc7Ec0ae5A2109264435" },
  { chain: "BASE", symbol: "ELSA", tokenAddress: "0x29cc30f9d113b356ce408667aa6433589cecbdca", adapterAddress: "0x92db5A14a520eeE59499261E83c27fA135f43bc8" },
  { chain: "BASE", symbol: "FUN", tokenAddress: "0x16ee7ecac70d1028e7712751e2ee6ba808a7dd92", adapterAddress: "0x36Ec7F931cc86FfCE44F938E66cB2dE9CDFC71b0" },
  { chain: "ARBI", symbol: "EDU", tokenAddress: "0xf8173a39c56a554837c4c7f104153a005d284d11", adapterAddress: "0x86355F02119bdBC28ED6A4D5E0cA327Ca7730fFF" },
  { chain: "ETH", symbol: "OMNICAT", tokenAddress: "0x9e20461bc2c4c980f62f1b279d71734207a6a356", adapterAddress: "0xa0aA943666B4309C1989E3a7ebe7dbe11de36212" },
  { chain: "ETH", symbol: "USDQ", tokenAddress: "0xc83e27f270cce0a3a3a29521173a83f402c1768b", adapterAddress: "0x302275E3DbaA05917516D7138f2F900a71dD623D" },
];

interface CsvOftToken {
  symbol: string;
  lookupAddress: string;
  lookupChain: string;
}

const CSV_OFT_TOKENS: CsvOftToken[] = [
  { symbol: "0G", lookupAddress: "0x4b948d64de1f71fcd12fb586f4c776421a35b3ee", lookupChain: "ETH" },
  { symbol: "CORN", lookupAddress: "0x44f49ff0da2498bcb1d3dc7c0f999578f67fd8c6", lookupChain: "ETH" },
  { symbol: "FAR", lookupAddress: "0xf9fa60ef4f23f00cce403cc4d2c11baf4880a0d6", lookupChain: "ETH" },
  { symbol: "OBX", lookupAddress: "0x188fb5f5ae5bbe4154d5778f2bbb2fb985c94d25", lookupChain: "ETH" },
  { symbol: "PIEVERSE", lookupAddress: "0x0e63b9c287e32a05e6b9ab8ee8df88a2760225a9", lookupChain: "ETH" },
  { symbol: "PARAM", lookupAddress: "0x69a1e699f562d7af66fc6cc473d99f4430c3acd2", lookupChain: "ARBI" },
  { symbol: "RDNT", lookupAddress: "0x3082cc23568ea640225c2467653db90e9250aaa0", lookupChain: "ARBI" },
  { symbol: "SHARDS", lookupAddress: "0x6efe65c2426b51e9aa0427b96c313e5d8715fd06", lookupChain: "ETH" },
  { symbol: "BB", lookupAddress: "0xd459eceddafcc1d876a3be7290a2e16e801073a3", lookupChain: "ETH" },
  { symbol: "SOMI", lookupAddress: "0x1b0f6590d21dc02b92ad3a7d00f8884dc4f1aed9", lookupChain: "ETH" },
  { symbol: "ALLO", lookupAddress: "0x032d86656db142138ac97d2c5c4e3766e8c0482d", lookupChain: "BASE" },
  { symbol: "AIXBT", lookupAddress: "0x0d37af9d8ae74f35f3a38bd2a08fcb29890ca6d2", lookupChain: "ETH" },
  { symbol: "BEAM", lookupAddress: "0x2a66d51407b84b82b5aff3dec4d49f72cbcd322a", lookupChain: "BASE" },
  { symbol: "CAKE", lookupAddress: "0x3055913c90fcc1a6ce9a358911721eeb942013a1", lookupChain: "BASE" },
  { symbol: "DEGEN", lookupAddress: "0xfee293840d23b0b2de8c55e1cf7a9f01c157767c", lookupChain: "ETH" },
  { symbol: "IRYS", lookupAddress: "0x50f41f589afaca2ef41fdf590fe7b90cd26dee64", lookupChain: "ETH" },
  { symbol: "MOVE", lookupAddress: "0x3073f7aaa4db83f95e9fff17424f71d4751a3073", lookupChain: "BASE" },
  { symbol: "MOCA", lookupAddress: "0x2b11834ed1feaed4b4b3a86a6f571315e25a884d", lookupChain: "BASE" },
  { symbol: "PENGU", lookupAddress: "0x6418c0dd099a9fda397c766304cdd918233e8847", lookupChain: "ETH" },
  { symbol: "ORDER", lookupAddress: "0x4e200fe2f3efb977d5fd9c430a41531fb04d97b8", lookupChain: "ARBI" },
  { symbol: "SOPH", lookupAddress: "0x31dba3c96481fde3cd81c2aaf51f2d8bf618c742", lookupChain: "ARBI" },
  { symbol: "SYRUP", lookupAddress: "0x688aee022aa544f150678b8e5720b6b96a9e9a2f", lookupChain: "BASE" },
  { symbol: "WOO", lookupAddress: "0xf3df0a31ec5ea438150987805e841f960b9471b6", lookupChain: "BASE" },
  { symbol: "BASED", lookupAddress: "0x4f2b33840227ddd0e28da8d4185d6fa07adfed87", lookupChain: "ETH" },
];

interface LzDeployment {
  address: string;
  localDecimals: number;
  type: "OFT" | "OFT_ADAPTER";
  innerTokenAddress?: string;
}

interface LzTokenEntry {
  name: string;
  sharedDecimals: number;
  endpointVersion: string;
  deployments: Record<string, LzDeployment>;
}

type LzApiResponse = Record<string, LzTokenEntry[]>;

let lzCache: LzApiResponse | null = null;

async function fetchLzMetadata(): Promise<LzApiResponse> {
  if (lzCache) return lzCache;
  try {
    const res = await fetchWithTimeout(
      "https://metadata.layerzero-api.com/v1/metadata/experiment/ofts/list",
      {},
      15000
    );
    lzCache = await res.json() as LzApiResponse;
    return lzCache;
  } catch (e) {
    console.error("[OFT] Failed to fetch LayerZero metadata:", e);
    return {};
  }
}

interface LzMatch {
  symbol: string;
  entry: LzTokenEntry;
}

function findLzEntryByAddress(lzData: LzApiResponse, address: string): LzMatch | null {
  const needle = address.toLowerCase();
  for (const [symbol, entries] of Object.entries(lzData)) {
    for (const entry of entries) {
      for (const [_, dep] of Object.entries(entry.deployments)) {
        if (dep.address.toLowerCase() === needle) {
          return { symbol, entry };
        }
      }
    }
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
  destinations: { chain: string; supply: number | null }[];
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

export async function checkOftAdapters(): Promise<OftAdapterResult[]> {
  const lzData = await fetchLzMetadata();
  const results: OftAdapterResult[] = [];

  for (const csv of CSV_ADAPTERS) {
    const rpcKey = CSV_CHAIN_MAP[csv.chain];
    if (!rpcKey) continue;

    const sourceRpcs = getRpcs(rpcKey);
    if (!sourceRpcs) continue;

    const match = findLzEntryByAddress(lzData, csv.adapterAddress);
    const decimals = match
      ? Object.values(match.entry.deployments).find(d => d.address.toLowerCase() === csv.adapterAddress.toLowerCase())?.localDecimals ?? 18
      : 18;
    const divisor = 10 ** decimals;

    const lockedRaw = await getBalanceOf(sourceRpcs, csv.tokenAddress, csv.adapterAddress);
    const locked = lockedRaw !== null ? Number(lockedRaw) / divisor : null;

    if (locked === null || locked === 0) continue;

    const destinations: { chain: string; supply: number | null }[] = [];
    let totalMinted = 0;
    let mintedSuccess = 0;
    let name = csv.symbol;

    if (match) {
      name = match.entry.name;
      const ofts = Object.entries(match.entry.deployments)
        .filter(([_, d]) => d.type === "OFT")
        .map(([chain, d]) => ({ chain, ...d }));

      for (const oft of ofts) {
        const destRpcKey = LZ_CHAIN_MAP[oft.chain];
        if (!destRpcKey) {
          destinations.push({ chain: oft.chain, supply: null });
          continue;
        }
        const destRpcs = getRpcs(destRpcKey);
        if (!destRpcs) {
          destinations.push({ chain: oft.chain, supply: null });
          continue;
        }
        const supplyRaw = await getTotalSupply(destRpcs, oft.address);
        const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** oft.localDecimals) : null;
        destinations.push({ chain: oft.chain, supply });
        if (supply !== null) {
          totalMinted += supply;
          mintedSuccess++;
        }
      }
    }

    const hasData = mintedSuccess > 0;
    const delta = hasData ? locked - totalMinted : null;
    const deltaPct = hasData && locked > 0 ? (delta! / locked) * 100 : null;
    const status = !hasData ? "ERROR" : (deltaPct !== null && deltaPct < -0.1) ? "ALERT" : "OK";

    results.push({
      symbol: csv.symbol,
      name,
      sourceChain: csv.chain,
      adapterAddress: csv.adapterAddress,
      tokenAddress: csv.tokenAddress,
      locked,
      totalMinted: mintedSuccess > 0 ? totalMinted : null,
      delta,
      deltaPct,
      destinations,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}

export async function checkOftTokens(): Promise<OftTokenResult[]> {
  const lzData = await fetchLzMetadata();
  const results: OftTokenResult[] = [];

  for (const csv of CSV_OFT_TOKENS) {
    const match = findLzEntryByAddress(lzData, csv.lookupAddress);
    if (!match) continue;

    const chains: { chain: string; supply: number | null }[] = [];
    let totalSupply = 0;
    let successCount = 0;

    const allDeployments = Object.entries(match.entry.deployments);

    for (const [chain, deployment] of allDeployments) {
      const rpcKey = LZ_CHAIN_MAP[chain];
      if (!rpcKey) {
        chains.push({ chain, supply: null });
        continue;
      }
      const rpcs = getRpcs(rpcKey);
      if (!rpcs) {
        chains.push({ chain, supply: null });
        continue;
      }
      const supplyRaw = await getTotalSupply(rpcs, deployment.address);
      const supply = supplyRaw !== null ? Number(supplyRaw) / (10 ** deployment.localDecimals) : null;
      chains.push({ chain, supply });
      if (supply !== null) {
        totalSupply += supply;
        successCount++;
      }
    }

    results.push({
      symbol: csv.symbol,
      name: match.entry.name,
      totalSupply: successCount > 0 ? totalSupply : null,
      chainCount: allDeployments.length,
      successCount,
      chains,
      status: successCount > 0 ? "OK" : "ERROR",
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
