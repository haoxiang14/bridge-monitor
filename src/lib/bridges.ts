export const RPC_LIST: Record<string, string[]> = {
  ethereum: ["https://ethereum-rpc.publicnode.com", "https://1rpc.io/eth"],
  mantle: ["https://rpc.mantle.xyz", "https://mantle-rpc.publicnode.com"],
  optimism: ["https://optimism-rpc.publicnode.com", "https://mainnet.optimism.io"],
  polygon: ["https://polygon-bor-rpc.publicnode.com", "https://1rpc.io/matic"],
  worldchain: ["https://worldchain-mainnet.g.alchemy.com/public"],
  hyperevm: ["https://rpc.hyperliquid.xyz/evm"],
  solana: ["https://solana-rpc.publicnode.com", "https://api.mainnet-beta.solana.com"],
  arbitrum: ["https://arbitrum-one-rpc.publicnode.com", "https://arb1.arbitrum.io/rpc"],
  berachain: ["https://rpc.berachain.com"],
  conflux: ["https://evm.confluxrpc.com"],
  corn: ["https://mainnet.corn-rpc.com"],
  flare: ["https://flare-api.flare.network/ext/C/rpc"],
  hedera: ["https://mainnet.hashio.io/api"],
  ink: ["https://rpc-gel.inkonchain.com"],
  megaeth: ["https://mainnet.megaeth.com/rpc"],
  monad: ["https://rpc.monad.xyz"],
  morph: ["https://rpc-quicknode.morphl2.io", "https://rpc.morph.network"],
  plasma: ["https://plasma.drpc.org"],
  rootstock: ["https://public-node.rsk.co"],
  sei: ["https://sei-evm-rpc.publicnode.com", "https://evm-rpc.sei-apis.com"],
  stable: ["https://rpc.stable.xyz"],
  tempo: ["https://rpc.tempo.xyz"],
  unichain: ["https://mainnet.unichain.org"],
  xlayer: ["https://rpc.xlayer.tech"],
  // USDe OFT chains
  bnb: ["https://bsc-rpc.publicnode.com", "https://bsc-dataseed.binance.org"],
  avalanche: ["https://api.avax.network/ext/bc/C/rpc", "https://avalanche-c-chain-rpc.publicnode.com"],
  zircuit: ["https://zircuit1-mainnet.p2pify.com", "https://48900.rpc.thirdweb.com"],
  swell: ["https://swell-mainnet.alt.technology"],
  base: ["https://mainnet.base.org", "https://base-rpc.publicnode.com"],
  fraxtal: ["https://rpc.frax.com"],
  scroll: ["https://rpc.scroll.io", "https://scroll.drpc.org"],
  manta: ["https://pacific-rpc.manta.network/http"],
  mode: ["https://mainnet.mode.network"],
  metis: ["https://andromeda.metis.io/?owner=1088"],
  kava: ["https://evm.kava.io", "https://kava-evm-rpc.publicnode.com"],
  zksync: ["https://mainnet.era.zksync.io"],
  blast: ["https://rpc.blast.io", "https://blast-rpc.publicnode.com"],
  linea: ["https://rpc.linea.build", "https://linea.drpc.org"],
  ton: ["https://toncenter.com/api/v3"],
  aptos: ["https://fullnode.mainnet.aptoslabs.com/v1"],
  celo: ["https://forno.celo.org", "https://celo-rpc.publicnode.com"],
};

export const RPC: Record<string, string> = Object.fromEntries(
  Object.entries(RPC_LIST).map(([k, v]) => [k, v[0]])
);

export interface L2Target {
  l2Token: string;
  l2Rpc: keyof typeof RPC;
  l2Type?: "evm" | "solana" | "ton" | "aptos";
  l2Decimals?: number;
  label: string;
}

export interface BridgeConfig {
  bridge: string;
  bridgeUrl: string;
  path: string;
  token: string;
  l1Token: string;
  l1Lock: string;
  l2Token: string;
  l1Rpc: keyof typeof RPC;
  l2Rpc: keyof typeof RPC;
  decimals: number;
  l2Type?: "evm" | "solana";
  l2Targets?: L2Target[];
}

