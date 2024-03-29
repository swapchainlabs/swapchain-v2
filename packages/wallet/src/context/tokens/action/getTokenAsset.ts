"use server";

import { alchemyClient } from "@/context/common/blockchain/provider";
import type { GetTokenMetadataResponse } from "@/context/common/blockchain/viemActions/AlchemyTypes";
import { getTokenBalances } from "@/context/common/blockchain/viemActions/getTokenBalances";
import {
    type GetTokenMetadataParams,
    getTokenMetadata,
} from "@/context/common/blockchain/viemActions/getTokenMetadata";
import { revalidateTag, unstable_cache } from "next/cache";
import { parallel } from "radash";
import { formatUnits } from "viem";
import type { Address } from "viem";

/**
 * Get all the user tokens
 * @param wallet
 */
async function _getUserErc20Tokens({ wallet }: { wallet: Address }) {
    if (!wallet) {
        return;
    }

    // Get all of his assets
    const balances = await getTokenBalances(alchemyClient, {
        address: wallet,
        type: "erc20",
    });

    // Get the metadata for assets gt than 0n
    const effectiveBalances = balances.tokenBalances.filter(
        (tBalance) => tBalance.tokenBalance > 0n
    );

    // Fetch every token metadata and return that
    return await parallel(2, effectiveBalances, async (tBalance) => {
        const metadata = await _getTokenMetadata({
            address: tBalance.contractAddress,
        });
        const formattedBalance = formatUnits(
            tBalance.tokenBalance,
            metadata.decimals
        );
        return {
            ...tBalance,
            formattedBalance,
            metadata,
        };
    });
}

export type GetUserErc20Token = {
    contractAddress: Address;
    tokenBalance: bigint;
    formattedBalance: string;
    metadata: GetTokenMetadataResponse;
};

const TAG = "userErc20Tokens";

/**
 * Cached version of the user tokens
 */
export const getUserErc20Tokens = unstable_cache(
    _getUserErc20Tokens,
    ["get-erc20-assets"],
    {
        // Tags for revalidation
        tags: [TAG],
        // Keep that in server cache for 2min
        revalidate: 120,
    }
);

/**
 * Revalidate the user tokens
 */
export async function userErc20TokensRevalidate() {
    revalidateTag(TAG);
}

/**
 * Get the metadata of a token, cached version
 * @param address
 */
const _getTokenMetadata = unstable_cache(
    (args: GetTokenMetadataParams) => getTokenMetadata(alchemyClient, args),
    ["get-token-metadata"],
    {
        // Keep that in server cache for 2min
        revalidate: 120,
    }
);
