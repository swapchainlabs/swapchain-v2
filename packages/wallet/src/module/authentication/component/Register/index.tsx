"use client";

import { AuthFingerprint } from "@/module/authentication/component/AuthFingerprint";
import { useRegister } from "@/module/authentication/hook/useRegister";
import { Grid } from "@/module/common/component/Grid";
import { Notice } from "@/module/common/component/Notice";
import { usePaywall } from "@/module/paywall/provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

export function Register() {
    const { context } = usePaywall();
    const router = useRouter();
    const [, startTransition] = useTransition();
    const { register, error, isRegisterInProgress, isAirdroppingFrk } =
        useRegister();
    const [disabled, setDisabled] = useState(false);

    /**
     * Boolean used to know if the error is about a previously used authenticator
     */
    const isPreviouslyUsedAuthenticatorError = useMemo(
        () =>
            !!error &&
            "code" in error &&
            error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED",
        [error]
    );

    /**
     * Get the message that will displayed inside the button
     */
    function getMessages() {
        if (isPreviouslyUsedAuthenticatorError) {
            return (
                <>
                    You already have a NEXUS account on your device
                    <br />
                    <br />
                    Redirecting to the login page
                    <span className={"dotsLoading"}>...</span>
                </>
            );
        }
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
    }, [error]);

    useEffect(() => {
        if (!isPreviouslyUsedAuthenticatorError) return;

        setTimeout(() => {
            router.push("/login");
        }, 3000);
    }, [isPreviouslyUsedAuthenticatorError, router]);

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
            <AuthFingerprint
                action={triggerAction}
                disabled={disabled || isPreviouslyUsedAuthenticatorError}
            >
                {getMessages()}
            </AuthFingerprint>
        </Grid>
    );
}
