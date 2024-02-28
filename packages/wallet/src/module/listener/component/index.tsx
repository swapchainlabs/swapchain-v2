"use client";

import { createIFrameRequestResolver } from "@/context/sdk/utils/iFrameRequestResolver";
import { useArticlePrices } from "@/module/paywall/hook/useArticlePrices";
import { useUnlockState } from "@/module/paywall/hook/useUnlockState";
import { useUserStatus } from "@/module/wallet/hooks/useUserStatus";
import type {
    ArticleUnlockStatusReturnType,
    WalletStatusReturnType,
} from "@frak-wallet/sdk/core";
import { useEffect, useState } from "react";
import type { Hex } from "viem";

type UnlockStateListenerParam = {
    contentId: Hex;
    articleId: Hex;
    emitter: (response: ArticleUnlockStatusReturnType) => Promise<void>;
};

type UserStateListenerParam = {
    emitter: (response: WalletStatusReturnType) => Promise<void>;
};

export function ListenerUI() {
    const [resolver, setResolver] = useState<
        ReturnType<typeof createIFrameRequestResolver> | undefined
    >(undefined);

    // Hook used to fetch the prices
    const { fetchPrices } = useArticlePrices();

    // Info required to fetch the unlock status
    const [unlockStatusParam, setUnlockStatusParam] = useState<
        UnlockStateListenerParam | undefined
    >(undefined);
    const { unlockState } = useUnlockState({
        contentId: unlockStatusParam?.contentId,
        articleId: unlockStatusParam?.articleId,
    });

    // Info required about the user status
    const [userStatusParam, setUserStatusParam] = useState<
        UserStateListenerParam | undefined
    >(undefined);

    // Listen to the current user status
    const { userStatus } = useUserStatus();

    // Create the resolver
    useEffect(() => {
        const newResolver = createIFrameRequestResolver({
            /**
             * Listen request on an article unlock status
             */
            frak_listenToArticleUnlockStatus: async (request, emitter) => {
                // Register our unlock status listener
                setUnlockStatusParam({
                    contentId: request.params[0],
                    articleId: request.params[1],
                    emitter,
                });
            },
            /**
             * Listen request on the wallet status
             */
            frak_listenToWalletStatus: async (_, emitter) => {
                setUserStatusParam({ emitter });
            },
            /**
             * Get the unlock options for an article
             * @param request
             * @param emitter
             */
            frak_getArticleUnlockOptions: async (request, emitter) => {
                // Directly fetch the price here
                const prices = await fetchPrices({
                    contentId: request.params[0],
                    articleId: request.params[1],
                });
                // And send the response
                await emitter(prices);
            },
        });

        console.log("Resolver created", { newResolver });

        // Set our new resolver
        setResolver(newResolver);

        // On cleanup, destroy the resolver
        return () => {
            console.log("Destroying resolver", { newResolver });
            newResolver.destroy();
        };
    }, [fetchPrices]);

    /**
     * Once all the required state are set, we can start handling the request
     */
    useEffect(() => {
        if (resolver && typeof fetchPrices === "function") {
            resolver.setReadyToHandleRequest();
        }
    }, [resolver, fetchPrices]);

    /**
     * Every time the unlock state change, send it to the listener
     */
    useEffect(() => {
        if (unlockState) {
            console.log("Sending the unlock state to the listener", {
                unlockState,
            });
            unlockStatusParam?.emitter(unlockState);
        }
    }, [unlockState, unlockStatusParam]);

    /**
     * Every time the user status change, send it to the listener
     */
    useEffect(() => {
        if (userStatus) {
            console.log("Sending the user status to the listener", {
                userStatus,
                userStatusEmitter: userStatusParam,
            });
            userStatusParam?.emitter(userStatus);
        }
    }, [userStatus, userStatusParam]);

    return <h1>Listener</h1>;
}
