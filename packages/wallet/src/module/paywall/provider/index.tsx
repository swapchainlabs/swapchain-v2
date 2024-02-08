"use client";

import type { ArticlePrice } from "@/types/Price";
import {
    type UnlockRequestParams,
    prepareUnlockRequestResponse,
} from "@frak-wallet/sdk";
import { useRouter } from "next/navigation";
import {
    type ReactNode,
    createContext,
    useContext,
    useState,
    useTransition,
} from "react";
import type { Hex } from "viem";

/**
 * Represent the context of a paywall unlock
 */
export type PaywallContext = {
    // Content related
    contentId: Hex;
    contentTitle: string;
    // Article related
    articleId: Hex;
    articleTitle: string;
    // Price related
    price: ArticlePrice;
    // Url related
    articleUrl: string;
    redirectUrl: string;
    previewUrl?: string;
};

/**
 * Hook used to store current data about the paywall context
 */
function usePaywallHook() {
    const router = useRouter();
    const [, startTransition] = useTransition();

    const [currentContext, setContext] = useState<PaywallContext | null>(null);

    /**
     * Handle a new unlock request
     * @param unlockRequest
     */
    async function handleNewUnlockRequest(unlockRequest: UnlockRequestParams) {
        setContext(unlockRequest);
        // Other shit to do? Find out the right path? Like going to the register / login page?
    }

    /**
     * Discard an unlock request
     */
    async function discard() {
        // If we have no current context, nothing to do
        if (!currentContext) {
            return;
        }

        // Build the redirection url
        const unlockResponseUrl = await prepareUnlockRequestResponse(
            currentContext.redirectUrl,
            {
                key: "cancelled",
                status: "locked",
                reason: "User discarded the unlock request",
            }
        );

        // Cleanup the context
        setContext(null);

        // And go to the redirect url
        startTransition(() => {
            router.push(unlockResponseUrl);
        });
    }

    return {
        test: "paywallContext",
        context: currentContext,
        handleNewUnlockRequest,
        discard,
    };
}

type UsePaywallHook = ReturnType<typeof usePaywallHook>;
const PaywallContext = createContext<UsePaywallHook | null>(null);

export const usePaywall = (): UsePaywallHook => {
    const context = useContext(PaywallContext);
    if (!context) {
        throw new Error(
            "usePaywall hook must be used within a PaywallProvider"
        );
    }
    return context;
};

export function PaywallProvider({ children }: { children: ReactNode }) {
    const hook = usePaywallHook();

    return (
        <PaywallContext.Provider value={hook}>
            {children}
        </PaywallContext.Provider>
    );
}