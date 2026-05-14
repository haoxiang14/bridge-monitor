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
};

export const RPC: Record<string, string> = Object.fromEntries(
  Object.entries(RPC_LIST).map(([k, v]) => [k, v[0]])
);

export interface L2Target {
  l2Token: string;
  l2Rpc: keyof typeof RPC;
  l2Type?: "evm" | "solana";
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
];
