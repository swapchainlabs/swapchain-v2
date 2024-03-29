import { use } from "sst/constructs";
import type { StackContext } from "sst/constructs";
import { NextjsSite } from "sst/constructs";
import { ConfigStack } from "./Config";

/**
 * Define the example webapp SST stack
 * @param stack
 * @constructor
 */
export function ExampleAppStack({ stack }: StackContext) {
    // The configs required to run the app
    const { sessionEncryptionKey, mongoUri, frakWalletUrl, adminPassword } =
        use(ConfigStack);
    const configs = [
        sessionEncryptionKey,
        mongoUri,
        frakWalletUrl,
        adminPassword,
    ];

    // Base domain for our whole app
    const subDomain =
        stack.stage === "prod"
            ? "news-example"
            : `news-example-${stack.stage.toLowerCase()}`;

    // Declare the Next.js site
    const site = new NextjsSite(stack, "example", {
        path: "packages/example",
        // Set the custom domain
        customDomain: {
            domainName: `${subDomain}.frak.id`.toLowerCase(),
            hostedZone: "frak.id",
        },
        // Bind to the configs
        bind: configs,
        // Set to combined logging to prevent SSR huuuge cost
        logging: "combined",
        openNextVersion: "2.3.6",
        // Number of server side instance to keep warm
        warm: 10,
    });

    stack.addOutputs({
        SiteUrl: site.url,
    });
}
