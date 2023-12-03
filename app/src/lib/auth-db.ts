// This approach is taken from https://github.com/vercel/next.js/tree/canary/examples/with-mongodb
import { MongoClient } from "mongodb"

const DATABASE_USERNAME_FILE = "/run/secrets/userdb-root-username"
const DATABASE_PASSWORD_FILE = "/run/secrets/userdb-root-password"

var fs = require('fs');

const uri = `mongodb://root:password@user-db:27005/?authMechanism=DEFAULT&authSource=admin`
const options = {}

let client
let userDbClientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  if (!global._userDbClientPromise) {
    client = new MongoClient(uri, options)
    global._userDbClientPromise = client.connect()
  }
  userDbClientPromise = global._userDbClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  userDbClientPromise = client.connect()
}

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default userDbClientPromise