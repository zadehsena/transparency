import "dotenv/config";
import { syncJobs } from "../src/lib/jobs/syncFromAts";

async function main() {
    const { results } = await syncJobs(); // sync all companies
    console.log(results);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
