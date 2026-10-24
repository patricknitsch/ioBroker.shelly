import { getCredentials } from '@iobroker/adapter-core/credentials';

import type { ShellyAdapterConfig } from './types';

/** Minimal adapter interface needed to resolve the credentials (makes the functions testable). */
interface CredentialAdapter {
    config: ShellyAdapterConfig;
    log: Pick<ioBroker.Logger, 'info' | 'warn' | 'debug'>;
}

/** Login and password of a central credential, '' if missing. */
export interface LoginPassword {
    login: string;
    password: string;
}

/** Function which reads one credential - injectable for the unit tests. */
type CredentialReader = (
    adapter: CredentialAdapter,
    id: string,
) => Promise<{ name?: string; values?: Record<string, unknown> }>;

/** Which instance settings are replaced by which credential selection. */
const CREDENTIAL_TARGETS = [
    {
        setting: 'mqttCredential',
        login: 'mqttusername',
        password: 'mqttpassword',
        label: 'MQTT',
    },
    {
        setting: 'httpCredential',
        login: 'httpusername',
        password: 'httppassword',
        label: 'HTTP',
    },
] as const;

/**
 * Reads login and password from the values of a central credential of the form "login & password".
 *
 * @param values - The decrypted values of the credential.
 */
export function getCredentialLoginValues(values: Record<string, unknown> | undefined): LoginPassword {
    const text = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
    const v = values || {};
    return { login: text(v.login), password: text(v.password) };
}

/**
 * Takes the MQTT and HTTP user credentials from the central credentials (Admin → Settings → Credentials)
 * selected in the instance settings `mqttCredential` / `httpCredential`. The values are only changed
 * in memory - the stored instance configuration stays untouched. Without a usable credential the
 * manually entered user name and password stay in use.
 *
 * @param adapter - The adapter instance.
 * @param reader - Function which reads a credential (for tests).
 * @returns The names of the settings which were taken from a credential.
 */
export async function applyCredentials(
    adapter: CredentialAdapter,
    reader: CredentialReader = getCredentials as unknown as CredentialReader,
): Promise<string[]> {
    const applied: string[] = [];

    for (const target of CREDENTIAL_TARGETS) {
        const configured = adapter.config[target.setting];
        const id = typeof configured === 'string' ? configured.trim() : '';
        if (!id) {
            continue;
        }

        try {
            const info = await reader(adapter, id);
            const values = getCredentialLoginValues(info.values);
            if (!values.login && !values.password) {
                adapter.log.warn(
                    `[Credentials] Credential "${info.name || id}" for ${target.label} must be of the form "login & password" - using the instance settings`,
                );
                continue;
            }

            adapter.config[target.login] = values.login;
            adapter.config[target.password] = values.password;
            applied.push(target.setting);

            adapter.log.info(
                `[Credentials] ${target.label} user name and password taken from credential "${info.name || id}"`,
            );
        } catch (err) {
            adapter.log.warn(
                `[Credentials] Cannot read credential "${id}" for ${target.label}: ${err instanceof Error ? err.message : String(err)} - using the instance settings`,
            );
        }
    }

    return applied;
}

/**
 * Returns the ids of all credentials selected in the instance settings.
 *
 * @param config - The instance configuration.
 */
export function getSelectedCredentialIds(config: ShellyAdapterConfig): string[] {
    const ids = CREDENTIAL_TARGETS.map(target => config[target.setting])
        .map(id => (typeof id === 'string' ? id.trim() : ''))
        .filter(id => !!id);

    return [...new Set(ids)];
}
