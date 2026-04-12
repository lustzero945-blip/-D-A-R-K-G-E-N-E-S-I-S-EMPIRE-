// commands.js

// Arrogant kickAll command
async function kickAll(users) {
    for (let user of users) {
        await kickUser(user);
        console.log(`Kicked ${user} with an arrogant message: 'You've been kicked, realize your insignificance!'`);
    }
}

// Pair command that generates connected device code with LUST DEV0 signature
function generatePairCode(device) {
    const code = `${device}-${Date.now()}-LUST_DEV0`;
    return code;
}