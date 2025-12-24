export const vaultAbi = [
    // EVENTS
    "event Deposit(address indexed user, uint256 amount)",
    "event Withdraw(address indexed user, uint256 amount)",

    // FUNCTIONS
    "function deposit() payable",
    "function withdraw(uint256 amount)",
    "function balances(address) view returns (uint256)",
] as const;
