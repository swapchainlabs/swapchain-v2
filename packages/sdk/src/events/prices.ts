import {
    decompressDataAndCheckHash,
    hashAndCompressData,
} from "../compression";
import type {
    DecompressedFormat,
    EventsFormat,
    FrakWalletSdkConfig,
    GetPricesParam,
    GetPricesResponse,
} from "../types";

const getPricesParamsKeyAccessor = (params: GetPricesParam) => [
    params.contentId,
    params.articleId,
];
const getPriceResponseKeyAccessor = (response: GetPricesResponse) => [
    response.prices.length.toString(),
    ...response.prices.map((p) => p.frkAmount),
];

/**
 * Helper for the get prices request params
 * @param config
 * @param id
 * @param params
 */
export async function getPricesEvent(
    config: FrakWalletSdkConfig,
    params: Omit<GetPricesParam, "contentId">
): Promise<EventsFormat> {
    // Compress our params
    const { compressed, compressedHash } = await hashAndCompressData(
        { ...params, contentId: config.contentId },
        getPricesParamsKeyAccessor
    );

    // Generate a random id
    const id = Math.random().toString(36).substring(7);

    return {
        topic: "get-price-param",
        id,
        data: {
            compressed,
            compressedHash: compressedHash,
        },
    };
}

/**
 * Helper to parse the prices response
 */
export async function parseGetPricesEventResponse(
    event: EventsFormat
): Promise<GetPricesResponse> {
    // Decompress the data
    return await decompressDataAndCheckHash(
        event.data,
        getPriceResponseKeyAccessor
    );
}

/**
 * Helper to parse the prices params
 *   - TODO: This should be moved to the wallet app directly, no needed for external usage
 */
export async function parseGetPricesEventData(
    event: EventsFormat
): Promise<DecompressedFormat<GetPricesParam>> {
    const data = await decompressDataAndCheckHash(
        event.data,
        getPricesParamsKeyAccessor
    );
    return {
        data,
        topic: event.topic,
        id: event.id,
    };
}

/**
 * Helper to prepare the prices response
 *   - TODO: This should be moved to the wallet app directly, no needed for external usage
 */
export async function getPricesResponseEvent(
    response: GetPricesResponse,
    id: string
): Promise<EventsFormat> {
    // Compress our params
    const { compressed, compressedHash } = await hashAndCompressData(
        response,
        getPriceResponseKeyAccessor
    );
    return {
        id,
        topic: "get-price-response",
        data: {
            compressed,
            compressedHash: compressedHash,
        },
    };
}
