export function normalizeDomain(domain: string): string {
    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
        throw new Error("Domain cannot be empty");
    }
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)
    ? trimmed 
    : `https://${trimmed}`;
    let hostname: string;
    try {
        hostname =  new URL(withProtocol).hostname;
    } catch {
        throw new Error("Invalid domain");
    }

    const withoutWww = hostname.startsWith('www.') 
        ? hostname.slice(4) 
        : hostname;

    if (!withoutWww || !withoutWww.includes('.')) {
        throw new Error("Invalid domain");
    }
    return withoutWww;
}