export const vaultAbi = [
    "event Deposit(address indexed user, uint256 amount)",
    "event Withdraw(address indexed user, uint256 amount)",

    "function deposit() payable",
    "function withdraw(uint256 amount)",
    "function balances(address) view returns (uint256)",
] as const

export const erc20VaultAbi = [
    // ERC20 (shares)
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",

    // ERC4626
    "function deposit(uint256 assets, address receiver) returns (uint256)",
    "function withdraw(uint256 assets, address receiver, address owner) returns (uint256)",
    "function redeem(uint256 shares, address receiver, address owner) returns (uint256)",

    "function convertToAssets(uint256 shares) view returns (uint256)",
    "function convertToShares(uint256 assets) view returns (uint256)",
] as const