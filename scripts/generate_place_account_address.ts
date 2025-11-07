import { CommunityConfig, getCardAddress } from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { id } from 'ethers';

const main = async () => {
  const businessId = process.argv[2];
  const placeId = process.argv[3];
  if (!businessId || !placeId) {
    console.error(
      'Usage: node scripts/generate_place_account_address.ts <businessId> <placeId>'
    );
    return;
  }

  const community = new CommunityConfig(Config);

  const hashedSerial = id(`${businessId}:${placeId}`);

  const account = await getCardAddress(community, hashedSerial);
  if (!account) {
    return { error: 'Failed to get account address' };
  }

  console.log(`Account address: ${account}`);
};

main();