export const BRIDGES: BridgeConfig[] = [
  // === Mantle Official Bridge ===
  {
    bridge: "Mantle Official Bridge",
    bridgeUrl: "https://app.mantle.xyz/bridge",
    path: "Ethereum <> Mantle",
    token: "USDC",
    l1Token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    l1Lock: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
    l2Token: "0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9",
    l1Rpc: "ethereum",
    l2Rpc: "mantle",
    decimals: 6,
  },
  {
    bridge: "Mantle Official Bridge",
    bridgeUrl: "https://app.mantle.xyz/bridge",
    path: "Ethereum <> Mantle",
    token: "USDT",
    l1Token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    l1Lock: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
    l2Token: "0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE",
    l1Rpc: "ethereum",
    l2Rpc: "mantle",
    decimals: 6,
  },
  {
    bridge: "Mantle Official Bridge",
    bridgeUrl: "https://app.mantle.xyz/bridge",
    path: "Ethereum <> Mantle",
    token: "WBTC",
    l1Token: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    l1Lock: "0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012",
    l2Token: "0xCAbAE6f6Ea1ecaB08Ad02fE02ce9A44F09aebfA2",
    l1Rpc: "ethereum",
    l2Rpc: "mantle",
    decimals: 8,
  },
  // === Super Bridge ===
  {
    bridge: "Super Bridge",
    bridgeUrl: "https://superbridge.app/",
    path: "Ethereum <> World Chain",
    token: "WLD",
    l1Token: "0x163f8C2467924be0ae7B5347228CABF260318753",
    l1Lock: "0x470458C91978D2d929704489Ad730DC3E3001113",
    l2Token: "0x2cfc85d8e48f8eab294be644d9e25c3030863003",
    l1Rpc: "ethereum",
    l2Rpc: "worldchain",
    decimals: 18,
  },
  {
    bridge: "Super Bridge",
    bridgeUrl: "https://superbridge.app/",
    path: "Ethereum <> Optimism",
    token: "WLD",
    l1Token: "0x163f8C2467924be0ae7B5347228CABF260318753",
    l1Lock: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
    l2Token: "0xdc6ff44d5d932cbd77b52e5612ba0529dc6226f1",
    l1Rpc: "ethereum",
    l2Rpc: "optimism",
    decimals: 18,
  },
  // === Polygon Bridge ===
  {
    bridge: "Polygon Bridge",
    bridgeUrl: "https://portal.polygon.technology/bridge",
    path: "Ethereum <> Polygon",
    token: "USDC",
    l1Token: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    l1Lock: "0x40ec5B33f54e0E8A33A975908C5BA1c14e5BbbDf",
    l2Token: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    l1Rpc: "ethereum",
    l2Rpc: "polygon",
    decimals: 6,
  },
  // === Mantle Super Portal ===
  {
    bridge: "Mantle Super Portal",
    bridgeUrl: "https://superportal.mantle.xyz/",
    path: "Ethereum <> Solana + HyperEVM",
    token: "MNT",
    l1Token: "0x3c3a81e81dc49A522A592e7622A7E711c06bf354",
    l1Lock: "0x60af2681bcc4886935f428a1386a4a68973f7c4f",
    l2Token: "4SoQ8UkWfeDH47T56PA53CZCeW4KytYCiU65CwBWoJUt",
    l1Rpc: "ethereum",
    l2Rpc: "solana",
    decimals: 18,
    l2Type: "solana",
    l2Targets: [
      {
        l2Token: "4SoQ8UkWfeDH47T56PA53CZCeW4KytYCiU65CwBWoJUt",
        l2Rpc: "solana",
        l2Type: "solana",
        l2Decimals: 9,
        label: "Solana",
      },
      {
        l2Token: "0x36721e62edea413dc5195c4ca9c5a7eb175feb6b",
        l2Rpc: "hyperevm",
        l2Type: "evm",
        l2Decimals: 18,
        label: "HyperEVM",
      },
    ],
  },
  // === USDT0 (LayerZero OFT) ===
  {
    bridge: "USDT0",
    bridgeUrl: "https://usdt0.to",
    path: "Ethereum <> 21 Chains",
    token: "USDT0",
    l1Token: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    l1Lock: "0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee",
    l2Token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    l1Rpc: "ethereum",
    l2Rpc: "arbitrum",
    decimals: 6,
    l2Targets: [
      { l2Token: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", l2Rpc: "arbitrum", l2Decimals: 6, label: "Arbitrum One" },
      { l2Token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", l2Rpc: "berachain", l2Decimals: 6, label: "Berachain" },
      { l2Token: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff", l2Rpc: "conflux", l2Decimals: 6, label: "Conflux eSpace" },
      { l2Token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", l2Rpc: "corn", l2Decimals: 6, label: "Corn" },
      { l2Token: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", l2Rpc: "flare", l2Decimals: 6, label: "Flare" },
      { l2Token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", l2Rpc: "hyperevm", l2Decimals: 6, label: "HyperEVM" },
      { l2Token: "0x00000000000000000000000000000000009Ce723", l2Rpc: "hedera", l2Decimals: 6, label: "Hedera" },
      { l2Token: "0x0200C29006150606B650577BBE7B6248F58470c1", l2Rpc: "ink", l2Decimals: 6, label: "Ink" },
      { l2Token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", l2Rpc: "mantle", l2Decimals: 6, label: "Mantle" },
      { l2Token: "0xb8ce59fc3717ada4c02eadf9682a9e934f625ebb", l2Rpc: "megaeth", l2Decimals: 6, label: "MegaETH" },
      { l2Token: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", l2Rpc: "monad", l2Decimals: 6, label: "Monad" },
      { l2Token: "0xe7cd86e13AC4309349F30B3435a9d337750fC82D", l2Rpc: "morph", l2Decimals: 6, label: "Morph" },
      { l2Token: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071", l2Rpc: "optimism", l2Decimals: 6, label: "Optimism" },
      { l2Token: "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb", l2Rpc: "plasma", l2Decimals: 6, label: "Plasma" },
      { l2Token: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", l2Rpc: "polygon", l2Decimals: 6, label: "Polygon PoS" },
      { l2Token: "0x779dED0C9e1022225F8e0630b35A9B54Be713736", l2Rpc: "rootstock", l2Decimals: 6, label: "Rootstock" },
      { l2Token: "0x9151434b16b9763660705744891fA906F660EcC5", l2Rpc: "sei", l2Decimals: 6, label: "Sei" },
      { l2Token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", l2Rpc: "stable", l2Decimals: 6, label: "Stable" },
      { l2Token: "0x20C00000000000000000000014f22CA97301EB73", l2Rpc: "tempo", l2Decimals: 6, label: "Tempo" },
      { l2Token: "0x9151434b16b9763660705744891fA906F660EcC5", l2Rpc: "unichain", l2Decimals: 6, label: "Unichain" },
      { l2Token: "0x779Ded0c9e1022225f8E0630b35a9b54bE713736", l2Rpc: "xlayer", l2Decimals: 6, label: "XLayer" },
    ],
  },
  // === USDe (Ethena) — LayerZero OFT Adapter ===
  // Lock-and-mint: Ethereum adapter locks USDe; remote OFTs mint on demand.
  // l1Lock = OFT Adapter (also the OFT contract address on Ethereum)
  // l1Token = USDe ERC-20 on Ethereum
  {
    bridge: "Ethena USDe OFT",
    bridgeUrl: "https://ethena.fi",
    path: "Ethereum <> 26 Chains",
    token: "USDe",
    l1Token: "0x4c9edd5852cd905f086c759e8383e09bff1e68b3",
    l1Lock: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
    l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34",
    l1Rpc: "ethereum",
    l2Rpc: "megaeth",
    decimals: 18,
    l2Targets: [
      // EVM OFT chains (standard address)
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "megaeth",   l2Decimals: 18, label: "MegaETH" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "bnb",       l2Decimals: 18, label: "BNB Chain" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "mantle",    l2Decimals: 18, label: "Mantle" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "plasma",    l2Decimals: 18, label: "Plasma" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "hyperevm",  l2Decimals: 18, label: "HyperEVM" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "berachain", l2Decimals: 18, label: "Berachain" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "arbitrum",  l2Decimals: 18, label: "Arbitrum" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "blast",     l2Decimals: 18, label: "Blast" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "avalanche", l2Decimals: 18, label: "Avalanche" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "zircuit",   l2Decimals: 18, label: "Zircuit" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "swell",     l2Decimals: 18, label: "Swell" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "base",      l2Decimals: 18, label: "Base" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "morph",     l2Decimals: 18, label: "Morph" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "fraxtal",   l2Decimals: 18, label: "Fraxtal" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "ink",       l2Decimals: 18, label: "Ink" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "optimism",  l2Decimals: 18, label: "Optimism" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "linea",     l2Decimals: 18, label: "Linea" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "scroll",    l2Decimals: 18, label: "Scroll" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "manta",     l2Decimals: 18, label: "Manta" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "mode",      l2Decimals: 18, label: "Mode" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "metis",     l2Decimals: 18, label: "Metis" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "kava",      l2Decimals: 18, label: "Kava" },
      { l2Token: "0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34", l2Rpc: "xlayer",    l2Decimals: 18, label: "XLayer" },
      // EVM OFT (non-standard address)
      { l2Token: "0x39fe7a0dacce31bd90418e3e659fb0b5f0b3db0d", l2Rpc: "zksync",    l2Decimals: 18, label: "zkSync" },
      // Non-EVM
      { l2Token: "DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT", l2Rpc: "solana", l2Type: "solana", l2Decimals: 9,  label: "Solana" },
      { l2Token: "EQAIb6KmdfdDR7CN1GBqVJuP25iCnLKCvBlJ07Evuu2dzP5f", l2Rpc: "ton", l2Type: "ton",    l2Decimals: 6,  label: "TON" },
      { l2Token: "0xf37a8864fe737eb8ec2c2931047047cbaed1beed3fb0e5b7c5526dafd3b9c2e9", l2Rpc: "aptos", l2Type: "aptos", l2Decimals: 6, label: "Aptos" },
    ],
  },
  // === XAUt0 (Tether Gold) — LayerZero OFT Adapter ===
  // Lock-and-mint: Ethereum adapter locks XAUt; remote chains mint XAUt0 (separate Token + OFT pattern).
  // l1Token = XAUt ERC-20; l1Lock = OFT Adapter
  // EVM remote: totalSupply() on Token address (not OFT address)
  {
    bridge: "XAUt0 OFT",
    bridgeUrl: "https://tether.to/en/transparency/#xaut",
    path: "Ethereum <> 11 Chains",
    token: "XAUt0",
    l1Token: "0x68749665FF8D2d112Fa859AA293F07A622782F38",
    l1Lock: "0xb9c2321BB7D0Db468f570D10A424d1Cc8EFd696C",
    l2Token: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071",
    l1Rpc: "ethereum",
    l2Rpc: "monad",
    decimals: 6,
    l2Targets: [
      // EVM: totalSupply() on Token address
      { l2Token: "0x01bFF41798a0BcF287b996046Ca68b395DbC1071", l2Rpc: "monad",     l2Decimals: 6, label: "Monad" },
      { l2Token: "0xf4D9235269a96aaDaFc9aDAe454a0618eBE37949", l2Rpc: "hyperevm",  l2Decimals: 6, label: "HyperEVM" },
      { l2Token: "0x21cAef8A43163Eea865baeE23b9C2E327696A3bf", l2Rpc: "bnb",       l2Decimals: 6, label: "BNB Chain" },
      { l2Token: "0x1B64B9025EEbb9A6239575dF9Ea4b9Ac46D4d193", l2Rpc: "plasma",    l2Decimals: 6, label: "Plasma" },
      { l2Token: "0x2775d5105276781B4b85bA6eA6a6653bEeD1dd32", l2Rpc: "avalanche", l2Decimals: 6, label: "Avalanche" },
      { l2Token: "0x40461291347e1eCbb09499F3371D3f17f10d7159", l2Rpc: "arbitrum",  l2Decimals: 6, label: "Arbitrum" },
      { l2Token: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff", l2Rpc: "celo",      l2Decimals: 6, label: "Celo" },
      { l2Token: "0xACc6EFBE554397b741BaAdEcF0120780b858f5F4", l2Rpc: "conflux",   l2Decimals: 6, label: "Conflux eSpace" },
      { l2Token: "0xF50258D3c1dd88946C567920B986A12e65b50dAc", l2Rpc: "ink",       l2Decimals: 6, label: "Ink" },
      { l2Token: "0xF1815bd50389c46847f0Bda824eC8da914045d14", l2Rpc: "polygon",   l2Decimals: 6, label: "Polygon" },
      // Non-EVM
      { l2Token: "AymATz4TCL9sWNEEV9Kvyz45CHVhDZ6kUgjTJPzLpU9P", l2Rpc: "solana", l2Type: "solana", l2Decimals: 6, label: "Solana" },
      { l2Token: "EQA1R_LuQCLHlMgOo1S4G7Y7W1cd0FrAkbA10Zq7rddKxi9k", l2Rpc: "ton", l2Type: "ton", l2Decimals: 6, label: "TON" },
      // Stable chain omitted — RPC unavailable
    ],
  },
];
