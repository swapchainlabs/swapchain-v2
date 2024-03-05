"use client";

import { AuthFingerprint } from "@/module/authentication/component/AuthFingerprint";
import { useRegister } from "@/module/authentication/hook/useRegister";
import { Grid } from "@/module/common/component/Grid";
import { Notice } from "@/module/common/component/Notice";
import { usePaywall } from "@/module/paywall/provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function Register() {
    const { context } = usePaywall();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const { register, error, isRegisterInProgress, isAirdroppingFrk } =
        useRegister();
    const [disabled, setDisabled] = useState(false);

    function getMessages() {
        if (error) {
            return <>Error during registration, please try again</>;
        }
        if (isAirdroppingFrk) {
            return (
                <>
                    NEXUS Account creation in progress
                    <br />
                    <br />
                    Offering you a few frak
                    <span className={"dotsLoading"}>...</span>
                </>
            );
        }
        if (isRegisterInProgress) {
            return (
                <>
                    NEXUS Account creation in progress
                    <br />
                    <br />
                    Waiting for your biometry validation
                    <span className={"dotsLoading"}>...</span>
                </>
            );
        }
        return (
            <>
                Create your <strong>NEXUS</strong>
                <sup>*</sup> in a second with biometry
            </>
        );
    }

    async function triggerAction() {
        setDisabled(true);
        await register();
        startTransition(() => {
            router.push(context ? "/unlock" : "/wallet");
        });
        setDisabled(false);
    }

    useEffect(() => {
        if (!error) return;

        setDisabled(false);

        // If the authenticator was previously registered
        // TODO: Content on the login page? Main btn mutation to a login one?
        if (
            "code" in error &&
            error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED"
        ) {
            router.push("/login");
            console.error("Authenticator previously registered", {
                code: error.code,
                name: error.name,
            });
        }
    }, [error, router]);

    return (
        <Grid
            footer={
                <>
                    <Link href={"/login"} title="Login">
                        Use an existing NEXUS
                    </Link>
                    <Notice>
                        <sup>*</sup>encrypted digital account where you can find
                        all the content you own, your consumption data and the
                        rewards you earn
                    </Notice>
                </>
            }
        >
            <AuthFingerprint action={triggerAction} disabled={disabled}>
                {getMessages()}
            </AuthFingerprint>
        </Grid>
    );
}
