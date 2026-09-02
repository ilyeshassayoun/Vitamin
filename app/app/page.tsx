import { requireChatGPTUser } from '../chatgpt-auth';
import { Dashboard } from './dashboard';

export const dynamic = 'force-dynamic';

export default async function AppPage() {
  const user = await requireChatGPTUser('/app');
  return <Dashboard displayName={user.displayName} />;
}
