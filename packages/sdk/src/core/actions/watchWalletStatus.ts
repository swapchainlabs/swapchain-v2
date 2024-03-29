import type { NexusClient } from "../types/client";
import type { WalletStatusReturnType } from "../types/rpc/walletStatus";

/**
 * Function used to watch the current nexus wallet status
 * @param client
 * @param callback
 */
export function watchWalletStatus(
    client: NexusClient,
    callback: (status: WalletStatusReturnType) => void
) {
    return client.listenerRequest(
        {
            method: "frak_listenToWalletStatus",
        },
        callback
    );
}
