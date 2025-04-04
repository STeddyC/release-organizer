import { auth } from './firebase';
import { supabase } from './supabase';

// Gumroad product ID from URL
const GUMROAD_PRODUCT_ID = 'hndlyt';

export async function verifyGumroadLicense(licenseKey: string) {
  try {
    // For test license keys, simulate verification
    if (licenseKey.startsWith('TEST-')) {
      const tier = licenseKey.includes('BASIC') ? 'basic' : 
                   licenseKey.includes('PRO') ? 'pro' : 
                   licenseKey.includes('LABEL') ? 'label' : null;
      
      if (!tier) {
        console.error('Invalid test license key format');
        return { success: false };
      }

      return {
        success: true,
        tier,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      };
    }

    // Real Gumroad verification
    const response = await fetch(`https://api.gumroad.com/v2/licenses/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: GUMROAD_PRODUCT_ID,
        license_key: licenseKey,
      }),
    });

    const data = await response.json();
    console.log('Gumroad API response:', data);

    if (!data.success) {
      console.error('License verification failed:', data);
      return { success: false };
    }

    return {
      success: true,
      tier: getTierFromVariant(data.purchase.variant_name),
      expiresAt: new Date(data.purchase.subscription_ended_at || data.purchase.ended_at),
    };
  } catch (error) {
    console.error('Error verifying Gumroad license:', error);
    return { success: false };
  }
}

function getTierFromVariant(variantName: string) {
  const normalizedVariant = variantName.toLowerCase();
  if (normalizedVariant.includes('label')) return 'label';
  if (normalizedVariant.includes('pro')) return 'pro';
  return 'basic';
}

export async function activateSubscription(licenseKey: string) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('User not authenticated');
      return { success: false };
    }

    const verification = await verifyGumroadLicense(licenseKey);
    if (!verification.success) {
      console.error('License verification failed');
      return { success: false };
    }

    // Call the activate_subscription function
    const { data, error } = await supabase
      .rpc('activate_subscription', {
        p_user_id: user.uid,
        p_tier: verification.tier,
        p_license_key: licenseKey
      });

    if (error) {
      console.error('Error activating subscription:', error);
      throw error;
    }

    return { success: true, tier: verification.tier };
  } catch (error) {
    console.error('Error in activateSubscription:', error);
    return { success: false };
  }
}