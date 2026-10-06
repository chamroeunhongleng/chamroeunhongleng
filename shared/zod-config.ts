// Zod probes `new Function("")` to decide whether to JIT; under this site's no-'unsafe-eval' CSP
// the browser reports that probe as a securitypolicyviolation even though Zod swallows the throw.
import { z } from 'zod'

// Import this file above any schema definition: imports evaluate first, so it is set before parsing.
z.config({ jitless: true })
