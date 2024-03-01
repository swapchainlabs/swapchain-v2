"use client";

import { Grid } from "@/module/common/component/Grid";
import { InstallApp } from "@/module/wallet/component/InstallApp";
import { Tokens } from "@/module/wallet/component/Tokens";
import {CreateWalletConnectConnection} from "@/module/wallet-connect/component/StartConnect";

export function WalletHomePage() {
    return (
        <Grid>
            <InstallApp />
            <Tokens />
            <CreateWalletConnectConnection />
        </Grid>
    );
}
