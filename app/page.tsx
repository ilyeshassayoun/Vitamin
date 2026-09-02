import { getChatGPTUser } from './chatgpt-auth';
import { VitaminPreview } from './vitamin-preview';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getChatGPTUser();
  return <VitaminPreview signedInName={user?.displayName ?? null} />;
}
