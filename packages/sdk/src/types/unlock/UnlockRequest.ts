import type { Address, Hex } from "viem";
import type { ArticlePrice } from "../ArticlePrice.ts";

/**
 * Request to unlock a paid article
 */
export type UnlockRequestParams = Readonly<{
    articleId: Hex;
    contentId: Hex;
    // The selected prices for the article
    price: ArticlePrice;
    // Url of the article to unlock
    articleUrl: string;
    // The url to redirect to after the content unlock process started
    redirectUrl: string;
    // The url to display a preview of the content to be unlocked
    previewUrl?: string;
}>;

/**
 * Response to the unlock request
 */
export type UnlockRequestResult = Readonly<
    UnlockSuccess | AlreadyUnlocked | UnlockError
>;

type UnlockSuccess = {
    key: "success";
    status: "in-progress";
    user: Address;
    userOpHash: Hex;
};

type AlreadyUnlocked = {
    key: "already-unlocked";
    status: "unlocked";
    user: Address;
    userOpHash: Hex;
    txHash: Hex;
};

type UnlockError = {
    key: "error";
    status: "locked";
    user: Address;
    reason?: string;
};