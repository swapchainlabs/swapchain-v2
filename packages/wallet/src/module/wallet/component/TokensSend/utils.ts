import { addresses } from "@/context/common/blockchain/addresses";
import type { GetUserErc20Token } from "@/context/tokens/action/getTokenAsset";

export function getFrkToken({ tokens }: { tokens: GetUserErc20Token[] }) {
    return tokens.find(
        ({ contractAddress }) =>
            contractAddress.toLowerCase() === addresses.frakToken.toLowerCase()
    );
}

export function getUpdatedToken({
    tokens,
    selectedToken,
}: { tokens: GetUserErc20Token[]; selectedToken: GetUserErc20Token }) {
    return tokens.find(
        ({ contractAddress, formattedBalance }) =>
            contractAddress === selectedToken?.contractAddress &&
            formattedBalance !== selectedToken?.formattedBalance
    );
}

export const validateAmount = (
    value: string,
    selectedToken: GetUserErc20Token
) => {
    if (parseFloat(value) <= 0) {
        return "Amount must be positive";
    }
    if (parseFloat(value) > parseFloat(selectedToken.formattedBalance)) {
        return "Amount must be less than balance";
    }
    return true;
};
