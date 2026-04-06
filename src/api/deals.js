import { client, databases, DATABASE_ID, COLLECTIONS, ID, Query } from '../appwriteClient.js';
import { Permission, Role } from 'appwrite';

export const DEAL_STATUS = {
  REQUESTED: 'requested',
  ACCEPTED: 'accepted',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  REJECTED: 'rejected',
};

export async function createDeal({
  creatorId,
  scoutId,
  postId = '',
  dealType = 'hire', // hire | collab | message
  projectTitle = '',
  roleRequired = '',
  location = '',
  duration = '',
  budget = '',
  message = '',
} = {}) {
  if (!creatorId) throw new Error('Missing creatorId');
  if (!scoutId) throw new Error('Missing scoutId');

  const permissions = [
    Permission.read(Role.user(creatorId)),
    Permission.read(Role.user(scoutId)),
    Permission.update(Role.user(creatorId)),
    Permission.update(Role.user(scoutId)),
    Permission.delete(Role.user(creatorId)),
    Permission.delete(Role.user(scoutId)),
  ];

  const payload = compactPayload({
    creatorId,
    scoutId,
    postId,
    dealType,
    projectTitle,
    roleRequired,
    location,
    duration,
    budget,
    message,
    status: DEAL_STATUS.REQUESTED,
  });

  try {
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.DEALS, ID.unique(), payload, permissions);
  } catch (error) {
    throw mapSchemaError('deals', error);
  }
}

export async function getDeal(dealId) {
  return databases.getDocument(DATABASE_ID, COLLECTIONS.DEALS, dealId);
}

export async function updateDealStatus(dealId, status) {
  try {
    return await databases.updateDocument(DATABASE_ID, COLLECTIONS.DEALS, dealId, { status });
  } catch (error) {
    throw mapSchemaError('deals', error);
  }
}

export async function listDealMessages(dealId, { limit = 50 } = {}) {
  try {
    const res = await databases.listDocuments(DATABASE_ID, COLLECTIONS.MESSAGES, [
      Query.equal('dealId', dealId),
      Query.orderAsc('$createdAt'),
      Query.limit(limit),
    ]);
    return res.documents;
  } catch (error) {
    throw mapSchemaError('messages', error);
  }
}

export async function sendDealMessage({ dealId, senderId, text, participantIds }) {
  if (!dealId) throw new Error('Missing dealId');
  if (!senderId) throw new Error('Missing senderId');
  if (!text?.trim()) throw new Error('Empty message');
  if (!Array.isArray(participantIds) || participantIds.length < 2) throw new Error('Missing participants');

  const permissions = [
    Permission.read(Role.user(participantIds[0])),
    Permission.read(Role.user(participantIds[1])),
    Permission.update(Role.user(participantIds[0])),
    Permission.update(Role.user(participantIds[1])),
    Permission.delete(Role.user(participantIds[0])),
    Permission.delete(Role.user(participantIds[1])),
  ];

  const payload = { dealId, senderId, text: text.trim() };
  try {
    return await databases.createDocument(DATABASE_ID, COLLECTIONS.MESSAGES, ID.unique(), payload, permissions);
  } catch (error) {
    throw mapSchemaError('messages', error);
  }
}

export async function subscribeDealMessages(dealId, callback) {
  return client.subscribe(`databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`, (evt) => {
    const payload = evt.payload;
    if (payload?.dealId === dealId) callback(evt);
  });
}

function compactPayload(obj) {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    out[k] = v;
  });
  return out;
}

function mapSchemaError(collectionLabel, error) {
  const raw = String(error?.message || '');
  const unknown = raw.match(/unknown attribute: \"?([^\"']+)\"?/i)?.[1];
  const missing = raw.match(/missing required attribute: \"?([^\"']+)\"?/i)?.[1];

  if (unknown) {
    return new Error(
      `Appwrite ${collectionLabel} schema mismatch: unknown field "${unknown}". Add it to the collection attributes or update the client payload.`
    );
  }
  if (missing) {
    return new Error(
      `Appwrite ${collectionLabel} schema mismatch: missing required field "${missing}". Add it to the payload or relax the collection requirement.`
    );
  }

  if (error?.code === 401 || error?.code === 403) {
    return new Error(`Permission denied for ${collectionLabel}. Ensure the document permissions allow both participants to read/write.`);
  }

  if (error?.code === 404) {
    return new Error(`Missing Appwrite collection for ${collectionLabel}. Create the "${collectionLabel}" collection in database "${DATABASE_ID}".`);
  }

  return error instanceof Error ? error : new Error(raw || 'Request failed.');
}
