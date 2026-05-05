import { supabaseAdmin } from './src/config/supabaseClient.js';

/**
 * Test the loyalty points awarding logic against the live database.
 * This simulates what paymentController.js does after a successful payment.
 */
async function testLoyaltyPoints() {
    console.log("--- Loyalty Points Integration Test ---\n");

    // 1. Pick any existing profile to test with
    const { data: profiles, error: fetchErr } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, loyalty_points')
        .eq('role', 'customer')
        .limit(1);

    if (fetchErr || !profiles || profiles.length === 0) {
        // Fallback: pick any profile
        const { data: anyProf } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name, loyalty_points')
            .limit(1);
        if (!anyProf || anyProf.length === 0) {
            console.error("No profiles found in the database to test with.");
            return;
        }
        profiles.push(anyProf[0]);
    }

    const testProfile = profiles[0];
    const originalPoints = testProfile.loyalty_points || 0;
    console.log(`Test User: ${testProfile.full_name} (ID: ${testProfile.id})`);
    console.log(`Current Points: ${originalPoints}`);

    // 2. Simulate awarding points for a ₹2500 booking (should be +25 points)
    const mockBookingAmount = 2500;
    const pointsToAward = Math.floor(mockBookingAmount / 100); // 25 points
    console.log(`\nSimulating a ₹${mockBookingAmount} booking → +${pointsToAward} points`);

    const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({ loyalty_points: originalPoints + pointsToAward })
        .eq('id', testProfile.id);

    if (updateErr) {
        console.error("❌ Failed to update loyalty points:", updateErr.message);
        return;
    }

    // 3. Verify the update stuck
    const { data: updated } = await supabaseAdmin
        .from('profiles')
        .select('loyalty_points')
        .eq('id', testProfile.id)
        .single();

    const newPoints = updated?.loyalty_points;
    console.log(`Points After Award: ${newPoints}`);

    if (newPoints === originalPoints + pointsToAward) {
        console.log("\n✅ SUCCESS: Loyalty points awarded and persisted correctly!");
    } else {
        console.error(`\n❌ FAIL: Expected ${originalPoints + pointsToAward}, got ${newPoints}`);
    }

    // 4. Revert the test change
    await supabaseAdmin
        .from('profiles')
        .update({ loyalty_points: originalPoints })
        .eq('id', testProfile.id);

    console.log(`\n(Test cleanup: Reverted points back to ${originalPoints})`);
    console.log("\n--- Test Complete ---");
}

testLoyaltyPoints();
