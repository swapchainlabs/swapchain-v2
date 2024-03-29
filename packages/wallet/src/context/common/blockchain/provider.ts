import { http, createClient } from "viem";
import { polygonMumbai } from "viem/chains";

export const rpcTransport = http(process.env.RPC_URL, {
    batch: { wait: 50 },
    retryCount: 5,
    retryDelay: 200,
    timeout: 20_000,
});

// Build the viem client
export const viemClient = createClient({
    chain: polygonMumbai,
    transport: rpcTransport,
    cacheTime: 60_000,
    batch: {
        multicall: { wait: 50 },
    },
});

// Build the alchemy client (same as the viem one but batch cache)
export const alchemyClient = createClient({
    chain: polygonMumbai,
    transport: http(process.env.RPC_URL),
    cacheTime: 60_000,
});

export const pimlicoBundlerTransport = http(
    `https://rpc.zerodev.app/api/v2/bundler/${process.env.ZERODEV_API_KEY}`
);
// Build the pimlico bundler client
export const pimlicoBundlerClient = createClient({
    chain: polygonMumbai,
    transport: pimlicoBundlerTransport,
});

// Build the pimlico paymaster client
export const pimlicoPaymasterClient = createClient({
    chain: polygonMumbai,
    transport: http(
        `https://api.pimlico.io/v2/mumbai/rpc?apikey=${process.env.PIMLICO_API_KEY}`
    ),
});

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: Unreachable code error
BigInt.prototype.toJSON = function (): string {
    return this.toString();
};
