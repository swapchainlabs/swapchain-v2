"use client";

import { ButtonRipple } from "@/module/common/component/ButtonRipple";
import { Panel } from "@/module/common/component/Panel";
import { Title } from "@/module/common/component/Title";
import { WalletAddress } from "@/module/wallet/component/WalletAddress";
import { useWallet } from "@/module/wallet/provider/WalletProvider";
import { useAarc } from "@aarc-xyz/deposit-widget";
import { Fingerprint, Shield } from "lucide-react";
import styles from "./index.module.css";

export function Settings() {
    const { address, username, wallet } = useWallet();

    const deposit = useAarc();

    return (
        <>
            <Panel size={"small"}>
                <Title icon={<Fingerprint size={32} />}>
                    Biometry informations
                </Title>
                <ul className={styles.settings__list}>
                    <li>
                        Authenticator:{" "}
                        <WalletAddress wallet={wallet.authenticatorId} />
                    </li>
                    <li>Username: {username}</li>
                    {/*<li>UsernameId: </li>*/}
                    {address && (
                        <li>
                            Wallet: <WalletAddress wallet={address} />
                        </li>
                    )}
                </ul>
            </Panel>
            <Panel size={"small"} className={styles.settings__disabled}>
                <Title icon={<Shield size={32} />}>Recovery setup</Title>
                <p className={styles.settings__comingSoon}>Coming soon</p>
            </Panel>

            <ButtonRipple onClick={deposit}>Deposit</ButtonRipple>
        </>
    );
}
