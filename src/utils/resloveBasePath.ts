export const resolveBasePath = () => {
    const tapisSiteId: string | undefined = process.env.TAPIS_SITE_ID
    const tapisEnv: string | undefined = process.env.TAPIS_ENV
    const baseUrl: string | undefined = process.env.TAPIS_BASE_URL

    console.log(tapisSiteId, tapisEnv, baseUrl)
    
    let envStr = tapisEnv ? `.${tapisEnv}.` : ""
    if (tapisSiteId && baseUrl) {
        // Note: Using the site as the tenant is temporary
        // TODO: Remove
        return `https://${tapisSiteId}${envStr}${baseUrl}`
    }

    // Default to dev tenant and develop envrionment
    return "https://dev.develop.tapis.io"
}