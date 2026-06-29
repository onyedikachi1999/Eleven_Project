import { getDb } from "../api/queries/connection";
import {
  testimonies,
  prayers,
  prayerCircles,
  scheduledPrayers,
  forumTopics,
  forumReplies,
  comments,
  savedItems,
  prayerResponses,
  circleMembers,
} from "./schema";

async function clear() {
  const db = getDb();
  await db.delete(comments);
  await db.delete(savedItems);
  await db.delete(prayerResponses);
  await db.delete(circleMembers);
  await db.delete(forumReplies);
  await db.delete(forumTopics);
  await db.delete(scheduledPrayers);
  await db.delete(prayerCircles);
  await db.delete(prayers);
  await db.delete(testimonies);
  console.log("All tables cleared");
}

clear().catch(console.error);
