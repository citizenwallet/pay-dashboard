'use server';
import { isUserAdminAction } from '@/actions/session';
import { getServiceRoleClient } from '@/db';
import { createBurn, getBurnById } from '@/db/burn';
import { getPayoutOrders } from '@/db/orders';
import {
  getPayoutById,
  updatePayoutBurn,
  updatePayoutTransfer
} from '@/db/payouts';
import { createTransfer, getTransferById } from '@/db/transfer';
import {
  getAccountAddress,
  CommunityConfig,
  BundlerService
} from '@citizenwallet/sdk';
import Config from '@/cw/community.json';
import { Wallet } from 'ethers';
import { getPlaceById } from '@/db/places';

export async function getPayoutAction(payout_id: string) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrders(client, Number(payout_id));
  return payout;
}

export async function getPayoutCSVAction(payout_id: string) {
  const client = getServiceRoleClient();
  const payout = await getPayoutOrders(client, Number(payout_id));

  if (!payout.data || payout.data.length === 0) {
    return ''; // Return an empty CSV string instead of null
  }

  const orders = payout.data;

  const csvHeaders = [
    'ID',
    'Created At',
    'Total',
    'Due',
    'Status',
    'Type',
    'Fees',
    'Place ID'
  ];

  const csvData = [
    csvHeaders.join(','),
    ...orders.map((order) =>
      [
        order.id,
        order.created_at,
        order.total,
        order.due,
        order.status,
        order.type,
        order.fees,
        order.place_id
      ].join(',')
    )
  ].join('\n');

  return csvData;
}

export async function setPayoutStatusAction(payout_id: string, status: string) {
  const client = getServiceRoleClient();
  try {
    if (status == 'burn') {
      const { data: payoutData } = await getPayoutById(client, payout_id);
      const placeId = payoutData?.place_id;
      const payoutAmount = payoutData?.total;

      if (!payoutAmount) {
        throw new Error('Payout amount not found');
      }

      if (!placeId) {
        throw new Error('Place ID not found');
      }

      const { data: placeData } = await getPlaceById(client, Number(placeId));

      if (!placeData) {
        throw new Error('Place not found');
      }

      const placeAccounts = placeData.accounts[0];

      await burnTokenFromPlaceAccountAction(
        payoutAmount.toString(),
        placeAccounts,
        'Payout'
      );

      const burn = await createBurn(client);
      const burnId = burn.data?.id;
      if (!burnId) {
        throw new Error('Failed to create burn');
      }
      const payout = await updatePayoutBurn(client, payout_id, burnId);
    } else if (status == 'transferred') {
      const transfer = await createTransfer(client);
      const transferId = transfer.data?.id;
      if (!transferId) {
        throw new Error('Failed to create transfer');
      }
      const payout = await updatePayoutTransfer(client, payout_id, transferId);
    }
  } catch (error) {
    return false;
  }

  return true;
}

export async function getPayoutStatusAction(payout_id: string) {
  const admin = await isUserAdminAction();
  if (!admin) {
    return { error: 'You are not authorized to update payout transfer date' };
  }

  const client = getServiceRoleClient();
  const payout = await getPayoutById(client, payout_id);
  if (payout.data?.burn) {
    const burnData = await getBurnById(client, Number(payout.data.burn));
    payout.data.burnDate = burnData.data?.created_at ?? null;
  }

  if (payout.data?.transfer) {
    const transferData = await getTransferById(
      client,
      Number(payout.data.transfer)
    );
    payout.data.transferDate = transferData.data?.created_at ?? null;
  }
  return { payout };
}

export const burnTokenFromPlaceAccountAction = async (
  amount: string,
  to: string,
  description: string
) => {
  const { address: tokenAddress } = Config.community.primary_token;
  const communityConfig = new CommunityConfig(Config);
  const bundlerService = new BundlerService(communityConfig);

  const serverWalletPrivateKey =
    process.env['SERVER_GNOSIS_WALLET_PRIVATE_KEY'] ?? '';

  if (!serverWalletPrivateKey) {
    throw new Error('Signer cannot be found');
  }

  const signer = new Wallet(serverWalletPrivateKey);
  const signerAccountAddress = await getAccountAddress(
    new CommunityConfig(Config),
    signer.address
  );

  if (!signerAccountAddress) {
    throw new Error('Signer account address cannot be found');
  }

  try {
    await bundlerService.burnFromERC20Token(
      signer,
      tokenAddress,
      signerAccountAddress,
      to,
      amount,
      description
    );
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      throw error; // Rethrow the original error object
    }
    throw new Error('Failed to burn tokens'); // Fallback error message for non-Error objects
  }
};
