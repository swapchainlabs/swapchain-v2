"use server";

import { DI } from "@/context/common/di";
import { getMongoDb } from "@/context/common/mongoDb";
import type { AuthenticatorDocument } from "@/context/wallet/dto/AuthenticatorDocument";
import type { Collection, ObjectId } from "mongodb";

/**
 * Repository used to access the authenticator collection
 */
export class AuthenticatorRepository {
    constructor(
        private readonly collection: Collection<AuthenticatorDocument>
    ) {}

    /**
     * Get all authenticators for the given user
     * @param userId
     */
    public getAllForUser(userId: ObjectId): Promise<AuthenticatorDocument[]> {
        return this.collection.find({ userId }).toArray();
    }

    /**
     * Get all authenticators for the given user
     * @param credentialId
     */
    public getByCredentialId(
        credentialId: string
    ): Promise<AuthenticatorDocument | null> {
        return this.collection.findOne({ _id: credentialId });
    }

    /**
     * Create a new authenticator for the given user
     * @param authenticator
     */
    public async createAuthenticator(
        authenticator: AuthenticatorDocument
    ): Promise<void> {
        // Ensure no other credential exist with the same id
        const existing = await this.getByCredentialId(authenticator._id);
        if (existing) {
            throw new Error("Credential already exists");
        }

        await this.collection.insertOne(authenticator);
    }

    /**
     * Update the counter for the given authenticator
     * @param authenticatorId
     * @param counter
     */
    public async updateCounter({
        credentialId,
        counter,
    }: { credentialId: string; counter: number }): Promise<void> {
        await this.collection.updateOne(
            { _id: credentialId },
            { $set: { counter } }
        );
    }
}

export const getAuthenticatorRepository = DI.registerAndExposeGetter({
    id: "AuthenticatorRepository",
    isAsync: true,
    getter: async () => {
        const db = await getMongoDb();
        return new AuthenticatorRepository(
            db.collection<AuthenticatorDocument>("authenticators")
        );
    },
});
